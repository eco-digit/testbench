from pathlib import Path
from uuid import UUID

import pytest

from adapter.libvirt import LibvirtNetwork
from networking.networking_types import NetworkGuest


@pytest.fixture
def sample_network_config_from_file() -> str:
    with open((Path(__file__).parent / "network_sample.xml"), "r") as sample_file:
        return sample_file.read()


def test_parse_config_file_ok(sample_network_config_from_file: str):
    # GIVEN
    network = LibvirtNetwork(
        name="ecovnet1",
        max_inbound=2500,
        max_outbound=2500,
        bridge="virbr0",
        gateway_mac="26:54:70:cf:e7:d3",
        gateway_ip="172.16.1.0",
        dhcp_entries=[
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
        ],
    )
    network.uuid = UUID("e2677803-abc3-4ff8-8286-96d2cc02fe80")

    # WHEN
    config = network.get_config()

    # THEN
    assert sample_network_config_from_file == config
