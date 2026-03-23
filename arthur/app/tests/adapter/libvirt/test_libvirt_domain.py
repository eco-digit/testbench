from ipaddress import IPv4Address
from pathlib import Path
from uuid import UUID

import pytest

from adapter.libvirt import LibvirtDomain


@pytest.fixture
def sample_domain_config_from_file() -> str:
    with open((Path(__file__).parent / "domain_sample.xml"), "r") as sample_file:
        return sample_file.read()


def test_parse_config_file_ok(sample_domain_config_from_file: str):
    # GIVEN
    domain = LibvirtDomain(
        domain_name="eames-0-1",
        uuid=UUID("3b7f203d-e6be-4fa5-8445-b6c96f7980c9"),
        memory=1024,
        vcpus=4,
        cpu_count=4,
        cores_per_cpu=1,
        source_file=Path("/path/to/source/file"),
        mount_host_directory=Path("/path/to/host/directory"),
        mount_shortcut=Path("/path/to/shortcut"),
        mac_address="26:54:70:cf:e7:d3",
        bridge_name="virbr0",
        device_name="ecovnet1",
        network_gateway_ip=IPv4Address("172.16.1.1"),
        network_max_inbound=2500,
        network_max_outbound=2500,
    )

    # WHEN
    config = domain.get_config()

    # THEN
    assert sample_domain_config_from_file == config
