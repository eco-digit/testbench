from collections import defaultdict
from logging import getLogger
from os.path import basename
from pathlib import Path
from datetime import datetime, timedelta
from cloud.boavizta import calculate_hyperscaler


import yaml

from db import timescale_service
from entities import MeasuredGuest, Measurement, DataSet
from guest.mobile.mobile_guest import MobileGuest
from infrastructure_definition.models import Device

logger = getLogger(basename(__file__))

# Mapping: raw-component keys → DBR group keys (compute / memorize / store / transfer)
key_mapping = {"CPU": "compute", "RAM": "memorize", "SSDHDD": "store", "NW": "transfer"}

# Composition of component groups for DBR aggregation
# Note: compute currently CPU-only (GPU not integrated yet)
component_groups = {
    "compute": ["CPU", "GPU"],
    "memorize": ["RAM"],
    "store": ["SSD", "HDD"],
    "transfer": ["Ports"],
}

# Default idle loads of the test stand (baseline idle utilization)
# Units: 0–1 (dimensionless shares)
# TODO wird idealerweise aus Prüfstandsmessung/Config geladen
load_idle = {"CPU": 0.1, "GPU": 0, "RAM": 0.05, "SSDHDD": 0.25, "NW": 0.01}


def calculate_score_mobile(mobile_guest: MobileGuest) -> float:
    with open(f"{Path(__file__).parent}/calculation_config.yaml", "r") as file:
        config = yaml.safe_load(file)

    if mobile_guest.measurement_result is None:
        return 0.0

    measurement_duration_in_s = mobile_guest.measurement_result.duration
    measurement_consumption_in_kwh = mobile_guest.measurement_result.ws / 3600 / 1000

    environmental_impacts = {
        "CED": measurement_consumption_in_kwh * config["emission_factors"]["CED"]
    }
    logger.debug(
        "Umweltwirkungen – Nutzung (environmental_impacts_usephase): %s",
        environmental_impacts,
    )

    # 9) PEF normalization & weighting → indicator for Eco:Digit-Score
    environmental_impacts_normalized_and_weighted = (
        calc_environmental_impacts_normalized_and_weighted(
            environmental_impacts,
            config["normalization_emission_factors"],
            config["pef_weights"],
        )
    )
    logger.debug(
        "environmental_impacts_normalized_and_weighted: %s",
        environmental_impacts_normalized_and_weighted,
    )

    # 10) Final ECO:DIGIT Score
    eco_digit_score = calc_eco_digit_score(
        environmental_impacts_normalized_and_weighted
    )

    return eco_digit_score


def calculate_single_eco_digit_score(
    device: Device,
    measured_guest: MeasuredGuest,
    datasets: list[DataSet],
    time_execution,
    skip_embedded: bool = False,
):
    """
    Calculates the Eco:Digit-Score for a measured software execution.

    Data & unit definitions:
    - lifetime: years (365 days → 8760 h/year). Conversion to seconds happens internally.
    - DBR (Digital Basic Resources, device.performance.to_dbr_dict()):
        compute:  GHz*bit  (CPU-only; GPU not integrated yet)
        memorize: GB
        store:    GB
        transfer: Mbit/s
    - average_load (device.average_load.to_load_average_dict()):
        fraction 0..1 per DBR (over platform lifetime)
    - time_execution: seconds (duration of the scenario test)
    - load_idle: idle fractions 0..1 per raw component (CPU, GPU, RAM, SSDHDD, NW).
      If None → default values (load_idle)
    - device.embedded / device.embedded_per_dbr: see calc_ebr_embedded docstring.

    Process:
      1) EBR_embedded (manufacturing per work unit) from embedded data & DW_hardware
      2) EBR_P (use-phase power per work unit) from power profiles & DBR_average
      3) Measured gross load → net load = gross - idle
      4) DW_SW (digital work of the software) = net_load * DBR * time_execution
      5) EI_embedded (DW_SW × EBR_embedded)
      6) Energy [kWh] = DW_SW × EBR_P / 3600 / 1000 → EI_usephase via emission factors
      7) Sum, normalization (PEF) & weighting → Eco:Digit-Score
    """

    # Load environmental constants for the calculation
    with open(f"{Path(__file__).parent}/calculation_config.yaml", "r") as file:
        config = yaml.safe_load(file)

    # Values from the infrastructure definition

    if device.cloud_parameters and device.cloud_parameters.is_public:
        # public cloud calculation via boavizta api
        environmental_impacts_usephase = calculate_hyperscaler(
            device_definition=device, datasets=datasets, measured_guest=measured_guest
        )

        environmental_impacts_embedded = {}

    else:
        # default calculation, for servers and private cloud

        # Lifetime of hardware platform
        technical_hardware_lifetime_in_years = device.lifetime

        # DBRs = Digital Basic Resources (max capacity per component)
        # Unit per component as described above
        digital_basic_resources = device.performance.to_dbr_dict()

        # Average resource utilization over lifetime (DBRs)
        # Fraction 0..1
        load_average_of_dbr_over_lifetime_in_percentage = (
            device.average_load.to_load_average_dict()
        )

        # Netto EI_hw
        # Component-based values per environmental category (CPU, GPU, RAM, SSD, HDD, Ports, + overhead parts) + 'Sum'.
        # Used to allocate overhead proportionally to DBR groups {compute, memorize, store, transfer}.
        netto_environmental_impacts_hardware = (
            device.embedded.to_dict() if device.embedded is not None else None
        )

        # EI per DBR
        # Already aggregated values per environmental category and DBR group.
        # Has priority over netto + z-factor calculation.
        embedded_per_dbr = (
            device.embedded_per_dbr.to_dict()
            if device.embedded_per_dbr is not None
            else None
        )

        # Pre-calculation according to methodology, sheet EBR
        # Effort Benefit Ratio (EBR): environmental impacts per unit of actually used hardware performance

        # 1) EBR values for manufacturing per DBR
        ebr_embedded = calc_ebr_embedded(
            netto_environmental_impacts_hardware,
            embedded_per_dbr,
            technical_hardware_lifetime_in_years,
            digital_basic_resources,
            load_average_of_dbr_over_lifetime_in_percentage,
        )
        logger.debug("ebr_embedded: %s", ebr_embedded)

        # 2) EBR values for use-phase power per DBR
        ebr_p = calc_ebr_power(
            digital_basic_resources,
            load_average_of_dbr_over_lifetime_in_percentage,
            device,
        )
        logger.debug("ebr_p: %s", ebr_p)

        # Main calculation according to methodology, sheet EI_Software

        # 3) Gross load during execution (0..1 fractions)
        load_average_gross_in_percentage = calc_gross_load_average_for_measured_guest(
            measured_guest
        )
        logger.debug("load_average_gross: %s", load_average_gross_in_percentage)

        # 4) Net load during execution = gross - idle
        load_average_net_in_percentage = calc_net_load_average(
            load_average_gross_in_percentage, load_idle
        )
        logger.debug("load_average_net: %s", load_average_net_in_percentage)

        # 5) Digital work per DBR (DW = net_load * max DBR * time_execution)
        # Units: compute → GHz*bit*s, memorize/store → GB*s, transfer → Mbit
        digital_work_by_dbr = calc_digital_work(
            load_average_net_in_percentage, digital_basic_resources, time_execution
        )
        logger.debug("digital_work: %s", digital_work_by_dbr)

        # 6) Environmental impacts of manufacturing allocated to this software
        # Units: depends on impact category (MJ, kg CO2e, etc.)
        environmental_impacts_embedded = calc_environmental_impacts_embedded(
            digital_work_by_dbr, ebr_embedded
        )
        logger.debug(
            "Umweltwirkungen – Herstellung (environmental_impacts_embedded): %s",
            environmental_impacts_embedded,
        )

        # 7) Energy consumption (kWh) during execution & use-phase EI
        runtime_energy_consumption_in_kWh = calc_runtime_energy_consumption(
            digital_work_by_dbr, ebr_p
        )
        logger.debug(
            # relevant value for runtime validation
            "Energieverbrauch [kWh] (runtime_energy_consumption_in_kWh): %s",
            runtime_energy_consumption_in_kWh,
        )

        environmental_impacts_usephase = calc_environmental_impacts_usephase(
            runtime_energy_consumption_in_kWh, config["emission_factors"]
        )
        logger.debug(
            "Umweltwirkungen – Nutzung (environmental_impacts_usephase): %s",
            environmental_impacts_usephase,
        )

    # 8) Total impacts = manufacturing + use-phase
    environmental_impacts_total = combine_environmental_impacts(
        environmental_impacts_usephase, environmental_impacts_embedded
    )
    logger.debug(
        "Gesamt-Umweltwirkungen (environmental_impacts_total): %s",
        environmental_impacts_total,
    )

    # 9) PEF normalization & weighting → indicator for Eco:Digit-Score
    environmental_impacts_normalized_and_weighted = (
        calc_environmental_impacts_normalized_and_weighted(
            environmental_impacts_total,
            config["normalization_emission_factors"],
            config["pef_weights"],
        )
    )
    logger.debug(
        "environmental_impacts_normalized_and_weighted: %s",
        environmental_impacts_normalized_and_weighted,
    )

    # 10) Final ECO:DIGIT Score
    eco_digit_score = calc_eco_digit_score(
        environmental_impacts_normalized_and_weighted
    )

    # Store results in the measured guest
    for key, value in environmental_impacts_total.items():
        attr = key.lower()
        if hasattr(measured_guest, attr):
            setattr(measured_guest, attr, value)
    measured_guest.eco_digit_score = eco_digit_score

    return eco_digit_score


def calculate_total_results(measurement: Measurement):
    """
    Aggregates the results of all MeasuredGuests at measurement level.
    """
    measurement.total_eco_digit_score = 0.0
    measurement.total_ced = 0.0
    measurement.total_gwp = 0.0
    measurement.total_adp = 0.0
    measurement.total_water = 0.0
    measurement.total_weee = 0.0
    measurement.total_tox = 0.0

    for measured_guests in measurement.measured_guests:
        measurement.total_eco_digit_score += measured_guests.eco_digit_score or 0.0
        measurement.total_ced += measured_guests.ced or 0.0
        measurement.total_gwp += measured_guests.gwp or 0.0
        measurement.total_adp += measured_guests.adp or 0.0
        measurement.total_water += measured_guests.water or 0.0
        measurement.total_weee += measured_guests.weee or 0.0
        measurement.total_tox += measured_guests.tox or 0.0


def calc_gross_load_average_for_measured_guest(measured_guest):
    """
    Returns:
        dict: gross load (0..1) for compute, transfer, store, memorize
    """

    # CPU load = CPU time / measurement duration (assuming single-thread)
    load_compute = measured_guest.average_cpu_usage / 100

    # Network load
    load_transfer = measured_guest.average_network_usage / 100

    # Storage load
    load_store = measured_guest.average_storage_usage / 100

    # RAM load
    load_memorize = measured_guest.average_ram_usage_without_overhead / 100

    return {
        "CPU": min(load_compute, 1.0),
        "NW": min(load_transfer, 1.0),
        "SSDHDD": min(load_store, 1.0),
        "RAM": min(load_memorize, 1.0),
    }


def calc_dbr_average(dbr_values, load_average):
    """
    DBR_average = DBR * load_average (over lifetime).
    Units: see main docstring of calculate_single_eco_digit_score().
    """
    result = {
        output_key: dbr_values[input_key] * load_average[input_key]
        for input_key, output_key in key_mapping.items()
    }
    return result


# TODO Interpolation in HW_Usephase statt P_average
# 	• Basis für berechnung von P_brutto_average_co
#   • Dieses wiederum basis für berechnung des EBR_p
def calc_ebr_power(dbr_values, load_average, device: Device):
    """
    EBR_P[dbr] = P_brutto_average[dbr] / DBR_average[dbr]
    P_brutto_average is derived from power profiles.
    DBR_average = DBR * load_average.
    Note: compute is CPU-only (GPU not integrated yet)
    """
    dbr_average = calc_dbr_average(dbr_values, load_average)
    logger.debug("dbr_average", dbr_average)

    power_brutto_average = None

    if device.power_profile is None and device.power_profile_per_hardware is None:
        raise Exception("power_profile missing in Infrastructure-Definition")

    # P_brutto_average[dbr] in Watt
    elif device.power_profile_per_hardware is not None:
        logger.info("calculate ebr_power using power_profile_per_hardware")

        # Sum of the individual component averages
        power_averages = device.power_profile_per_hardware.to_average_load_dict()
        total_power_avg = sum(power_averages.values())

        # z_factor per component and P_brutto_average per DBR
        power_brutto = {}
        for comp, val in power_averages.items():
            z = val / total_power_avg
            power_brutto[comp] = device.power_profile_per_hardware.total_average * z

        power_brutto_average = {
            "compute": power_brutto["CPU"] + power_brutto["GPU"],
            "memorize": power_brutto["RAM"],
            "store": power_brutto["SSD"] + power_brutto["HDD"],
            "transfer": power_brutto["NW"],
        }

    elif device.power_profile is not None:
        logger.info("calculate ebr_power using power_profile")
        power_brutto_average = device.power_profile.to_average_load_dict()

    # EBR_P = Watt / DBR_average-unit
    ebr_power = {
        key: power_brutto_average[key] / dbr_average[key]
        for key in power_brutto_average
    }

    """

    # TODO  interpolation an richtige stelle einbringen
    p_interpoliert = {
        "compute" : interpolate_energy(power_profile.compute.profile,device.average_load.co * 100),
        "memorize" : interpolate_energy(power_profile.memorize.profile,device.average_load.me * 100),
        "store" : interpolate_energy(power_profile.store.profile,device.average_load.st * 100),
        "transfer" : interpolate_energy(power_profile.transfer.profile,device.average_load.tr * 100)
    }
    logger.debug("p_INTER: %s",p_interpoliert)
    #TODO interpolieren aus pidletotal und pmaxtotal
    p_inter_total = 174


    total_inter = sum(p_interpoliert.values())
    p_brutto_int = {}
    for comp, val in p_interpoliert.items():
        z_int = val / total_inter
        p_brutto_int[comp] = p_inter_total * z_int
    logger.debug("p_brutto_int %s",p_brutto_int)


    EBR_P_int = {
        key: p_brutto_int[key] / dbr_average[key]
        for key in p_brutto_int
    }
    
        """

    logger.debug("EBR_power %s", ebr_power)
    return ebr_power


def calc_ebr_embedded(
    netto_environmental_impacts_hardware,
    embedded_per_dbr,
    lifetime,
    dbr_values,
    load_average,
):
    """
    Calculates EBR_embedded (manufacturing impact per DBR and category):
    EBR_ei[dbr] = Embedded_dbr / DW_hardware[dbr]
    where
    DW_hardware[dbr] = DBR[dbr] * Load_average[dbr] * lifetime_years * 8760 * 3600

    Data sources:
    - embedded_per_dbr (preferred): already aggregated values per category and DBR
    - netto_environmental_impacts_hardware: component-level values (CPU, GPU, RAM, SSD, HDD, Ports) incl. 'Sum' (gross)
      overhead allocation via z-factors to dbr (compute/memorize/store/transfer)

    Units:
    Embedded_dbr: per category (e.g. CED in MJ, GWP in kg CO2e, ...)
    EBR_ei: e.g. MJ/(GHz*bit*s), kgCO2e/(GB*s), ...

    Note: compute DW currently CPU-only (no GPU share)
    """

    # Digital work of hardware over its lifetime
    digital_work_values = {
        k: dbr_values[k] * load_average[k] * lifetime * 8760 * 3600 for k in dbr_values
    }

    environmental_impacts_per_dbr = None
    if netto_environmental_impacts_hardware is None and embedded_per_dbr is None:
        raise Exception("environmental impacts missing in Infrastructure-Definition")
    elif embedded_per_dbr:
        environmental_impacts_per_dbr = embedded_per_dbr
    elif netto_environmental_impacts_hardware:
        # allocate overhead via z-factors
        z_factors = calculate_z_factors(netto_environmental_impacts_hardware)
        environmental_impacts_per_dbr = calc_environmental_impacts_per_dbr(
            netto_environmental_impacts_hardware, z_factors
        )

    ebr_embedded = {}

    # per category & per DBR
    for category, impacts in environmental_impacts_per_dbr.items():
        ebr_embedded[category] = {
            output_key: (
                impacts[output_key] / digital_work_values[input_key]
                if digital_work_values.get(input_key) not in [0, None]
                else 0
            )
            for input_key, output_key in key_mapping.items()
        }

    return ebr_embedded


def calculate_z_factors(netto_environmental_impacts_hardware):
    """
    Calculates z-factors per impact category from NETTO component values (CPU, GPU, RAM, SSD, HDD, Ports).
    z_dbr = (sum of components of the DBR group) / (sum of all mentioned component values)
    Overhead components and 'Sum' are NOT included.
    Note: GPU is included in compute; DW/DBR is currently CPU-only → for GPU>0 ensure consistent handling.
    """
    result = {}

    for category, components in netto_environmental_impacts_hardware.items():
        try:
            sum_over_all_components = sum(
                components.get(comp, 0)
                for group in component_groups.values()
                for comp in group
            )

            result[category] = {
                key: (
                    # Sum over all components = z-factor of component group
                    sum(components.get(comp, 0) for comp in group)
                    / sum_over_all_components
                    if sum_over_all_components != 0
                    else 0
                )
                for key, group in component_groups.items()
            }

        except Exception as e:
            logger.debug(f"Fehler in Kategorie '{category}': {e}")
            result[category] = {k: 0 for k in component_groups}

    return result


def calc_environmental_impacts_per_dbr(netto_environmental_impacts_hardware, z_factors):
    """
    Distributes the gross total 'Sum' proportionally across compute/memorize/store/transfer
    using the z-factors. Assumes netto_environmental_impacts_hardware[category]['Sum'] exists.
    """

    default_keys = ["compute", "memorize", "store", "transfer"]

    return {
        category: {
            key: netto_environmental_impacts_hardware[category].get("Sum", 0)
            * z_factors.get(category, {}).get(key, 0)
            for key in default_keys
        }
        for category in netto_environmental_impacts_hardware
    }


def calc_net_load_average(load_average_gross, load_idle):
    """
    Net load = max(0, gross - idle) per raw component (CPU, GPU, RAM, SSDHDD, NW).
    """
    return {
        k: max(0, load_average_gross[k] - load_idle.get(k, 0))
        for k in load_average_gross
    }


def calc_digital_work(load_average_net, digital_basic_resources, time_execution):
    """
    DW_SW[dbr] = Load_net[input_key] * DBR[input_key] * time_execution [s]
    Mapping via key_mapping (CPU→compute, RAM→memorize, SSDHDD→store, NW→transfer)
    """
    return {
        output_key: load_average_net[input_key]
        * digital_basic_resources[input_key]
        * time_execution
        for input_key, output_key in key_mapping.items()
    }


def calc_runtime_energy_consumption(digital_work, ebr_p):
    """
    Energy [kWh] during use:
        E = Σ( DW_SW[dbr] * EBR_P[dbr] ) / 3600 / 1000
    (W·s → Wh → kWh)
    """
    return {k: digital_work[k] * ebr_p[k] / 1000 / 3600 for k in digital_work}  # kWh


def calc_environmental_impacts_usephase(runtime_energy_consumption, emission_factors):
    """
    EI_usephase[impact] = Σ_dbr (E_kWh[dbr] * emission_factor_impact)
    Emission factors apply equally across all DBR groups (electricity mix).
    """
    return {
        impact: sum(
            runtime_energy_consumption[k] * emission_factors[impact]
            for k in runtime_energy_consumption
        )
        for impact in emission_factors
    }


def calc_environmental_impacts_embedded(digital_work, ebr_emb):
    """
    EI_embedded[impact] = Σ_dbr (DW_SW[dbr] * EBR_embedded[impact][dbr])
    """
    return {
        impact: sum(digital_work[k] * ebr_emb[impact][k] for k in digital_work)
        for impact in ebr_emb
    }


def combine_environmental_impacts(
    environmental_impacts_usephase, environmental_impacts_embedded
):
    """
    EI_total[impact] = EI_usephase[impact] + EI_embedded[impact]
    """
    return {
        k: environmental_impacts_usephase[k] + environmental_impacts_embedded.get(k, 0)
        for k in environmental_impacts_usephase
    }


def calc_environmental_impacts_normalized_and_weighted(
    environmental_impacts_total, normalization_emission_factors, pef_weights
):
    """
    Normalized & Weighted impacts = total * normalization_factor * pef_weight
    (per impact category)
    """
    return {
        k: environmental_impacts_total[k]
        * normalization_emission_factors[k]
        * pef_weights[k]
        for k in environmental_impacts_total
    }


def calc_eco_digit_score(environmental_impacts_normalized_and_weighted):
    """
    Eco:Digit-Score = Σ_k (normalized_and_weighted[k])
    """
    return sum(environmental_impacts_normalized_and_weighted.values())


def interpolate_energy(power_profile_data, x):
    sorted_data = sorted(power_profile_data.items())
    x_values = [x for x, _ in sorted_data]
    y_values = [y for _, y in sorted_data]
    if x in power_profile_data:
        return power_profile_data[x]
    for i in range(len(x_values) - 1):
        if x_values[i] < x < x_values[i + 1]:
            x0, y0 = x_values[i], y_values[i]
            x1, y1 = x_values[i + 1], y_values[i + 1]
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    if x < x_values[0]:
        x0, y0 = x_values[0], y_values[0]
        x1, y1 = x_values[1], y_values[1]
    else:
        x0, y0 = x_values[-2], y_values[-2]
        x1, y1 = x_values[-1], y_values[-1]

    return y0 + (y1 - y0) * (x - x0) / (x1 - x0)


def calculate_utilization_in_buckets(
    utilization_timestamps, resolution=11, num_cores=1
):
    """
    Aggregates all utilization percentages over time and puts them into buckets,
    e.g. 0% utilization: 10% of the time, 50% utilization: 40% of the time, 100% utilization: 50% of the time.
    Written for using the boavizta api for hyperscalers.

    Args:
        utilization_timestamps: # TODO: integrate into actual measurement metrics
        resolution (int): number of utilization-'buckets' between 0 and 100. 11 buckets means 0-100% in increments of 10.
        num_cores (int): number of cores, relevant because they increase maximum possible cpu time per second, decreasing overall utilization percentage (2 cores -> 2 cpu_time per second possible.)

    Returns:
        dict[float, float]: Ordered dictionary with 'buckets' as specified above. Accumulated usage percentages are rounded to the nearest bucket separately for each measurement interval.
    """

    # Validate input parameters
    if resolution < 3:
        raise ValueError("Resolution must be at least 3")

    if not utilization_timestamps:
        return {}

    num_timestamps = len(utilization_timestamps)
    if num_timestamps < 2:
        return {}

    # Define 'buckets'
    step_interval = round(100.0 / (resolution - 1), 8)
    utilization_buckets = [round(i * step_interval, 8) for i in range(resolution)]

    dateformat = "%Y-%m-%dT%H:%M:%S.%f"

    # Calculate total time span
    # using explicit types, because they seemed to change a few times during refactoring
    start_time: datetime = utilization_timestamps[0].timestamp
    end_time: datetime = utilization_timestamps[-1].timestamp
    # total_time = max(end_time - start_time, 0.0001)  # Avoid division by zero
    delta_seconds: timedelta = end_time - start_time

    if delta_seconds <= timedelta(seconds=0):
        print("NOPE too short")
        return {}

    utilization_results = defaultdict(float)

    for i in range(num_timestamps - 1):
        current_ts: DataSet = utilization_timestamps[i]
        next_ts: DataSet = utilization_timestamps[i + 1]

        interval_duration: timedelta = next_ts.timestamp - current_ts.timestamp
        cpu_time_increase: float = next_ts.cpu_usage - current_ts.cpu_usage

        utilization_percentage = (
            cpu_time_increase / num_cores / interval_duration.total_seconds() * 100
        )

        # Weighted fractional contribution based on interval duration relative to total time
        weighted_contribution: float = (
            interval_duration.total_seconds() / delta_seconds.total_seconds()
        )

        threshold_percentage = find_closest_neighbor(
            utilization_percentage, utilization_buckets
        )

        utilization_results[threshold_percentage] += weighted_contribution

    # sorting output
    sorted_thresholds = sorted(utilization_results.keys())
    ordered_utilization_results = {
        threshold: utilization_results[threshold] for threshold in sorted_thresholds
    }

    return dict(ordered_utilization_results)


def find_closest_neighbor(number, sorted_list):

    # Input validation
    if not isinstance(number, (int, float)) and sorted_list:
        return None

    # Early returns for edge cases
    first_val = sorted_list[0]
    last_val = sorted_list[-1]

    if number <= first_val:
        return first_val
    if number >= last_val:
        return last_val

    # Binary search implementation
    low, high = 0, len(sorted_list) - 1

    while low <= high:
        mid = (low + high) // 2

        # TODO: does this need an extra method?
        if rounded_number(number, sorted_list[mid]):
            return sorted_list[mid]

        elif number < sorted_list[mid]:
            high = mid - 1
        else:
            low = mid + 1

    # Compare boundary values after loop completes
    candidate_low = sorted_list[low - 1] if low > 0 else float("inf")
    candidate_high = sorted_list[low] if low < len(sorted_list) else float("inf")

    # Calculate absolute differences
    diff_low = abs(candidate_low - number)
    diff_high = abs(candidate_high - number)

    return candidate_low if diff_low <= diff_high else candidate_high


def rounded_number(a, b):
    """Helper function to compare floating-point numbers"""
    threshold = abs(b - a) <= max(abs(a), abs(b)) * 1e-8
    return threshold
