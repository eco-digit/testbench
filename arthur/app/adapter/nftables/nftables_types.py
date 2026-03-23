import textwrap
from dataclasses import dataclass, field
from enum import Enum


class Family(Enum):
    IP = "ip"
    IP6 = "ip6"
    INET = "inet"
    ARP = "arp"
    BRIDGE = "bridge"
    NETDEV = "netdev"


class SetType(Enum):
    IPV4_ADDR = "ipv4_addr"
    IPV6_ADDR = "ipv6_addr"
    ETHER_ADDR = "ether_addr"
    INET_PROTO = "inet_proto"
    INET_SERVICE = "inet_service"
    MARK = "mark"


class ChainType(Enum):
    FILTER = "filter"
    ROUTE = "route"
    MANGLE = "mangle"
    NAT = "nat"
    RAW = "raw"


class Policy(Enum):
    ACCEPT = "accept"
    DROP = "drop"


class ChainHook(Enum):
    INGRESS = "ingress"
    PREROUTING = "prerouting"
    INPUT = "input"
    FORWARD = "forward"
    OUTPUT = "output"
    POSTROUTING = "postrouting"


@dataclass
class Counter:
    name: str

    def get_config(self) -> str:
        return f"counter {self.name} {{\n" f"    packets 0 bytes 0\n" "}\n"


@dataclass
class Set:
    name: str
    type: SetType
    size: int

    def get_config(self) -> str:
        return (
            f"set {self.name} {{\n"
            f"    type {self.type.value}\n"
            f"    size {self.size}\n"
            "    flags dynamic\n"
            "}\n"
        )


@dataclass
class Chain:
    name: str
    type: ChainType
    hook: ChainHook
    device: str
    policy: Policy
    prio: int
    expressions: list[str]

    def get_expressions(self) -> str:
        config = ""
        for expression in self.expressions:
            config += f"{expression}\n"
        return textwrap.indent(text=config, prefix="    ") if config else ""

    def get_config(self) -> str:
        return (
            f"chain {self.name} {{\n"
            f'    type {self.type.value} hook {self.hook.value} device "{self.device}" priority filter; policy {self.policy.value};\n'
            f"{self.get_expressions()}"
            "}\n"
        )


@dataclass
class Table:
    name: str
    family: Family
    chains: list[Chain] = field(default_factory=list)
    counters: list[Counter] = field(default_factory=list)
    sets: list[Set] = field(default_factory=list)

    @staticmethod
    def _format_list(values: list[Chain | Counter | Set]) -> str:
        config = ""
        for value in values:
            config += value.get_config()
        return textwrap.indent(text=config, prefix="    ") if config else ""

    def _get_counters_config(self) -> str:
        return self._format_list(self.counters)

    def _get_chain_config(self) -> str:
        return self._format_list(self.chains)

    def _get_sets_config(self) -> str:
        return self._format_list(self.sets)

    def get_config(self) -> str:
        return (
            f"table {self.family.value} {self.name} {{\n"
            f"{self._get_counters_config()}"
            f"{self._get_sets_config()}"
            f"{self._get_chain_config()}"
            f"}}"
        )
