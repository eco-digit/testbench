from dataclasses import dataclass


@dataclass(frozen=True)
class UserCloudInputDTO:
    id: str
    provider: str
    instance_type: str
    usage_location: str
