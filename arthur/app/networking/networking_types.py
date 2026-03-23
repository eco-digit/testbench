from dataclasses import dataclass


@dataclass
class NetworkGuest:
    domain_name: str
    network_interface: str
    ip_address: str
    mac_address: str


@dataclass
class NetworkInformation:
    subnet: str
    network_id: int
    guests: list[NetworkGuest]
