import sys
import types
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[2]
if str(APP_ROOT) not in sys.path:
    sys.path.insert(0, str(APP_ROOT))

# Mocking Imports
if "guest.mobile.mobile_guest" not in sys.modules:
    guest_pkg = types.ModuleType("guest")
    sys.modules["guest"] = guest_pkg

    mobile_pkg = types.ModuleType("guest.mobile")

    sys.modules["guest.mobile"] = mobile_pkg
    mobile_guest_mod = types.ModuleType("guest.mobile.mobile_guest")

    class DummyMobileGuest:
        measurement_result = None

    mobile_guest_mod.MobileGuest = DummyMobileGuest
    sys.modules["guest.mobile.mobile_guest"] = mobile_guest_mod

import pytest
from calculation import calculation


def test_calc_net_load_average_basic():
    gross = {"CPU": 0.8, "RAM": 0.5, "SSDHDD": 0.3, "NW": 0.2}
    idle = {"CPU": 0.1, "RAM": 0.05, "SSDHDD": 0.25, "NW": 0.01}

    net = calculation.calc_net_load_average(gross, idle)

    assert net["CPU"] == pytest.approx(0.7)
    assert net["RAM"] == pytest.approx(0.45)
    assert net["SSDHDD"] == pytest.approx(0.05)
    assert net["NW"] == pytest.approx(0.19)


def test_calc_digital_work_units_and_value():
    # net load (0..1)
    load_net = {"CPU": 0.5, "RAM": 0.1, "SSDHDD": 0.2, "NW": 0.01}
    # DBR_max (Einheiten: CPU: GHz*bit, RAM/SSD: GB, NW: Mbit/s)
    dbr = {"CPU": 100.0, "RAM": 10.0, "SSDHDD": 5.0, "NW": 1.0}
    time_execution = 60.0  # s

    dw = calculation.calc_digital_work(load_net, dbr, time_execution)

    # compute = 0.5 * 100 * 60 = 3000 GHz*bit*s
    assert dw["compute"] == pytest.approx(3000.0)
    # memorize = 0.1 * 10 * 60 = 60 GB*s
    assert dw["memorize"] == pytest.approx(60.0)
    # store   = 0.2 * 5 * 60 = 60 GB*s
    assert dw["store"] == pytest.approx(60.0)
    # transfer = 0.01 * 1 * 60 = 0.6 Mbit
    assert dw["transfer"] == pytest.approx(0.6)


def test_calc_runtime_energy_consumption_kwh():
    # DW_SW in (Einheit*s)
    digital_work = {"compute": 3600.0}
    # EBR_P in W/(Einheit)
    ebr_p = {"compute": 1.0}

    energy = calculation.calc_runtime_energy_consumption(digital_work, ebr_p)

    # 3600 * 1 W = 3600 Ws = 1 Wh = 0.001 kWh
    assert energy["compute"] == pytest.approx(0.001)


def test_calc_environmental_impacts_usephase_simple():
    runtime_energy = {
        "compute": 0.5,  # kWh
        "memorize": 0.5,  # kWh
    }
    emission_factors = {
        "GWP": 0.4,  # kg CO2e / kWh
        "CED": 3.0,  # MJ / kWh
    }

    impacts = calculation.calc_environmental_impacts_usephase(
        runtime_energy, emission_factors
    )

    # Gesamtenergie = 1.0 kWh
    assert impacts["GWP"] == pytest.approx(0.4)
    assert impacts["CED"] == pytest.approx(3.0)


def test_calc_environmental_impacts_embedded_simple():
    digital_work = {
        "compute": 10.0,
        "memorize": 5.0,
    }
    # EBR_embedded: z.B. MJ/(Einheit*s)
    ebr_emb = {
        "CED": {"compute": 0.2, "memorize": 0.1},
        "GWP": {"compute": 0.01, "memorize": 0.005},
    }

    impacts = calculation.calc_environmental_impacts_embedded(digital_work, ebr_emb)

    # CED = 10*0.2 + 5*0.1 = 2.5
    assert impacts["CED"] == pytest.approx(2.5)
    # GWP = 10*0.01 + 5*0.005 = 0.125
    assert impacts["GWP"] == pytest.approx(0.125)


def test_calc_environmental_impacts_normalized_and_weighted():
    total = {"CED": 10.0, "GWP": 2.0}
    norm = {"CED": 0.5, "GWP": 2.0}
    weights = {"CED": 1.0, "GWP": 0.5}

    nw = calculation.calc_environmental_impacts_normalized_and_weighted(
        total, norm, weights
    )

    # CED: 10 * 0.5 * 1.0 = 5
    assert nw["CED"] == pytest.approx(5.0)
    # GWP:  2 * 2.0 * 0.5 = 2
    assert nw["GWP"] == pytest.approx(2.0)


def test_calc_eco_digit_score_sum():
    nw = {"CED": 5.0, "GWP": 2.0, "WATER": 0.3}
    score = calculation.calc_eco_digit_score(nw)
    assert score == pytest.approx(7.3)
