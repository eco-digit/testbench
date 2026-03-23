from unittest.mock import MagicMock, patch

import pytest

from adapter.libvirt import (
    LibvirtNetwork,
    libvirt_adapter,
    Libvirt,
    MemoryStats,
    CPUStats,
    StorageStats,
)
from networking.networking_types import NetworkGuest


@pytest.fixture
def mock_libvirt_connection():
    Libvirt.reset_singleton()

    with patch("libvirt.open") as mock:
        mock_connection = MagicMock()
        mock.return_value = mock_connection
        yield mock_connection


@pytest.fixture
def sample_network_fixture():
    return LibvirtNetwork(
        name="ecovnet1",
        max_inbound=2500,
        max_outbound=2500,
        bridge="virbr1",
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


def test_libvirt_get_info_ok(mock_libvirt_connection):
    # GIVEN
    sample_info = ["x86_64", 32049, 16, 2299, 1, 8, 2, 1]
    mock_libvirt_connection.getInfo.return_value = sample_info

    # WHEN
    result = libvirt_adapter().get_info()

    # THEN
    assert mock_libvirt_connection.getInfo.call_count == 1
    assert result == sample_info


def test_create_network_ok(mock_libvirt_connection, sample_network_fixture):
    # WHEN
    libvirt_adapter().create_network(network=sample_network_fixture)

    # THEN
    mock_libvirt_connection.networkCreateXML.assert_called_once_with(
        sample_network_fixture.get_config()
    )


def test_network_cleanup_ok(mock_libvirt_connection, sample_network_fixture):
    mock_vir_network = MagicMock()
    mock_libvirt_connection.networkLookupByName.return_value = mock_vir_network

    # WHEN
    libvirt_adapter().cleanup_network(sample_network_fixture)

    # THEN
    mock_libvirt_connection.networkLookupByName.assert_called_once_with(
        sample_network_fixture.name
    )
    mock_vir_network.destroy.assert_called_once()


def test_create_domain_ok(mock_libvirt_connection):
    # GIVEN
    sample_xml = "<domain type='kvm'></domain>"

    # WHEN
    libvirt_adapter().create_domain(xml=sample_xml)

    # THEN
    mock_libvirt_connection.createXML.assert_called_once_with(sample_xml)


def test_cleanup_domain_ok(mock_libvirt_connection):
    # GIVEN
    sample_domain_name = "eames-1-0"
    mock_vir_domain = MagicMock()
    mock_libvirt_connection.lookupByName.return_value = mock_vir_domain

    # WHEN
    libvirt_adapter().cleanup_domain(domain_name=sample_domain_name)

    # THEN
    mock_vir_domain.destroy.assert_called_once()


def test_get_current_mem_usage_ok(mock_libvirt_connection):
    # GIVEN
    sample_domain_name = "eames-1-0"
    sample_memory_stat = MemoryStats(current_KiB=1024, max_KiB=8192)

    mock_vir_domain = MagicMock()

    mock_libvirt_connection.lookupByName.return_value = mock_vir_domain
    mock_vir_domain.memoryStats.return_value = {"rss": sample_memory_stat.current_KiB}
    mock_vir_domain.maxMemory.return_value = sample_memory_stat.max_KiB

    # WHEN
    result = libvirt_adapter().get_current_mem_usage(domain_name=sample_domain_name)

    # THEN
    mock_vir_domain.memoryStats.assert_called_once()
    mock_vir_domain.maxMemory.assert_called_once()
    assert result == sample_memory_stat


def test_get_current_cpu_usage_ok(mock_libvirt_connection):
    # GIVEN
    sample_domain_name = "eames-1-0"
    sample_cpu_stat = CPUStats(cpu_time_seconds=12.34)

    mock_vir_domain = MagicMock()

    mock_libvirt_connection.lookupByName.return_value = mock_vir_domain
    mock_vir_domain.getCPUStats.return_value = [{"cpu_time": 12_340_000_000}]

    # WHEN
    result = libvirt_adapter().get_current_cpu_usage(domain_name=sample_domain_name)

    # THEN
    mock_vir_domain.getCPUStats.assert_called_once()
    assert result == sample_cpu_stat


def test_get_current_storage_usage_ok(mock_libvirt_connection):
    # GIVEN
    sample_domain_name = "eames-1-0"
    sample_storage_stat = StorageStats(capacity_kiB=8192, allocation_kiB=1024)

    mock_vir_domain = MagicMock()

    mock_libvirt_connection.lookupByName.return_value = mock_vir_domain
    mock_vir_domain.blockInfo.return_value = [
        sample_storage_stat.capacity_kiB,
        sample_storage_stat.allocation_kiB,
    ]

    # WHEN
    result = libvirt_adapter().get_current_storage_usage(domain_name=sample_domain_name)

    # THEN
    mock_vir_domain.blockInfo.assert_called_once()
    assert result == sample_storage_stat


def test_get_all_networks_ok(mock_libvirt_connection):
    # GIVEN
    network_1 = MagicMock()
    network_1.name.return_value = "ecovnet1"
    network_2 = MagicMock()
    network_2.name.return_value = "ecovnet2"

    mock_libvirt_connection.listAllNetworks.return_value = [network_1, network_2]

    # WHEN
    result = libvirt_adapter().get_all_network_names()

    # THEN
    assert result == ["ecovnet1", "ecovnet2"]
