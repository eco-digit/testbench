from dataclasses import dataclass, field
from typing import Optional, Dict, Any


@dataclass(frozen=True)
class CPU:
    cores: int


@dataclass(frozen=True)
class RAM:
    size_gb: float


@dataclass(frozen=True)
class Impacts:
    # GWP, ADP, Water, PE usw.
    values: Dict[str, Any]


@dataclass
class CloudDevice:
    # identity & input from user
    id: str
    provider: str
    instance_type: str
    usage_location: str

    # specs from boavitza
    cpu: Optional[CPU] = None
    ram: Optional[RAM] = None

    # result
    impacts: Optional[Impacts] = None

    def set_specs(self, *, cores: int, ram_gb: float) -> None:
        self.cpu = CPU(cores=cores)
        self.ram = RAM(size_gb=ram_gb)

    def apply_impacts(self, impacts: Impacts) -> None:
        self.impacts = impacts
