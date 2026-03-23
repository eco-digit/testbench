import json
from infrastructure_definition.repository import InfrastructureRepository
from infrastructure_definition.factory import build_devices
from infrastructure_definition.models import (
    Device,
    PowerProfile,
    PowerProfilePerHardware,
    EmbeddedData,
)


def _write_infra(tmp_path):
    base = tmp_path
    main = base / "infrastructure_definition.json"
    spec = base / "server_specs.json"

    main.write_text(
        json.dumps(
            {
                "devices": [
                    {
                        "id": "srv-01",
                        "type": "server",
                        "average_load": {"co": 0.3, "me": 0.2, "st": 0.1, "tr": 0.05},
                        "network": {"type": "ethernet", "throughput": 10},
                        "runtime": {"gm": "debian", "os": "Debian 12"},
                        "reference": "server_specs.json",
                    }
                ]
            }
        )
    )

    spec.write_text(
        json.dumps(
            {
                "svhc_score": 5,
                "cpu": {
                    "count": 2,
                    "cores": 64,
                },
                "ram": {"count": 8, "size": 32},
                "ssd": {"count": 4, "size": 64},
                "performance": {
                    "compute": {"value": 2, "unit": "GiB"},
                    "memorize": {"value": 16, "unit": "GiB"},
                    "store": {"value": 1, "unit": "TB"},
                    "transfer": {"value": 1, "unit": "Gb"},
                },
                "power_profile": {
                    "compute": {"profile": {"0.1": 50}, "avg": 220.0},
                    "memorize": {"profile": {"0.1": 10}, "avg": 60.0},
                    "store": {"profile": {"0.1": 20}, "avg": 40.0},
                    "transfer": {"profile": {"0.1": 15}, "avg": 30.0},
                },
                "power_profile_per_hardware": {
                    "CPU": {"profile": {"0.5": 150}, "avg": 180.0},
                    "GPU": {"profile": {"0.5": 0}, "avg": 0.0},
                    "RAM": {"profile": {"0.5": 30}, "avg": 35.0},
                    "SSD": {"profile": {"0.5": 20}, "avg": 25.0},
                    "HDD": {"profile": {"0.5": 0}, "avg": 0.0},
                    "NW": {"profile": {"0.5": 10}, "avg": 12.0},
                    "total_avg": 252.0,
                },
                "embedded": {
                    "CED": {"compute": 1000.0},
                    "GWP": {"compute": 200.0},
                    "ADP": {},
                    "Water": {},
                    "WEEE": {},
                    "TOX": {},
                },
                "embedded_per_dbr": {
                    "CED": {"compute": 900.0},
                    "GWP": {"compute": 180.0},
                    "ADP": {},
                    "Water": {},
                    "WEEE": {},
                    "TOX": {},
                },
            }
        )
    )

    return base


def test_factory_builds_device_correctly(tmp_path):
    base = _write_infra(tmp_path)
    repo = InfrastructureRepository(str(base))
    devices = build_devices(repo, "infrastructure_definition.json")

    assert len(devices) == 1
    d = devices[0]
    assert isinstance(d, Device)
    assert d.id == "srv-01"
    assert d.svhc_score == 5

    assert d.cpu.count == 2
    assert d.cpu.cores == 64
    assert d.ram.count == 8
    assert d.ram.size == 32
    assert d.ssd.count == 4

    GiB = 1024**3
    assert d.performance.compute == 2 * GiB
    assert d.performance.memorize == 16 * GiB
    assert d.performance.store == 1_000_000_000_000
    assert d.performance.transfer == 125_000_000  # 1 Gb = 125e6 Bytes

    assert isinstance(d.power_profile, PowerProfile)
    assert d.power_profile.compute.avg == 220.0
    assert isinstance(d.power_profile_per_hardware, PowerProfilePerHardware)
    assert d.power_profile_per_hardware.total_average == 252.0

    assert isinstance(d.embedded, EmbeddedData)
    assert d.embedded.CED["compute"] == 1000.0
