import json
import pytest
from unittest.mock import patch, MagicMock

from infrastructure_definition.repository import InfrastructureRepository
from infrastructure_definition.factory import build_devices
from infrastructure_definition.models import (
    Device,
    CPU,
    SSD,
    Performance,
    CloudParameters,
)


def _infra_with_aws(tmp_path):
    base = tmp_path
    main = base / "infra.json"

    main.write_text(
        json.dumps(
            {
                "devices": [
                    {
                        "id": "cloud-01",
                        "type": "server",
                        "average_load": {"co": 0.3, "me": 0.2, "st": 0.1, "tr": 0.05},
                        "network": {"type": "ethernet", "throughput": 10},
                        "runtime": {"gm": "debian", "os": "Debian 12"},
                        "cloud_parameters": {
                            "provider": "AWS",
                            "instance_type": "a1.4xlarge",
                            "storage_size": 64,
                            "usage_location": "FRA",
                        },
                    }
                ]
            }
        )
    )

    return base


@patch("infrastructure_definition.factory.fetch_instance_config")
def test_factory_builds_aws_cloud_device(mock_fetch, tmp_path):
    mock_instance = MagicMock()
    mock_instance.cpu.cores = 16
    mock_instance.ram.size_gb = 32
    mock_fetch.return_value = mock_instance

    base = _infra_with_aws(tmp_path)
    repo = InfrastructureRepository(str(base))
    devices = build_devices(repo, "infra.json")

    assert len(devices) == 1
    d = devices[0]

    assert isinstance(d, Device)
    assert isinstance(d.cpu, CPU)
    assert d.cpu.cores == 16

    assert d.ram == 32 * 1024**3

    assert isinstance(d.ssd, SSD)
    assert d.ssd.size == 64

    assert isinstance(d.performance, Performance)
    assert d.performance.memorize == 32 * 1024**3
    assert d.performance.store == 64 * 1024**3

    assert d.cloud_parameters.is_public is True

    assert d.embedded is None
    assert d.power_profile is None


@patch("infrastructure_definition.factory.allocate_vcpu")
@patch("infrastructure_definition.factory.read_specs_from_scs_flavor")
def test_factory_builds_scs_cloud_device(mock_flavor, mock_alloc, tmp_path):

    # mock flavor result
    mock_flavor.return_value = {"vcpus": 4, "ram_gib": 8, "disk_gib": 32}

    # mock SCS profile
    mock_alloc.return_value = {
        "performance": {"compute": {"value": 999}},
        "embedded": {"CED": {"compute": 100}},
        "power_profile": {
            "compute": {"profile": {"10": 5}, "avg": 1},
            "memorize": {"profile": {"10": 0}, "avg": 2},
            "store": {"profile": {"10": 0}, "avg": 3},
            "transfer": {"profile": {"10": 0}, "avg": 4},
        },
        "svhc_score": 7,
        "lifespan": 10,
    }

    base = tmp_path
    main = base / "infra.json"

    main.write_text(
        json.dumps(
            {
                "devices": [
                    {
                        "id": "cloud-scs-01",
                        "type": "server",
                        "average_load": {"co": 0.3, "me": 0.2, "st": 0.1, "tr": 0.05},
                        "network": {"type": "ethernet", "throughput": 10},
                        "runtime": {"gm": "debian", "os": "Debian 12"},
                        "cloud_parameters": {
                            "provider": "SCS",
                            "instance_type": "m.n1",
                            "storage_size": 32,
                        },
                    }
                ]
            }
        )
    )

    repo = InfrastructureRepository(str(base))
    devices = build_devices(repo, "infra.json")
    d = devices[0]

    assert d.cpu.cores == 4
    assert d.ram == 8 * 1024**3
    assert d.ssd.size == 32

    assert d.performance.compute == 999

    assert d.embedded.CED["compute"] == 100
    assert d.power_profile.compute.avg == 1

    assert d.cloud_parameters.is_public is False


def test_factory_unsupported_cloud_provider(tmp_path):
    base = tmp_path
    main = base / "infra.json"

    main.write_text(
        json.dumps(
            {
                "devices": [
                    {
                        "id": "bad-cloud",
                        "type": "server",
                        "average_load": {"co": 0.3, "me": 0.2, "st": 0.1, "tr": 0.05},
                        "network": {"type": "ethernet", "throughput": 10},
                        "runtime": {"gm": "debian", "os": "Debian 12"},
                        "cloud_parameters": {
                            "provider": "UNKNOWN",
                            "instance_type": "x",
                            "storage_size": 10,
                        },
                    }
                ]
            }
        )
    )

    repo = InfrastructureRepository(str(base))

    with pytest.raises(Exception):
        build_devices(repo, "infra.json")
