from dataclasses import dataclass
from typing import Any, Dict


@dataclass(frozen=True)
class InstanceSpecsDTO:
    cores: int
    ram_gb: float
    platform: str | None = None

    @classmethod
    def from_boavizta(cls, payload: Dict[str, Any]) -> "InstanceSpecsDTO":
        cores = int(payload["vcpu"]["default"])
        ram_gb = float(payload["memory"]["default"])
        platform = payload.get("platform", {}).get("default")
        return cls(cores=cores, ram_gb=ram_gb, platform=platform)
