from dataclasses import dataclass
from typing import List


@dataclass
class MobileNetworkProfile:
    # Number of Cell phones
    NUMBER_OF_UES_PER_CELL: int

    # Byte sizes of sent Packets
    UPLINK_PACKET_SIZE_BYTES: List[int]
    DOWNLINK_PACKET_SIZE_BYTES: List[int]
    UPLINK_PACKET_SIZE_PROBABILITY: List[float]
    DOWNLINK_PACKET_SIZE_PROBABILITY: List[float]

    # Packet rates in packets per second
    UPLINK_PACKET_RATE: List[int]
    DOWNLINK_PACKET_RATE: List[int]
    UPLINK_PACKET_RATE_PROBABILITY: List[float]
    DOWNLINK_PACKET_RATE_PROBABILITY: List[float]

    # Measurement  duration in seconds
    DURATION_EVALUATED_SECONDS: int
