from unittest.mock import MagicMock, patch

import pytest

from adapter.nftables.nftables import NFTables
from adapter.nftables.nftables_types import Family, SetType, Policy
from networking.networking import Networking, NetworkInformation
from networking.networking_types import NetworkGuest
from tests.adapter.nftables.nftables_fixtures import sample_full_table


@pytest.fixture(autouse=True)
def mock_libvirt_connection():
    with patch("networking.networking.libvirt_adapter") as mock:
        mock.return_value = MagicMock()
        yield mock


def test_create_networking_ok(sample_full_table):
    # GIVEN
    network_information = NetworkInformation(
        subnet="172.16.25.0/24",
        network_id=1,
        guests=[
            NetworkGuest(
                domain_name="eames-1-0",
                network_interface="vnet1",
                ip_address="172.16.25.2",
                mac_address="02:00:ac:10:80:02",
            ),
            NetworkGuest(
                domain_name="eames-1-1",
                network_interface="vnet2",
                ip_address="172.16.25.3",
                mac_address="02:00:ac:10:80:03",
            ),
        ],
    )

    # WHEN
    networking = Networking(
        network=MagicMock(), network_information=network_information
    )
    result = networking.table

    # THEN
    assert result == sample_full_table


def test_creates_table_with_name_ok():
    # GIVEN
    network_information = NetworkInformation(
        subnet="192.168.1.0/24", network_id=1, guests=[]
    )

    # WHEN
    networking = Networking(
        network=MagicMock(), network_information=network_information
    )

    # THEN
    assert networking.table.name == "measurement-0001"


def test_creates_table_with_family_ok():
    # GIVEN
    network_information = NetworkInformation(
        subnet="192.168.1.0/24", network_id=1, guests=[]
    )

    # WHEN
    networking = Networking(
        network=MagicMock(), network_information=network_information
    )

    # THEN
    assert networking.table.family == Family.INET


def test_creates_counters_for_each_guest_ok():
    # GIVEN
    guests = [
        NetworkGuest(
            domain_name="eames-1-0",
            network_interface="vnet0",
            ip_address="192.168.1.2",
            mac_address="02:00:ac:10:80:02",
        ),
        NetworkGuest(
            domain_name="eames-1-1",
            network_interface="vnet1",
            ip_address="192.168.1.3",
            mac_address="02:00:ac:10:80:03",
        ),
    ]
    network_information = NetworkInformation(
        subnet="192.168.1.0/24", network_id=1, guests=guests
    )
    networking = Networking(
        network=MagicMock(), network_information=network_information
    )

    # WHEN
    counter_names = [counter.name for counter in networking.table.counters]

    # THEN
    assert "eames-1-0_in" in counter_names
    assert "eames-1-0_out" in counter_names
    assert "eames-1-1_in" in counter_names
    assert "eames-1-1_out" in counter_names


def test_creates_sets_with_type_and_size_ok():
    # GIVEN
    guests = [
        NetworkGuest(
            domain_name="eames-1-0",
            network_interface="vnet0",
            ip_address="192.168.1.2",
            mac_address="02:00:ac:10:80:02",
        ),
    ]
    network_information = NetworkInformation(
        subnet="192.168.1.0/24", network_id=1, guests=guests
    )
    networking = Networking(
        network=MagicMock(), network_information=network_information
    )

    # WHEN
    created_set = networking.table.sets[0]

    # THEN
    assert created_set.type == SetType.IPV4_ADDR
    assert created_set.size == 256


def test_creates_chains_with_policy_and_expressions_ok():
    # GIVEN
    guests = [
        NetworkGuest(
            domain_name="eames-1-0",
            network_interface="vnet0",
            ip_address="192.168.1.2",
            mac_address="02:00:ac:10:80:02",
        ),
    ]

    # WHEN
    network_information = NetworkInformation(
        subnet="192.168.1.0/24", network_id=1, guests=guests
    )
    networking = Networking(
        network=MagicMock(), network_information=network_information
    )
    created_chain = networking.table.chains[0]

    # THEN
    assert created_chain.policy == Policy.ACCEPT
    assert len(created_chain.expressions) == 4
    assert (
        "ip daddr 192.168.1.0/24 update @eames-1-0 { ip daddr counter } accept"
        in created_chain.expressions
    )


def apply_table_creation_ok(monkeypatch):
    # GIVEN
    mock_create_table = MagicMock()
    monkeypatch.setattr(NFTables, "create_table", mock_create_table)
    network_information = NetworkInformation(
        subnet="192.168.1.0/24", network_id=1, guests=[]
    )
    networking = Networking(
        network=MagicMock(), network_information=network_information
    )

    # WHEN
    networking.create_counters()

    # THEN
    mock_create_table.assert_called_once_with(networking.table)


def cleans_up_table_correctly(monkeypatch):
    # GIVEN
    mock_delete_table = MagicMock()
    monkeypatch.setattr(NFTables, "delete_table", mock_delete_table)
    network_information = NetworkInformation(
        subnet="192.168.1.0/24", network_id=1, guests=[]
    )
    networking = Networking(
        network=MagicMock(), network_information=network_information
    )

    # WHEN
    networking.cleanup_counters()

    # THEN
    mock_delete_table.assert_called_once_with(networking.table)


def test_get_counters_and_sets_ok(monkeypatch):
    # GIVEN
    mock_get_counter_in_bytes = MagicMock(
        side_effect=lambda table, counter_name: 1024 if "_in" in counter_name else 2048
    )
    mock_get_set_in_bytes = MagicMock(return_value={"172.16.1.3": 512})
    monkeypatch.setattr(NFTables, "get_counter_in_bytes", mock_get_counter_in_bytes)
    monkeypatch.setattr(NFTables, "get_set_in_bytes", mock_get_set_in_bytes)

    network_guest = NetworkGuest(
        domain_name="eames-1-0",
        network_interface="vnet0",
        ip_address="172.16.1.2",
        mac_address="02:00:ac:10:80:02",
    )
    network_information = NetworkInformation(
        subnet="172.16.1.0/24", network_id=1, guests=[network_guest]
    )
    networking = Networking(
        network=MagicMock(), network_information=network_information
    )

    # WHEN
    counters = networking.get_counters_for_domain(network_guest)

    # THEN
    assert counters == {"172.16.1.2": 1024, "0.0.0.0": 2048, "172.16.1.3": 512}
