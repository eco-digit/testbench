from dataclasses import dataclass


@dataclass
class MemoryStats:
    current_KiB: int
    max_KiB: int


@dataclass
class CPUStats:
    cpu_time_seconds: float


@dataclass
class StorageStats:
    capacity_kiB: int
    allocation_kiB: int
