import pytest
from cloud.private_cloud.scs.flavor_naming import (
    read_specs_from_scs_flavor,
    is_valid_scs_flavor,
)


@pytest.mark.parametrize(
    "flavor",
    [
        "SCS-1V-4",
        "SCS-2C-3.5-10n",
        "SCS-8T-32-50p",
        "SCS-2Li-4-10n",
        "SCS-16C-64-200s_bms_z3",
        "SCS-8T-32uo-50p",
        "SCS-8T-32o-50p",
        "SCS-8T-32u-50p",
    ],
)
def test_valid_flavors(flavor):
    assert is_valid_scs_flavor(flavor)


@pytest.mark.parametrize(
    "flavor",
    [
        "SCS-2-4-10n",
        "TEST-1V-4",
        "SCS-2iT-4-10n",
        "bad-value",
        "",
        "SCS-2C-4ou-10n",  # wrong ram suffix order
        "SCS-2C-4iu-10n",  # wrong ram suffix
        "SCÖ-1V-4",
    ],
)
def test_invalid_flavors(flavor):
    assert not is_valid_scs_flavor(flavor)


@pytest.mark.parametrize(
    "flavor,expected",
    [
        ("SCS-1V-4", {"vcpus": 1, "ram_gib": 4, "disk_gib": None}),
        ("SCS-2C-3.5-10n", {"vcpus": 2, "ram_gib": 3.5, "disk_gib": 10}),
        ("SCS-8T-32uo-50p", {"vcpus": 8, "ram_gib": 32, "disk_gib": 50}),
        ("SCS-8T-32o-50p", {"vcpus": 8, "ram_gib": 32, "disk_gib": 50}),
        ("SCS-8T-32u-50p", {"vcpus": 8, "ram_gib": 32, "disk_gib": 50}),
        ("SCS-2Li-4-10h", {"vcpus": 2, "ram_gib": 4, "disk_gib": 10}),
        ("SCS-16C-64-200s_bms_z3", {"vcpus": 16, "ram_gib": 64, "disk_gib": 200}),
    ],
)
def test_read_specs_from_scs_flavor(flavor, expected):
    got = read_specs_from_scs_flavor(flavor)
    assert got["vcpus"] == expected["vcpus"]
    assert pytest.approx(got["ram_gib"], rel=1e-6) == expected["ram_gib"]
    assert got["disk_gib"] == expected["disk_gib"]
