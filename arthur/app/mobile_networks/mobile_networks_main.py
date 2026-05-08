# SPDX-FileCopyrightText: 2025 Siemens AG <https://siemens.com>
#
# SPDX-License-Identifier: MIT

"""
Calculates the power and energy consumption of a 5G network based on the infrastructure definition,
radio resource models and power consumption models.

Usage: mobile_networks_main.py INPUT OUTPUT

Arguments:
    INPUT     input parameter json file
    OUTPUT    output directory
"""

import os
from os.path import join

from config import Config
from .models.models import MobileNetworkProfile

# import docopt
try:
    from docopt import docopt
except ImportError:
    exit(
        "This requires that `docopt` command-line interface"
        " is installed: \n    pip install docopt\n"
    )

# import schema
try:
    from schema import And
    from schema import Schema
    from schema import SchemaError
    from schema import Use
except ImportError:
    exit(
        "This requires that `schema` data-validation library"
        " is installed: \n    pip install schema\n"
        "https://github.com/halst/schema"
    )

# import utilities
from .utilities.parameter_parser import InputParameterParser
from .utilities.parameter_parser import TemplateParser
from .utilities.parameter_parser import dump_output_json

# import infrastructure models
import mobile_networks.infrastructure_models.nr_5g.network_model_5g as network_model_5g
import mobile_networks.infrastructure_models.nr_5g.hardware_5g as hardware_5g
import mobile_networks.infrastructure_models.generic_network_hardware as generic_network_hardware
import mobile_networks.radio_resource_models.nr_radio_resource_model as nr_radio_resource_model

_config = Config()


def run_network(guest_measurement_values_and_specs: MobileNetworkProfile) -> float:

    # args = docopt(__doc__)
    #
    # schema = Schema(
    #     {
    #         "INPUT": And(os.path.isfile, error="INPUT should be readable"),
    #         "OUTPUT": And(os.path.exists, error="OUTPUT should exist"),
    #     }
    # )
    # try:
    #     args = schema.validate(args)
    # except SchemaError as e:
    #     print("Error: ", e)
    #     exit(e)
    #
    # output_path = args["OUTPUT"]

    # parse template json
    template_parser = TemplateParser(
        join(
            "mobile_networks",
            "templates",
            "nr_5g",
            "template_campus_siemens_draft.json",
        )
    )

    # manual entry mode of load model with distributions, use these directly
    UPLINK_PACKET_SIZE_BYTES = (
        guest_measurement_values_and_specs.UPLINK_PACKET_SIZE_BYTES
    )
    DOWNLINK_PACKET_SIZE_BYTES = (
        guest_measurement_values_and_specs.DOWNLINK_PACKET_SIZE_BYTES
    )
    UPLINK_PACKET_SIZE_PROBABILITY = (
        guest_measurement_values_and_specs.UPLINK_PACKET_SIZE_PROBABILITY
    )
    DOWNLINK_PACKET_SIZE_PROBABILITY = (
        guest_measurement_values_and_specs.DOWNLINK_PACKET_SIZE_PROBABILITY
    )
    UPLINK_PACKET_SIZE_DISTRIBUTION_BYTES = dict(
        zip(UPLINK_PACKET_SIZE_BYTES, UPLINK_PACKET_SIZE_PROBABILITY)
    )
    DOWNLINK_PACKET_SIZE_DISTRIBUTION_BYTES = dict(
        zip(DOWNLINK_PACKET_SIZE_BYTES, DOWNLINK_PACKET_SIZE_PROBABILITY)
    )
    UPLINK_PACKET_RATE = guest_measurement_values_and_specs.UPLINK_PACKET_RATE
    DOWNLINK_PACKET_RATE = guest_measurement_values_and_specs.DOWNLINK_PACKET_RATE
    UPLINK_PACKET_RATE_PROBABILITY = (
        guest_measurement_values_and_specs.UPLINK_PACKET_RATE_PROBABILITY
    )
    DOWNLINK_PACKET_RATE_PROBABILITY = (
        guest_measurement_values_and_specs.DOWNLINK_PACKET_RATE_PROBABILITY
    )
    UPLINK_PACKET_RATE_DISTRIBUTION = dict(
        zip(UPLINK_PACKET_RATE, UPLINK_PACKET_RATE_PROBABILITY)
    )
    DOWNLINK_PACKET_RATE_DISTRIBUTION = dict(
        zip(DOWNLINK_PACKET_RATE, DOWNLINK_PACKET_RATE_PROBABILITY)
    )
    # duration to be evaluated is also given
    DURATION_EVALUATED_SEC = (
        guest_measurement_values_and_specs.DURATION_EVALUATED_SECONDS
    )
    print(
        "Using duration for energy calculation from input parameters: ",
        DURATION_EVALUATED_SEC,
        " seconds",
    )

    print("\nLOAD PROFILE DISTRIBUTIONS")
    print("----------------")
    print(
        "Uplink Packet Size Distribution (bytes): ",
        UPLINK_PACKET_SIZE_DISTRIBUTION_BYTES,
    )
    print(
        "Downlink Packet Size Distribution (bytes): ",
        DOWNLINK_PACKET_SIZE_DISTRIBUTION_BYTES,
    )
    print(
        "Uplink Packet Rate Distribution (packets/s): ", UPLINK_PACKET_RATE_DISTRIBUTION
    )
    print(
        "Downlink Packet Rate Distribution (packets/s): ",
        DOWNLINK_PACKET_RATE_DISTRIBUTION,
    )

    # Calculate data rate distribution for uplink and downlink
    DOWNLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S = {}
    for (
        downlink_packet_size_bytes,
        downlink_prob,
    ) in DOWNLINK_PACKET_SIZE_DISTRIBUTION_BYTES.items():
        for (
            downlink_packet_rate,
            downlink_packet_rate_prob,
        ) in DOWNLINK_PACKET_RATE_DISTRIBUTION.items():
            downlink_data_rate = downlink_packet_size_bytes * downlink_packet_rate / 1e6
            downlink_data_rate = round(downlink_data_rate, 0)
            if downlink_data_rate in DOWNLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S:
                DOWNLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S[downlink_data_rate] += (
                    downlink_prob * downlink_packet_rate_prob
                )
            else:
                DOWNLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S[downlink_data_rate] = (
                    downlink_prob * downlink_packet_rate_prob
                )

    UPLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S = {}
    for (
        uplink_packet_size_bytes,
        uplink_prob,
    ) in UPLINK_PACKET_SIZE_DISTRIBUTION_BYTES.items():
        for (
            uplink_packet_rate,
            uplink_packet_rate_prob,
        ) in UPLINK_PACKET_RATE_DISTRIBUTION.items():
            uplink_data_rate = uplink_packet_size_bytes * uplink_packet_rate / 1e6
            uplink_data_rate = round(uplink_data_rate, 0)
            if uplink_data_rate in UPLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S:
                UPLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S[uplink_data_rate] += (
                    uplink_prob * uplink_packet_rate_prob
                )
            else:
                UPLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S[uplink_data_rate] = (
                    uplink_prob * uplink_packet_rate_prob
                )

    DOWNLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S = {}
    for data_rate, prob in DOWNLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S.items():
        number_of_ues_per_cell = (
            guest_measurement_values_and_specs.NUMBER_OF_UES_PER_CELL
        )
        total_data_rate = data_rate * number_of_ues_per_cell
        if total_data_rate in DOWNLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S:
            DOWNLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S[total_data_rate] += prob
        else:
            DOWNLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S[total_data_rate] = prob

    UPLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S = {}
    for data_rate, prob in UPLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S.items():
        number_of_ues_per_cell = (
            guest_measurement_values_and_specs.NUMBER_OF_UES_PER_CELL
        )
        total_data_rate = data_rate * number_of_ues_per_cell
        if total_data_rate in UPLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S:
            UPLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S[total_data_rate] += prob
        else:
            UPLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S[total_data_rate] = prob

    print("\nDATA RATE DISTRIBUTIONS")
    print("----------------")
    print(
        "Downlink Data Rate Distribution per UE (Mbps): ",
        DOWNLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S,
    )
    print(
        "Uplink Data Rate Distribution per UE (Mbps): ",
        UPLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S,
    )
    print(
        "Downlink Data Rate Distribution per Cell (Mbps): ",
        DOWNLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S,
    )
    print(
        "Uplink Data Rate Distribution per Cell (Mbps): ",
        UPLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S,
    )

    # Radio resource model
    downlink_per_cell_load_distribution, uplink_per_cell_load_distribution = (
        nr_radio_resource_model.RadioResourceUtilization5G.calculate_load_distribution(
            target_downlink_data_rate_distribution_Mbps=DOWNLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S,
            target_uplink_data_rate_distribution_Mbps=UPLINK_DATA_RATE_DISTRIBUTION_PER_CELL_MBIT_S,
            available_prbs=template_parser.template["radioResourceParameters"][
                "availablePRBs"
            ],
            modulation_order=template_parser.template["radioResourceParameters"][
                "modulationOrder"
            ],
            coding_rate=template_parser.template["radioResourceParameters"][
                "codingRate"
            ],
            slot_duration_ms=template_parser.template["radioResourceParameters"][
                "slotDuration_ms"
            ],
            overhead_fraction=template_parser.template["radioResourceParameters"][
                "overheadFraction"
            ],
            subcarriers_per_prb=template_parser.template["radioResourceParameters"][
                "subcarriersPerPRB"
            ],
            scaling_factor_uplink=template_parser.template["radioResourceParameters"][
                "scalingFactorUplink"
            ],
            scaling_factor_downlink=template_parser.template["radioResourceParameters"][
                "scalingFactorDownlink"
            ],
            mimo_layers_downlink=template_parser.template["radioResourceParameters"][
                "mimoLayersDownlink"
            ],
            mimo_layers_uplink=template_parser.template["radioResourceParameters"][
                "mimoLayersUplink"
            ],
            aggregated_carriers=template_parser.template["radioResourceParameters"][
                "numberOfAggregatedCarriers"
            ],
            beams_mumimo=template_parser.template["radioResourceParameters"][
                "beamsMUMIMO"
            ],
        )
    )

    downlink_per_ue_load_distribution, uplink_per_ue_load_distribution = (
        nr_radio_resource_model.RadioResourceUtilization5G.calculate_load_distribution(
            target_downlink_data_rate_distribution_Mbps=DOWNLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S,
            target_uplink_data_rate_distribution_Mbps=UPLINK_DATA_RATE_DISTRIBUTION_PER_UE_MBIT_S,
            available_prbs=template_parser.template["radioResourceParameters"][
                "availablePRBs"
            ],
            modulation_order=template_parser.template["radioResourceParameters"][
                "modulationOrder"
            ],
            coding_rate=template_parser.template["radioResourceParameters"][
                "codingRate"
            ],
            slot_duration_ms=template_parser.template["radioResourceParameters"][
                "slotDuration_ms"
            ],
            symbols_per_slot=template_parser.template["radioResourceParameters"][
                "symbolsPerSlot"
            ],
            overhead_fraction=template_parser.template["radioResourceParameters"][
                "overheadFraction"
            ],
            subcarriers_per_prb=template_parser.template["radioResourceParameters"][
                "subcarriersPerPRB"
            ],
            scaling_factor_uplink=template_parser.template["radioResourceParameters"][
                "scalingFactorUplink"
            ],
            scaling_factor_downlink=template_parser.template["radioResourceParameters"][
                "scalingFactorDownlink"
            ],
            mimo_layers_downlink=template_parser.template["radioResourceParameters"][
                "mimoLayersDownlink"
            ],
            mimo_layers_uplink=template_parser.template["radioResourceParameters"][
                "mimoLayersUplink"
            ],
            aggregated_carriers=template_parser.template["radioResourceParameters"][
                "numberOfAggregatedCarriers"
            ],
            beams_mumimo=template_parser.template["radioResourceParameters"][
                "beamsMUMIMO"
            ],
        )
    )

    print("\nLOAD DISTRIBUTIONS")
    print("----------------")
    print("Downlink Load Distribution per Cell: ", downlink_per_cell_load_distribution)
    print("Uplink Load Distribution per Cell: ", uplink_per_cell_load_distribution)
    print("Downlink Load Distribution per UE: ", downlink_per_ue_load_distribution)
    print("Uplink Load Distribution per UE: ", uplink_per_ue_load_distribution)

    number_of_ues_per_cell = guest_measurement_values_and_specs.NUMBER_OF_UES_PER_CELL
    number_of_radio_units = template_parser.template["networkParameters"][
        "numberRadioUnits"
    ]
    number_of_distributed_centralized_units = template_parser.template[
        "networkParameters"
    ]["numberDistributedCentralizedUnits"]
    number_of_core_servers = template_parser.template["networkParameters"][
        "numberCoreServers"
    ]
    number_of_switches = template_parser.template["networkParameters"]["numberSwitches"]
    cells_per_radio_unit = template_parser.template["networkParameters"][
        "cellsPerRadioUnit"
    ]
    part_slots_downlink = template_parser.template["radioResourceParameters"][
        "partSlotsDownlink"
    ]
    part_slots_uplink = template_parser.template["radioResourceParameters"][
        "partSlotsUplink"
    ]

    # create lists of devices sized according to the input parameters
    total_ues = number_of_ues_per_cell * number_of_radio_units * cells_per_radio_unit
    ues = [
        hardware_5g.UserEquipment(
            downlink_load_distribution=downlink_per_ue_load_distribution,
            uplink_load_distribution=uplink_per_ue_load_distribution,
            part_slots_downlink=part_slots_downlink,
            part_slots_uplink=part_slots_uplink,
            duration_evaluated_sec=DURATION_EVALUATED_SEC,
        )
        for _ in range(total_ues)
    ]

    rus = [
        hardware_5g.RadioUnit(
            downlink_load_distribution=downlink_per_cell_load_distribution,
            uplink_load_distribution=uplink_per_cell_load_distribution,
            part_slots_downlink=part_slots_downlink,
            part_slots_uplink=part_slots_uplink,
            duration_evaluated_sec=DURATION_EVALUATED_SEC,
        )
        for _ in range(number_of_radio_units)
    ]

    cu_dus = [
        hardware_5g.DistributedCentralizedUnit(
            duration_evaluated_sec=DURATION_EVALUATED_SEC
        )
        for _ in range(number_of_distributed_centralized_units)
    ]

    cores = [
        hardware_5g.CoreNetworkServer(duration_evaluated_sec=DURATION_EVALUATED_SEC)
        for _ in range(number_of_core_servers)
    ]

    switches = [
        generic_network_hardware.Switch(
            duration_evaluated_seconds=DURATION_EVALUATED_SEC
        )
        for _ in range(number_of_switches)
    ]

    network_5g = network_model_5g.Network5G(
        duration_evaluated_seconds=DURATION_EVALUATED_SEC,
        user_equipments=ues,
        radio_units=rus,
        distributed_centralized_units=cu_dus,
        core_network_servers=cores,
        switches=switches,
    )

    print("\nNETWORK")
    print("----------------")
    print(
        "Total Network Energy Consumption (Wh): ",
        network_5g.total_energy_consumption_Wh,
    )

    return network_5g.total_energy_consumption_Wh
