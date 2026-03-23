import os
import pytest

from cloud.adapters.boavizta_client import (
    fetch_instance_config,
    get_environmental_impacts,
)
from cloud.dtos.workload import TimeWorkloadDTO, WorkloadPoint

PROVIDER = os.getenv("BOAVIZTA_PROVIDER", "aws")
INSTANCE_TYPE = os.getenv("BOAVIZTA_INSTANCE_TYPE", "a1.4xlarge")
USAGE_LOCATION = os.getenv("BOAVIZTA_USAGE_LOCATION", "FRA")


def _workload_default() -> TimeWorkloadDTO:
    return TimeWorkloadDTO(
        points=[
            WorkloadPoint(time_percentage=50, load_percentage=0),
            WorkloadPoint(time_percentage=30, load_percentage=60),
            WorkloadPoint(time_percentage=20, load_percentage=100),
        ]
    )


def test_live_instance_config_and_impact():
    device = fetch_instance_config(
        id="vm-live-test-001",
        provider=PROVIDER,
        instance_type=INSTANCE_TYPE,
        usage_location=USAGE_LOCATION,
    )

    assert device.cpu is not None and device.cpu.cores > 0, "CPU cores must be > 0"
    assert device.ram is not None and device.ram.size_gb > 0, "RAM size must be > 0"

    workload = _workload_default()
    updated = get_environmental_impacts(device, workload, duration_hours=1)

    assert updated is device, "Should return the same CloudDevice instance"

    assert device.impacts is not None, "Impacts should be set on device"
    assert (
        isinstance(device.impacts.values, dict) and len(device.impacts.values) > 0
    ), "Impacts must be a non-empty dict"

    maybe_keys = {"gwp", "gwp_kg_co2e", "energy_kwh", "water", "water_l"}
    assert any(
        k in device.impacts.values for k in maybe_keys
    ), "Expected at least one common impact key"
