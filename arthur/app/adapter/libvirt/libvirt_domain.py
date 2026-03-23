import os
from dataclasses import dataclass
from ipaddress import IPv4Address
from pathlib import Path
from uuid import UUID


@dataclass
class LibvirtDomain:
    domain_name: str
    uuid: UUID
    memory: int
    vcpus: int
    cpu_count: int
    cores_per_cpu: int
    source_file: Path
    mount_shortcut: Path
    mount_host_directory: Path
    mac_address: str
    bridge_name: str
    device_name: str
    network_gateway_ip: IPv4Address
    network_max_inbound: int
    network_max_outbound: int

    @staticmethod
    def _get_template() -> str:
        with open(
            Path(os.path.dirname(__file__)).joinpath("domain.template.xml"), "r"
        ) as template_config:
            return template_config.read()

    def get_config(self) -> str:
        return self._get_template().format(
            **{
                "domain_name": self.domain_name,
                "uuid": self.uuid,
                "memory": self.memory,
                "vcpus": self.vcpus,
                "cpu_count": self.cpu_count,
                "cores_per_cpu": self.cores_per_cpu,
                "source_file": self.source_file,
                "mount_host_directory": self.mount_host_directory,
                "mount_shortcut": self.mount_shortcut,
                "mac_address": self.mac_address,
                "bridge_name": self.bridge_name,
                "device_name": self.device_name,
                "network_gateway_ip": self.network_gateway_ip,
                "network_max_inbound": self.network_max_inbound,
                "network_max_outbound": self.network_max_outbound,
            }
        )
