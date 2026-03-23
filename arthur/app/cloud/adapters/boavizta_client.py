import requests

from cloud.domain.cloud_device import CloudDevice, Impacts
from cloud.dtos.impacts import ImpactResponseDTO
from cloud.dtos.instance_specs import InstanceSpecsDTO
from cloud.dtos.workload import TimeWorkloadDTO

BOAVIZTA_BASE_URL = "https://api.boavizta.org/v1/cloud/instance"


# Entry Point when there is a cloud_device
def fetch_instance_config(
    id: str, provider: str, instance_type: str, usage_location: str
) -> CloudDevice:
    url = f"{BOAVIZTA_BASE_URL}/instance_config"
    params = {"provider": provider, "instance_type": instance_type}
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    raw = resp.json()

    specs = InstanceSpecsDTO.from_boavizta(raw)

    device = CloudDevice(
        id=id,
        provider=provider,
        instance_type=instance_type,
        usage_location=usage_location,
    )
    device.set_specs(cores=specs.cores, ram_gb=specs.ram_gb)
    return device


def get_environmental_impacts(
    device: CloudDevice, workload: TimeWorkloadDTO, duration_hours: float
) -> CloudDevice:
    url = f"{BOAVIZTA_BASE_URL}?verbose=false&duration={duration_hours}&criteria=gwp&criteria=adp&criteria=pe"
    payload = {
        "provider": device.provider,
        "instance_type": device.instance_type,
        "usage": {
            "usage_location": device.usage_location,
            "time_workload": workload.to_boavizta_payload(),
        },
    }
    resp = requests.post(url, json=payload, timeout=20)
    resp.raise_for_status()
    dto = ImpactResponseDTO.from_boavizta(resp.json())
    device.apply_impacts(dto.to_domain())
    return device
