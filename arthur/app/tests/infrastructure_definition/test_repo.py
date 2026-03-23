import json
from infrastructure_definition.repository import InfrastructureRepository


def test_repository_loads_main_and_references(tmp_path):
    base = tmp_path
    main = base / "infrastructure_definition.json"
    spec1 = base / "server_specs.json"
    spec2 = base / "vm_specs.json"

    # main file with two devices
    main.write_text(
        json.dumps(
            {
                "devices": [
                    {
                        "id": "srv-01",
                        "type": "server",
                        "lifetime": 5.0,
                        "average_load": {"co": 0.3, "me": 0.2, "st": 0.1, "tr": 0.05},
                        "network": {"type": "ethernet", "throughput": 1_000_000_000},
                        "location": {"lat": 52.0, "lon": 13.0},
                        "runtime": {"gm": "kvm", "os": "linux", "deps": []},
                        "reference": "server_specs.json",
                    },
                    {
                        "id": "vm-01",
                        "type": "vm",
                        "lifetime": 3.0,
                        "average_load": {"co": 0.5, "me": 0.4, "st": 0.1, "tr": 0.2},
                        "network": {"type": "ethernet", "throughput": 1_000_000_000},
                        "location": {"lat": 52.0, "lon": 13.0},
                        "runtime": {"gm": "kvm", "os": "linux", "deps": []},
                        "reference": "vm_specs.json",
                    },
                ]
            }
        )
    )

    spec1.write_text(json.dumps({"hello": "world"}))
    spec2.write_text(json.dumps({"foo": "bar"}))

    repo = InfrastructureRepository(str(base))

    main_loaded = repo.load_main("infrastructure_definition.json")
    assert "devices" in main_loaded
    assert len(main_loaded["devices"]) == 2

    metas = repo.list_device_metas("infrastructure_definition.json")
    assert metas[0]["id"] == "srv-01"
    assert metas[1]["reference"] == "vm_specs.json"

    ref1 = repo.load_reference("server_specs.json")
    assert ref1["hello"] == "world"
