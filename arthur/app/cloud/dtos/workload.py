# TODO: workload
from dataclasses import dataclass
from typing import List, Dict, Any


@dataclass(frozen=True)
class WorkloadPoint:
    time_percentage: float
    load_percentage: float


@dataclass(frozen=True)
class TimeWorkloadDTO:
    points: List[WorkloadPoint]

    def to_boavizta_payload(self) -> List[Dict[str, Any]]:
        return [
            {"time_percentage": p.time_percentage, "load_percentage": p.load_percentage}
            for p in self.points
        ]


def hardcoded_time_workload() -> TimeWorkloadDTO:
    return TimeWorkloadDTO(
        points=[
            WorkloadPoint(time_percentage=50, load_percentage=0),
            WorkloadPoint(time_percentage=30, load_percentage=60),
            WorkloadPoint(time_percentage=20, load_percentage=100),
        ]
    )
