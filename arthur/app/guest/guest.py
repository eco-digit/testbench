from abc import ABCMeta
from datetime import datetime
from ipaddress import IPv4Address
from logging import getLogger
from os.path import basename, join
from pathlib import Path
from uuid import uuid4, UUID

import yaml

from adapter.libvirt import libvirt_adapter, LibvirtDomain
from config import Config
from db.timescale_service import TimescaleService
from entities import DataSet
from infrastructure_definition.models import Device
from networking.networking_types import NetworkGuest
from util import subprocess_handler
from util.repeat_timer import RepeatTimer
from util.vnet_utils import (
    determine_ip_address,
    determine_mac_address,
)

logger = getLogger(basename(__file__))

_config = Config()


class Guest(metaclass=ABCMeta):
    """Abstract base class for implementing guests.

    A guest manages the creation and destruction of an eames instance.
    The eames guests are created as virtual machines with libvirt.

    During the install phase the guest's sut script can be executed with :py:meth:`Guest.install_sut`.
    And during the work phase :py:meth:`Guest.run_usage_scenario` the us script can be executed.
    These two methods need to be implemented for each class extending the :py:class:`Guest` class.
    """

    ip_address = None

    def __init__(
        self, measurement_id: UUID, network_id: int, device_definition: Device
    ) -> None:
        """Create new guest.

        :param measurement_id: id of the current measurement.
        :param guest_id: id of the eames.
        :param network_id: attach the eames guest to this network.
        """

        with TimescaleService() as timescaleService:
            self.measurement = timescaleService.get_measurement_by_id(measurement_id)
            self.application_variant_prefix = (
                _config.app.application_variant_prefix
                + self.measurement.application_variant_id
            )
        self.measurement_id = measurement_id
        self.guest_id = int(device_definition.id)
        self.device_definition = device_definition
        self.network_id = network_id
        self.domain_mac_address = None

        self.gm_type = self.device_definition.runtime.gm
        self.display_name = self.device_definition.type + self.device_definition.id
        self.domain_name = f"eames-{self.network_id}-{self.guest_id}"

        self.gm_password = _config.hosting.gm_password
        self.gm_username = _config.hosting.gm_username
        self.base_path = _config.hosting.host_paths.base
        self.libvirt_path = _config.hosting.host_paths.libvirt_images
        self.tmp_path = _config.hosting.host_paths.tmp

        self.network_interface = f"ecovnet{self.network_id}-{self.guest_id}"
        self.domain_shared_mount_path = None
        self.domain_drive_path = None
        self.domain_mount_name = None
        self.networking = None

        self.timer = None

        # Overheads für VM-Image auslesen
        with open("./measurement/overhead_config.yaml", "r") as file:
            self.ram_overhead = yaml.safe_load(file)[self.gm_type]["ram_overhead"]

    def startup(self) -> None:
        """Define and start the guest's domain."""
        self.domain_shared_mount_path = join(
            self.base_path,
            "shares",
            _config.app.measurement_prefix + str(self.measurement_id),
            self.application_variant_prefix,
            "applicationvariant",
        )
        self.domain_mount_name = f"mount-{self.network_id}"

        self.domain_drive_path = join(self.libvirt_path, f"{self.domain_name}.qcow2")
        self.domain_mac_address = determine_mac_address(
            self.network_id, self.guest_id + 2
        )
        self.ip_address = determine_ip_address(self.network_id, self.guest_id + 2)
        gateway_ip_address = determine_ip_address(self.network_id, 1)
        bridge_name = f"virbr{self.network_id}"

        self.copy_gm_drive(self.domain_drive_path)

        logger.debug(
            f"Memorize for {self.domain_name}: {self.device_definition.performance.memorize}"
        )
        domain = LibvirtDomain(
            domain_name=self.domain_name,
            uuid=uuid4(),
            memory=int(self.device_definition.performance.memorize),
            vcpus=self.device_definition.cpu.count * self.device_definition.cpu.cores,
            cpu_count=self.device_definition.cpu.count,
            cores_per_cpu=self.device_definition.cpu.cores,
            source_file=Path(self.domain_drive_path),
            mount_host_directory=Path(self.domain_shared_mount_path),
            mount_shortcut=Path(self.domain_mount_name),
            mac_address=self.domain_mac_address,
            bridge_name=bridge_name,
            device_name=self.network_interface,
            network_gateway_ip=IPv4Address(gateway_ip_address),
            network_max_inbound=int(self.device_definition.performance.transfer / 1024),
            network_max_outbound=int(
                self.device_definition.performance.transfer / 1024
            ),
        )

        logger.info(
            f"Creating client {self.domain_name} for measurement {self.measurement_id} and network id {self.network_id}. Using network id instead of measurement id in client name because uuids are too long."
        )

        libvirt_adapter().create_domain(xml=domain.get_config())

        logger.info(
            f"Client {self.domain_name} for measurement {self.measurement_id}, network id {self.network_id} created"
        )

    def prepare(self) -> None:
        # Ensure connection
        logger.info(
            f"Attempting to connect to client {self.domain_name} for measurement {self.measurement_id}, network id {self.network_id}. This may take a while."
        )

        connection_args = [
            "sshpass",
            "-p",
            f"{self.gm_password}",
            "ssh",
            "-o",
            "StrictHostKeyChecking=no",
            f"{self.gm_username}@{self.ip_address}",
            "exit;",
        ]
        result = subprocess_handler.run_subprocess(
            connection_args,
            f"guest-connect-{self.network_id}-{self.guest_id}",
            str(self.measurement_id),
            self.guest_id,
            True,
        )
        while result != 0:
            result = subprocess_handler.run_subprocess(
                connection_args,
                f"guest-connect-{self.network_id}-{self.guest_id}",
                str(self.measurement_id),
                self.guest_id,
                True,
            )

        self.start_collection()

        # Change hostname & mount shared folder
        subprocess_handler.run_subprocess(
            [
                "sshpass",
                "-p",
                f"{self.gm_password}",
                "ssh",
                f"{self.gm_username}@{self.ip_address}",
                f'sudo hostnamectl set-hostname {self.domain_name} && mkdir -v ~/shared_mount && sudo mount -v -t virtiofs {self.domain_mount_name} ~/shared_mount && echo "{self.domain_mount_name} /home/{self.gm_username}/shared_mount virtiofs defaults 0 0" >> /etc/fstab && sudo systemctl daemon-reload && sudo mount -va',
            ],
            f"guest-configure-{self.network_id}-{self.guest_id}",
            str(self.measurement_id),
            self.guest_id,
        )

        logger.info(
            f"Client {self.domain_name} with IP {self.ip_address} for measurement {self.measurement_id}, network id {self.network_id} configured."
        )

    def copy_gm_drive(self, domain_drive_path: str):
        logger.info(
            f"Create snapshot of GM for client {self.domain_name} for measurement {self.measurement_id}, network id {self.network_id}."
        )
        drive_path = join(self.libvirt_path, f"eames-gm-{self.gm_type}.qcow2")

        subprocess_handler.run_subprocess(
            [
                "qemu-img",
                "create",
                "-f",
                "qcow2",
                "-F",
                "qcow2",
                "-b",
                str(drive_path),
                domain_drive_path,
                str(self.device_definition.performance.store),
            ],
            f"qemu-img-create-{self.network_id}-{self.guest_id}",
            str(self.measurement_id),
            self.guest_id,
        )

        logger.info(
            f"Created snapshot of GM for client {self.domain_name} for measurement {self.measurement_id}, network id {self.network_id} backed by {drive_path} to {domain_drive_path}."
        )

    def start_collection(self) -> None:
        self.timer = RepeatTimer(0.1, lambda: self.collect_metrics())
        self.timer.start()
        logger.info(
            f"Started data collection for guest {self.domain_name} for measurement {self.measurement_id}, network id {self.network_id}."
        )

    def collect_metrics(self):
        with TimescaleService() as time_service:
            measurement_state = time_service.get_measurement_by_id(
                self.measurement_id
            ).state
            time_service.save_dataset(
                DataSet(
                    timestamp=datetime.now(),
                    measurement_id=self.measurement_id,
                    guest_id=self.guest_id,
                    network=self.collect_network_metrics(),
                    cpu_usage=self.collect_cpu_metrics(),
                    ram_usage=self.get_ram_usage_percent_without_overhead(),
                    storage_usage=self.get_storage_usage(),
                    state=measurement_state,
                )
            )

    def install_sut(self) -> None:
        """Run the sut script from the test context inside the guest.

        The sut script must be selected by the guest's id."""
        pass

    def run_us(self) -> None:
        """Run the usage scenario from the test context inside the guest.

        The us script must be selected by the guest's id.
        The us script is optional for any guest."""
        pass

    def cleanup(self) -> None:
        """Destroy and undefine guest."""
        if self.timer:
            self.timer.cancel()
            self.timer.join(1)

        libvirt_adapter().cleanup_domain(self.domain_name)

        subprocess_handler.run_subprocess(
            ["sudo", "rm", self.domain_drive_path],
            f"rm-domain-drive-{self.network_id}-{self.guest_id}",
            str(self.measurement_id),
            self.guest_id,
        )
        subprocess_handler.run_subprocess(
            [
                "sudo",
                "ssh-keygen",
                "-f",
                "/root/.ssh/known_hosts",
                "-R",
                f"{self.ip_address}",
            ],
            f"ssh-keygen-{self.network_id}-{self.guest_id}",
            str(self.measurement_id),
            self.guest_id,
        )

    def collect_network_metrics(self):
        return self.networking.get_counters_for_domain(
            network_guest=NetworkGuest(
                domain_name=self.domain_name,
                network_interface=self.network_interface,
                ip_address=self.ip_address,
                mac_address=self.domain_mac_address,
            )
        )

    def collect_cpu_metrics(self):
        return (
            libvirt_adapter().get_current_cpu_usage(self.domain_name).cpu_time_seconds
        )

    def get_ram_usage_percent_without_overhead(self):
        memory_stats = libvirt_adapter().get_current_mem_usage(self.domain_name)
        return (
            max(memory_stats.current_KiB - self.ram_overhead, 0) / memory_stats.max_KiB
        ) * 100

    def get_storage_usage(self):
        storage_stats = libvirt_adapter().get_current_storage_usage(self.domain_name)
        return (storage_stats.allocation_kiB / storage_stats.capacity_kiB) * 100
