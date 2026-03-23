import libvirt

from util import Singleton
from .libvirt_network import LibvirtNetwork
from .libvirt_stats import (
    MemoryStats,
    CPUStats,
    StorageStats,
)


class Libvirt(Singleton):
    libvirt_connection: libvirt.virConnect

    def __init__(self):
        try:
            self.libvirt_connection = libvirt.open("qemu:///system")
        except libvirt.libvirtError as error:
            raise ConnectionError(error)

    def __del__(self):
        self.libvirt_connection.close()

    def get_info(self):
        try:
            return self.libvirt_connection.getInfo()
        except libvirt.libvirtError as error:
            raise RuntimeError(error)

    def create_network(self, network: LibvirtNetwork):
        try:
            self.libvirt_connection.networkCreateXML(network.get_config())
        except libvirt.libvirtError as error:
            raise RuntimeError(error)

    def cleanup_network(self, network: LibvirtNetwork):
        try:
            vir_network = self.libvirt_connection.networkLookupByName(network.name)
            vir_network.destroy()
        except libvirt.libvirtError as error:
            raise RuntimeError(error)

    def create_domain(self, xml: str):
        try:
            self.libvirt_connection.createXML(xml)
        except libvirt.libvirtError as error:
            raise RuntimeError(error)

    def cleanup_domain(self, domain_name: str):
        try:
            vir_domain = self.libvirt_connection.lookupByName(domain_name)
            vir_domain.destroy()
        except libvirt.libvirtError as error:
            raise RuntimeError(error)

    def get_current_mem_usage(self, domain_name: str) -> MemoryStats:
        try:
            vir_domain = self.libvirt_connection.lookupByName(domain_name)
            vir_mem_stats = vir_domain.memoryStats()
            vir_max_memory = vir_domain.maxMemory()
            return MemoryStats(current_KiB=vir_mem_stats["rss"], max_KiB=vir_max_memory)
        except libvirt.libvirtError as error:
            raise RuntimeError(error)

    def get_current_cpu_usage(self, domain_name: str) -> CPUStats:

        try:
            vir_domain = self.libvirt_connection.lookupByName(domain_name)
            vir_cpu_stats = vir_domain.getCPUStats(total=True)
            return CPUStats(
                cpu_time_seconds=(vir_cpu_stats[0]["cpu_time"]) / 1_000_000_000.0
            )
        except libvirt.libvirtError as error:
            raise RuntimeError(error)

    def get_current_storage_usage(self, domain_name: str) -> StorageStats:
        try:
            vir_domain = self.libvirt_connection.lookupByName(domain_name)
            vir_storage_stats = vir_domain.blockInfo("hda")
            return StorageStats(
                capacity_kiB=vir_storage_stats[0], allocation_kiB=vir_storage_stats[1]
            )
        except libvirt.libvirtError as error:
            raise RuntimeError(error)

    def get_all_network_names(self) -> list[str]:
        try:
            vir_networks = self.libvirt_connection.listAllNetworks()
            return [vir_network.name() for vir_network in vir_networks]
        except libvirt.libvirtError as error:
            raise RuntimeError(error)


def libvirt_adapter() -> Libvirt:
    return Libvirt()
