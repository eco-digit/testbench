from adapter.libvirt import Libvirt, LibvirtNetwork, libvirt_adapter
from adapter.nftables.nftables import NFTables
from adapter.nftables.nftables_types import (
    Table,
    Family,
    Counter,
    Set,
    SetType,
    Chain,
    ChainType,
    ChainHook,
    Policy,
)
from networking.networking_types import NetworkGuest, NetworkInformation


class Networking:
    network_information: NetworkInformation
    network: LibvirtNetwork
    table: Table
    libvirt_adapter: Libvirt

    def __init__(
        self, network_information: NetworkInformation, network: LibvirtNetwork
    ):
        self.network_information = network_information
        self.table = Networking._create_table(self.network_information)
        self.network = network
        self.libvirt_adapter = libvirt_adapter()

    def create_network(self):
        self.libvirt_adapter.create_network(network=self.network)

    def cleanup_network(self):
        self.libvirt_adapter.cleanup_network(network=self.network)

    def create_counters(self):
        NFTables.create_table(self.table)

    def cleanup_counters(self):
        NFTables.delete_table(self.table)

    def get_counters_for_domain(self, network_guest: NetworkGuest):
        return {
            network_guest.ip_address: NFTables.get_counter_in_bytes(
                table=self.table, counter_name=f"{network_guest.domain_name}_in"
            ),
            "0.0.0.0": NFTables.get_counter_in_bytes(
                table=self.table, counter_name=f"{network_guest.domain_name}_out"
            ),
            **NFTables.get_set_in_bytes(
                table=self.table, set_name=network_guest.domain_name
            ),
        }

    @staticmethod
    def _create_table(network_information) -> Table:
        return Table(
            name=f"measurement-{network_information.network_id:04d}",
            family=Family.INET,
            counters=Networking._create_counters(network_information.guests),
            sets=Networking._create_sets(network_information.guests),
            chains=Networking._create_chains(network_information=network_information),
        )

    @staticmethod
    def _create_counters(network_guests: list[NetworkGuest]) -> list[Counter]:
        counters = []
        for network_guest in network_guests:
            counters.append(Counter(name=f"{network_guest.domain_name}_in"))
            counters.append(Counter(name=f"{network_guest.domain_name}_out"))
        return counters

    @staticmethod
    def _create_sets(network_guests: list[NetworkGuest]) -> list[Set]:
        sets = []
        for network_guest in network_guests:
            sets.append(
                Set(
                    name=f"{network_guest.domain_name}",
                    type=SetType.IPV4_ADDR,
                    size=256,
                )
            )
        return sets

    @staticmethod
    def _create_chains(network_information: NetworkInformation) -> list[Chain]:
        chains = []
        for network_guest in network_information.guests:
            chains.append(
                Chain(
                    name=f"{network_guest.domain_name}",
                    type=ChainType.FILTER,
                    hook=ChainHook.INGRESS,
                    device=network_guest.network_interface,
                    policy=Policy.ACCEPT,
                    prio=0,
                    # This part is very specific, but in order to reduce complexity the expressions are create here directly
                    expressions=[
                        f"ip daddr {network_information.subnet} update @{network_guest.domain_name} {{ ip daddr counter }} accept",
                        f'counter name "{network_guest.domain_name}_out" accept',
                        f"ip saddr {network_information.subnet} accept",
                        f'ip daddr {network_guest.ip_address} counter name "{network_guest.domain_name}_in" accept',
                    ],
                )
            )
        return chains
