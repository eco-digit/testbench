from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional


@dataclass
class AverageLoad:
    co: float
    me: float
    st: float
    tr: float

    def to_load_average_dict(self) -> Dict[str, float]:
        return {
            "CPU": self.co,
            "GPU": 0.0,
            "RAM": self.me,
            "SSDHDD": self.st,
            "NW": self.tr,
        }


@dataclass
class Network:
    type: str
    throughput: float


@dataclass
class Runtime:
    gm: str
    os: str
    deps: List[str] = field(default_factory=list)


@dataclass
class Performance:
    compute: float
    # In bytes
    memorize: float
    # In bytes
    store: float
    # In bytes per sec
    transfer: float

    def to_dbr_dict(self) -> Dict[str, float]:
        return {
            "CPU": self.compute,
            "GPU": 0,  # aktuell nicht vorhanden
            "RAM": self.memorize,
            "SSDHDD": self.store,
            "NW": self.transfer,
        }


@dataclass
class PowerProfileEntry:
    profile: Dict[float, float]
    avg: float

    @classmethod
    def from_dict(cls, data: Dict) -> "PowerProfileEntry":
        profile = {float(k): float(v) for k, v in data.get("profile", {}).items()}
        avg = float(data.get("avg", 0))
        return cls(profile=profile, avg=avg)


@dataclass
class PowerProfile:
    compute: PowerProfileEntry
    memorize: PowerProfileEntry
    store: PowerProfileEntry
    transfer: PowerProfileEntry

    def to_average_load_dict(self):
        return {
            "compute": self.compute.avg,
            "memorize": self.memorize.avg,
            "store": self.store.avg,
            "transfer": self.transfer.avg,
        }


@dataclass
class PowerProfilePerHardware:
    cpu: PowerProfileEntry
    gpu: PowerProfileEntry
    ram: PowerProfileEntry
    ssd: PowerProfileEntry
    hdd: PowerProfileEntry
    nw: PowerProfileEntry
    total_average: float

    def to_average_load_dict(self):
        return {
            "CPU": self.cpu.avg,
            "GPU": self.gpu.avg,
            "RAM": self.ram.avg,
            "SSD": self.ssd.avg,
            "HDD": self.hdd.avg,
            "NW": self.nw.avg,
        }


@dataclass
class CPU:
    count: int
    cores: int


@dataclass
class RAM:
    count: int
    size: float


@dataclass
class SSD:
    count: int
    size: float


@dataclass
class EmbeddedData:
    CED: Dict[str, float]
    GWP: Dict[str, float]
    ADP: Dict[str, float]
    Water: Dict[str, float]
    WEEE: Dict[str, float]
    TOX: Dict[str, float]

    @classmethod
    def from_dict(cls, data: Dict) -> "EmbeddedData":
        return cls(
            CED=data.get("CED", {}),
            GWP=data.get("GWP", {}),
            ADP=data.get("ADP", {}),
            Water=data.get("Water", {}),
            WEEE=data.get("WEEE", {}),
            TOX=data.get("TOX", {}),
        )

    def to_dict(self) -> Dict[str, float]:
        return asdict(self)


@dataclass
class CloudParameters:
    provider: str  # AWS, SCS, ...
    instance_type: str
    usage_location: str
    is_public: bool
    storage_size: float


@dataclass
class Device:
    id: str
    type: str
    lifetime: float
    average_load: AverageLoad
    network: Network
    runtime: Runtime
    svhc_score: float
    cpu: CPU
    ram: RAM
    ssd: SSD
    performance: Performance
    cloud_parameters: Optional[CloudParameters] = None
    power_profile: Optional[PowerProfile] = None
    power_profile_per_hardware: Optional[PowerProfilePerHardware] = None
    embedded: Optional[EmbeddedData] = None
    embedded_per_dbr: Optional[EmbeddedData] = None
