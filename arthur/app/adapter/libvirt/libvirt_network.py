import os
from dataclasses import dataclass
from ipaddress import IPv4Network, IPv4Interface
from pathlib import Path
from uuid import uuid4

from networking import NetworkGuest


@dataclass
class LibvirtNetwork:

    name: str
    max_inbound: int
    max_outbound: int
    bridge: str
    gateway_mac: str
    gateway_ip: str
    dhcp_entries: list[NetworkGuest]
    _template: str

    def __init__(
        self,
        name: str,
        max_inbound: int,
        max_outbound: int,
        bridge: str,
        gateway_mac: str,
        gateway_ip: str,
        dhcp_entries: list[NetworkGuest],
    ):
        self.name = name
        self.uuid = uuid4()
        self.max_inbound = max_inbound
        self.max_outbound = max_outbound
        self.bridge = bridge
        self.gateway_mac = gateway_mac
        self.gateway_ip = gateway_ip
        self.dhcp_entries = dhcp_entries
        self._template = LibvirtNetwork._get_template()

    @staticmethod
    def _get_template() -> str:
        with open(
            Path(os.path.dirname(__file__)).joinpath("network.template.xml"), "r"
        ) as template_config:
            return template_config.read()

    def get_config(self) -> str:
        return self._template.format(
            **{
                "name": self.name,
                "uuid": self.uuid,
                "max_inbound": self.max_inbound,
                "max_outbound": self.max_outbound,
                "bridge": self.bridge,
                "gateway_mac": self.gateway_mac,
                "gateway_ip": self.gateway_ip,
                "dhcp_entries": self._parse_dhcp_entries(),
            }
        )

    def _parse_dhcp_entries(self) -> str:
        gateway_interface = IPv4Interface(address=f"{self.gateway_ip}/24")
        network = IPv4Network(address=f"{gateway_interface.network.network_address}/24")
        result = f'<range start="{network.network_address + 1}" end="{network.broadcast_address - 1}"/>'
        for entry in self.dhcp_entries:
            if entry.ip_address and entry.mac_address:
                result += f'<host mac="{entry.mac_address}" name="{entry.domain_name}" ip="{entry.ip_address}"/>'
        return result
