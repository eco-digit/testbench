import pytest

from adapter.nftables.nftables_types import (
    Chain,
    ChainType,
    ChainHook,
    Counter,
    Policy,
    Table,
    Family,
    Set,
    SetType,
)
from nftables_fixtures import sample_table_file_from_file, sample_full_table


@pytest.fixture
def sample_set() -> Set:
    return Set(name="eames-1-0", type=SetType.IPV4_ADDR, size=256)


@pytest.fixture
def sample_counter() -> Counter:
    return Counter(name="eames-1-0_in")


@pytest.fixture
def sample_simple_chain() -> Chain:
    return Chain(
        name="eames-1-0",
        type=ChainType.FILTER,
        hook=ChainHook.INGRESS,
        device="vnet1",
        policy=Policy.ACCEPT,
        prio=0,
        expressions=[],
    )


@pytest.fixture
def sample_full_chain() -> Chain:
    return Chain(
        name="eames-1-0",
        type=ChainType.FILTER,
        hook=ChainHook.INGRESS,
        device="vnet1",
        policy=Policy.ACCEPT,
        prio=0,
        expressions=[
            "ip daddr 172.16.25.0/24 update @eames-1-0 { ip daddr counter } accept",
            'counter name "eames-1-0_out" accept',
            "ip saddr 172.16.25.0/24 accept",
            'ip daddr 172.16.25.2 counter name "eames-1-0_in" accept',
        ],
    )


@pytest.fixture
def sample_table() -> Table:
    return Table(name="measurement-vnetid", family=Family.INET)


def test_counter_get_config_ok(sample_counter):
    # WHEN
    result = sample_counter.get_config()
    # THEN
    assert result == "counter eames-1-0_in {\n" "    packets 0 bytes 0\n" "}\n"


def test_set_get_config_ok(sample_set):
    # WHEN
    result = sample_set.get_config()

    # THEN
    assert result == (
        "set eames-1-0 {\n"
        "    type ipv4_addr\n"
        "    size 256\n"
        "    flags dynamic\n"
        "}\n"
    )


def test_table_with_counter_get_config_ok(sample_table, sample_counter):
    # GIVEN
    sample_table.counters = [sample_counter]

    # WHEN
    result = sample_table.get_config()

    # THEN
    assert result == (
        "table inet measurement-vnetid {\n"
        "    counter eames-1-0_in {\n"
        "        packets 0 bytes 0\n"
        "    }\n"
        "}"
    )


def test_table_with_set_get_config_ok(sample_table, sample_set):
    # GIVEN
    sample_table.sets = [sample_set]

    # WHEN
    result = sample_table.get_config()

    # THEN
    assert result == (
        "table inet measurement-vnetid {\n"
        "    set eames-1-0 {\n"
        "        type ipv4_addr\n"
        "        size 256\n"
        "        flags dynamic\n"
        "    }\n"
        "}"
    )


def test_chain_get_config_ok(sample_simple_chain):
    # WHEN
    result = sample_simple_chain.get_config()

    # THEN
    assert result == (
        "chain eames-1-0 {\n"
        '    type filter hook ingress device "vnet1" priority filter; policy accept;\n'
        "}\n"
    )


def test_chain_with_expressions_get_config_ok(sample_full_chain):
    # WHEN
    result = sample_full_chain.get_config()

    # THEN
    assert result == (
        "chain eames-1-0 {\n"
        '    type filter hook ingress device "vnet1" priority filter; policy accept;\n'
        "    ip daddr 172.16.25.0/24 update @eames-1-0 { ip daddr counter } accept\n"
        '    counter name "eames-1-0_out" accept\n'
        "    ip saddr 172.16.25.0/24 accept\n"
        '    ip daddr 172.16.25.2 counter name "eames-1-0_in" accept\n'
        "}\n"
    )


def test_empty_table_get_config_ok(sample_table):
    # WHEN
    result = sample_table.get_config()

    # THEN
    assert result == "table inet measurement-vnetid {\n}"


def test_full_table_get_config_ok(sample_full_table, sample_table_file_from_file):
    # WHEN
    result = sample_full_table.get_config()

    # THEN
    assert result == sample_table_file_from_file
