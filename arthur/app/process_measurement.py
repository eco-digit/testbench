"""This module serves as the bridge between the flask calls and the necessary eameses (linux or android).
It gets the measurement id from yusuf/flask and processes the measurement using the files provided by the database in its shared folder.
"""

import json
import os
import sys
from datetime import timezone, datetime
from logging import getLogger
from os import walk, chmod
from os.path import isfile, join
from re import findall
from shutil import rmtree
from subprocess import CalledProcessError
from uuid import UUID
from datetime import datetime

from git import Repo

from adapter.libvirt import LibvirtNetwork, libvirt_adapter
from calculation import calculation
from calculation.calculation import calculate_score_mobile
from cloud.adapters.boavizta_client import get_environmental_impacts
from cloud.boavizta import calculate_public_cloud
from cloud.domain.cloud_device import CloudDevice
from cloud.dtos.workload import TimeWorkloadDTO, WorkloadPoint
from config import Config
from db.timescale_service import TimescaleService
from entities import MeasuredGuest
from export import csv_exporter
from guest import Guest, LinuxGuest
from guest.mobile.mobile_guest import MobileGuest
from infrastructure_definition.factory import build_devices
from infrastructure_definition.repository import InfrastructureRepository
from measurement.measurement import *
from networking import NetworkInformation, NetworkGuest
from networking.networking import Networking
from util import (
    determine_mac_address,
    determine_ip_address,
    MinioWrapper,
    configure_logger,
)
from util.errors import ClientScriptError
from util.exceptions import MinIoFileNotFound, ApplicationVariantNotFound
from util.rabbitmq_service import rabbitmq_listener

logger = getLogger(__name__)
_config = Config()


def process_measurement(measurement_id: UUID) -> None:
    try:
        configure_logger(
            join(
                _config.logging.log_path,
                "process_measurement.log",
            ),
        )
        processor = MeasurementProcessor(measurement_id)
        logger.info(f"Starting measurement {measurement_id}.")
        processor.prepare()
        processor.install()
        processor.work()
        logger.info(f"Finished measurement {measurement_id}.")
    except ApplicationVariantNotFound as avnfe:
        logger.warning(str(avnfe))
        processor.final_state = StateEnum.FAILED_ARTHUR
        processor.error_code = ErrorCode.APPLICATION_VARIANT_NOT_FOUND
        sys.exit(3)
    except Exception as e:
        processor.measurement_interrupted = True
        logger.info(f"Error in measurement {measurement_id}.")
        logger.exception(e)
        if isinstance(e, ClientScriptError):
            processor.final_state = StateEnum.FAILED_SUT
            processor.error_code = ErrorCode.SUT
        else:
            processor.final_state = StateEnum.FAILED_ARTHUR
            processor.error_code = ErrorCode.ARTHUR
    finally:
        processor.cleanup()
        processor.collect_and_aggregate()
        processor.persist_logs_and_results()
        # measurement_service.update_measurement_state(
        #     processor.measurement, processor.final_state, processor.error_code
        # )


class MeasurementProcessor:
    short_id: int
    measurement_state: StateEnum = StateEnum.QUEUED

    def __init__(self, measurement_id: UUID) -> None:
        """Initialize this MeasurementPressor for a given measurement.

        This step starts the prepare phase.

        :param measurement_id: id of the newly created measurement.
        :param config_data: Configuration data parsed from the configuration file.
        """

        # Initialize MinIO
        self.minio_client = MinioWrapper()
        self.measurement_id = measurement_id

        # Initialize RabbitMQ
        # rabbitmq_service.init_rabbitmq()

        self.short_id = MeasurementProcessor._get_short_id()

        # Assign parameters to class variables
        with TimescaleService() as timescale_service:
            self.measurement = timescale_service.get_measurement_by_id(
                measurement_id=measurement_id
            )

            self.application_variant_id_with_prefix = (
                _config.app.application_variant_prefix
                + self.measurement.application_variant_id
            )

        self.measurement_id_with_prefix = _config.app.measurement_prefix + str(
            self.measurement_id
        )
        self.measurement_interrupted = False
        self.final_state = StateEnum.COMPLETED
        self.error_code = ErrorCode.NONE

        self.devices_list: list = []
        self.devices_by_id: dict = {}
        self.prepared_guests: list[Guest] = []
        self.guest_count = None
        self.networking = None

        self.tmp_measurement_path = join(
            _config.hosting.host_paths.base,
            _config.hosting.host_paths.tmp_measurement_subpath,
        )
        self.shared_folder_path = join(
            _config.hosting.host_paths.base, "shares", self.measurement_id_with_prefix
        )

        self.minio_bucket_name = _config.services.minio.application_variants_bucket
        self.minio_measurement_object_prefix = self.application_variant_id_with_prefix

        self._update_state(StateEnum.STARTED)

    def prepare(self) -> None:
        self._update_state(StateEnum.PREPARE)
        logger.info(f"Prepare measurement {self.measurement_id}.")
        with TimescaleService() as timescale_service:
            measurement = timescale_service.get_measurement_by_id(self.measurement_id)
            try:
                # Check If Git Source
                if measurement.git_access_type == "REPOSITORY_ACCESS_TOKEN":
                    self.download_with_access_token_test_context()
                if measurement.git_access_type == "PUBLIC_REPOSITORY":
                    self.download_form_public_git_test_context()
                if measurement.git_access_type == "MANUAL_UPLOAD":
                    self.download_test_context()
            except MinIoFileNotFound:
                raise ApplicationVariantNotFound(
                    "Application-Variant "
                    + measurement.application_variant_id
                    + " not found"
                )

        repo = InfrastructureRepository(
            join(
                self.shared_folder_path,
                self.application_variant_id_with_prefix,
                "applicationvariant",
                "infrastructure_definition",
            )
        )
        devices = build_devices(repo, "infrastructure_definition.json")
        self.devices_list = devices
        self.devices_by_id = {d.id: d for d in devices}
        self.configure_virtual_network()
        self.fill_guests_placeholders()
        self.prepare_guests()

    def install(self) -> None:
        self._update_state(StateEnum.INSTALL)
        self.install_sut()

    def work(self) -> None:
        self._update_state(StateEnum.WORK)
        self.run_us()

    def cleanup(self) -> None:
        self._update_state(StateEnum.CLEANUP)
        try:
            self.remove_guests()
            self.networking.cleanup_counters()
            self.remove_network()
        except CalledProcessError as error:
            logger.error("Error cleaning up: %s", error)

    def _update_state(self, new_state: StateEnum) -> None:

        json_object = {
            "measurementId": self.measurement_id,
            "userId": "550e8400-e29b-41d4-a716-446655440000",
            "measurementState": new_state.value,
            **(
                {"errorCode": self.error_code}
                if self.error_code is not None and self.error_code != ErrorCode.NONE
                else {}
            ),
            "createdAt": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
        }
        rabbitmq_listener.send_message(
            json.dumps(json_object),
            "measurementStatus",
            "measurementStatus",
        )
        logger.info(
            f"Measurement for measurement {self.measurement_id} has new state {new_state}."
        )

        self.measurement_state = new_state
        with TimescaleService() as timescale_service:
            timescale_service.update_measurement_state(
                self.measurement_id, self.measurement_state
            )

    def collect_and_aggregate(self) -> None:
        self._update_state(StateEnum.COLLECT)
        if not self.measurement_interrupted:
            with TimescaleService() as timescale_service:
                measurement = timescale_service.get_measurement_by_id(
                    self.measurement_id
                )

                for index, prepared_guest in enumerate(self.prepared_guests):
                    if isinstance(prepared_guest, MobileGuest):
                        ecodigit_score = calculate_score_mobile(
                            mobile_guest=prepared_guest, datasets=datasets
                        )
                        timescale_service.save_measured_guest(
                            measured_guest=MeasuredGuest(
                                measurement_id=self.measurement_id,
                                guest_id=prepared_guest.guest_id,
                                state=StateEnum.COLLECT,
                                domain_name="Android",
                                gm_type="",
                                eco_digit_score=ecodigit_score,
                            )
                        )

                    else:
                        for state in [
                            StateEnum.PREPARE,
                            StateEnum.INSTALL,
                            StateEnum.WORK,
                            StateEnum.COLLECT,
                            StateEnum.CLEANUP,
                        ]:
                            datasets = timescale_service.get_datasets_by_measurement_id_guest_id_and_state(
                                measurement_id=self.measurement_id,
                                guest_id=prepared_guest.guest_id,
                                new_state=state,
                            )
                            measured_guest = MeasuredGuest(
                                measurement_id=self.measurement_id,
                                guest_id=prepared_guest.guest_id,
                                state=state,
                                domain_name=prepared_guest.domain_name,
                                gm_type=prepared_guest.gm_type,
                                ram_overhead=prepared_guest.ram_overhead,
                                average_cpu_usage=MeasuredGuest.calculate_average_cpu_usage(
                                    datasets=datasets
                                ),
                                average_ram_usage_without_overhead=MeasuredGuest.calculate_average_ram_usage(
                                    datasets=datasets
                                ),
                                average_storage_usage=MeasuredGuest.calculate_average_storage_usage(
                                    datasets=datasets
                                ),
                                average_network_usage=MeasuredGuest.calculate_average_network_usage(
                                    datasets=datasets,
                                    transfer_performance_in_bytes_per_second=prepared_guest.device_definition.performance.transfer,
                                ),
                            )

                            if (
                                prepared_guest.device_definition.cloud_parameters
                                is not None
                            ):
                                if (
                                    prepared_guest.device_definition.cloud_parameters.is_public
                                ):
                                    calculate_public_cloud(
                                        prepared_guest.device_definition,
                                        datasets,
                                        measured_guest,
                                    )

                            if (
                                not prepared_guest.device_definition.cloud_parameters
                                or not prepared_guest.device_definition.cloud_parameters.is_public
                            ):
                                # Calculate Eco:Digit-Score
                                calculation.calculate_single_eco_digit_score(
                                    prepared_guest,
                                    measured_guest,
                                    datasets=datasets,
                                    time_execution=MeasuredGuest.get_duration_of_dataset(
                                        datasets=datasets
                                    ).total_seconds(),
                                )
                            timescale_service.save_measured_guest(
                                measured_guest=measured_guest
                            )

                full_measurement_datasets = (
                    timescale_service.get_datasets_by_measurement_id(
                        measurement_id=self.measurement_id
                    )
                )
                measurement.simulation_duration = MeasuredGuest.get_duration_of_dataset(
                    datasets=full_measurement_datasets
                )

                calculation.calculate_total_results(measurement)
                timescale_service.save_measurement(measurement)

    def download_test_context(self):
        self.minio_client.get_all_files(
            f"{_config.services.minio.application_variants_bucket}",
            join(self.application_variant_id_with_prefix, "applicationvariant"),
            self.shared_folder_path,
        )
        # TODO validate (check if infra exists and is valid, check if all machines have sut's (or not?!), check if all machines have us's (or not?!))

    def download_form_public_git_test_context(self):
        # URL des Git-Repositories
        repo_url = self.measurement.git_url

        # Zielpfad, in den das Repository geklont werden soll
        destination_path = self.shared_folder_path

        # Repository klonen
        try:
            Repo.clone_from(repo_url, destination_path)
            print(f"Repository wurde erfolgreich nach '{destination_path}' geklont.")
        except Exception as e:
            print(f"Fehler beim Klonen des Repositories: {e}")

    def download_with_access_token_test_context(self):
        # URL des Git-Repositories
        access_token = self.measurement.git_access_token
        repo_url = self.measurement.git_url

        token_url = repo_url.replace("https://", f"https://{access_token}@")

        # Zielpfad, in den das Repository geklont werden soll
        destination_path = (
            self.shared_folder_path
            + "/applicationvariant-"
            + self.measurement.application_variant_id
            + "/applicationvariant"
        )

        # Repository klonen
        try:
            Repo.clone_from(token_url, destination_path)
            logger.info(
                f"Repository wurde erfolgreich nach '{destination_path}' geklont."
            )
        except Exception as e:
            logger.info(f"Fehler beim Klonen des Repositories: {e}")

    def configure_virtual_network(self) -> None:
        """Configure network the eames domains are running in."""

        network_name = f"vnet{self.short_id}"
        network_bridge_name = f"virbr{self.short_id}"
        network_gateway_mac_address = determine_mac_address(self.short_id, 1)
        network_gateway_ip_address = determine_ip_address(self.short_id, 1)

        network_guests = []

        for index, device in enumerate(self.devices_list):
            if device.type == "server":
                guest_mac_address = determine_mac_address(self.short_id, index + 2)
                guest_ip_address = determine_ip_address(self.short_id, index + 2)
                network_guests.append(
                    NetworkGuest(
                        domain_name=f"eames-{self.short_id}-{index}",
                        network_interface=f"ecovnet{self.short_id}-{index}",
                        ip_address=guest_ip_address,
                        mac_address=guest_mac_address,
                    )
                )

        # Create network
        logger.info(
            f"Creating network {network_name} for measurement {self.measurement_id}."
        )

        self.networking = Networking(
            network=LibvirtNetwork(
                name=network_name,
                max_inbound=2500,
                max_outbound=2500,
                bridge=network_bridge_name,
                gateway_mac=network_gateway_mac_address,
                gateway_ip=network_gateway_ip_address,
                dhcp_entries=network_guests,
            ),
            network_information=NetworkInformation(
                subnet=f"{network_gateway_ip_address}/24",
                network_id=self.short_id,
                guests=network_guests,
            ),
        )

        self.networking.create_network()

        logger.info(
            f"Network {network_name} for measurement {self.measurement_id} created"
        )

    def fill_guests_placeholders(self) -> None:
        """Replace placeholders with actual ip addresses in the sut and us files."""
        eames_mount_path = _config.hosting.guest_paths.shared_mount

        for dirpath, _, filenames in walk(
            join(self.shared_folder_path, self.application_variant_id_with_prefix)
        ):
            for filename in filenames:
                try:
                    path = join(dirpath, filename)
                    with open(path) as file:
                        filedata = file.read()

                    for i in range(len(self.devices_list)):
                        filedata = filedata.replace(
                            f"{{{{eco_digit_ip_{i}}}}}",
                            determine_ip_address(self.short_id, i + 2),
                        )

                    filedata = filedata.replace(
                        f"{{{{eco_digit_path}}}}", eames_mount_path
                    )

                    with open(path, "w") as file:
                        file.write(filedata)
                    chmod(path, 0o555)  # TODO check whether this is the best way
                except:
                    print(
                        "A file in the test context could not be read. (This is normal for binary files. If it happens for every file, it might be a permission or directory path error.)"
                    )

        logger.info(
            f"IP addresses, paths updated, execution enabled for files for measurement {self.measurement_id}."
        )

    def prepare_guests(self) -> None:
        """Define and start eames instances configured in the virtual infrastructure definition."""
        self.prepared_guests: list[Guest] = []

        for device in self.devices_list:
            guest = list[Guest]
            if device.type == "server":
                guest = LinuxGuest(
                    self.measurement_id,
                    self.short_id,
                    device,
                )

            if device.type == "mobile":
                guest = MobileGuest(
                    self.measurement_id,
                    self.short_id,
                    device,
                )

            self.prepared_guests.append(guest)
            guest.startup()

        self.guest_count = len(self.prepared_guests)
        self.networking.create_counters()

        for guest in self.prepared_guests:
            guest.networking = self.networking
            guest.prepare()

    def install_sut(self) -> None:
        """Run the sut scripts for each domain.

        The scripts are run sequentially in order of the eames definition inside the
        ``virtual_infrastructure_defintion.json``.
        Not parallelized because of possible dependencies.
        This step corresponds to the installation phase.
        """
        for index in range(self.guest_count):
            logger.info(
                f"Started installation on client {index} ({index + 1}/{self.guest_count})."
            )
            self.prepared_guests[index].install_sut()
            logger.info(
                f"Finished installation on client {index} ({index + 1}/{self.guest_count})."
            )

    def run_us(self) -> None:
        """Execute the usage scenario scripts.

        The scripts are run sequentially in order of the eames definition inside the
        ``virtual_infrastructure_defintion.json``.
        Not parallelized because of possible dependencies.
        This step corresponds to the work phase.
        """
        for index in range(self.guest_count):
            guest = self.prepared_guests[index]
            if not isfile(
                join(
                    self.shared_folder_path,
                    self.application_variant_id_with_prefix,
                    "applicationvariant",
                    "us",
                    f"us-starter-{guest.guest_id}.sh",
                )
            ):  # TODO
                logger.info(
                    f"No work on client {index}-({index + 1}/{self.guest_count}), skipping!"
                )
                continue
            logger.info(
                f"Started work on client {index}-({index + 1}/{self.guest_count})."
            )
            guest.run_us()
            logger.info(
                f"Finished work on client {index}-({index + 1}/{self.guest_count})."
            )

    def persist_logs_and_results(self):
        # create result csv files
        with TimescaleService() as timescale_service:
            measurement = timescale_service.get_measurement_by_id(self.measurement_id)
            csv_exporter.create_result_csv_files(
                measurement,
                join(
                    self.tmp_measurement_path,
                    self.measurement_id_with_prefix,
                    "results",
                ),
            )

        try:
            self.minio_client.put_complete_dir(
                self.minio_bucket_name,
                join(self.tmp_measurement_path, self.measurement_id_with_prefix),
                self.minio_measurement_object_prefix,
                True,
            )
        except ValueError as value_error:
            logger.warning(str(value_error))
            pass
        self._update_state(StateEnum.COMPLETED)

    def remove_guests(self):
        logger.info(
            f"Started removing guests for measurement {self.measurement_id} with {self.guest_count} guest(s)."
        )
        for guest in self.prepared_guests:
            guest.cleanup()
        if os.path.exists(join(self.shared_folder_path)):
            rmtree(join(self.shared_folder_path))
        logger.info(
            f"Finished removing guests for measurement {self.measurement_id} with {self.guest_count} guest(s)."
        )

    def remove_network(self):
        logger.info(
            f"Started removing network-id {self.short_id} for measurement {self.measurement_id}."
        )
        self.networking.cleanup_network()

        logger.info(
            f"Finished removing network for measurement {self.measurement_id}, network id {self.short_id}."
        )

    @staticmethod
    def _get_short_id() -> int:
        all_networks = libvirt_adapter().get_all_network_names()
        used_ids = {
            int(vnet_id)
            for network in all_networks
            for vnet_id in findall(r"vnet(\d+)", network)
        }
        available = set(range(1, 4097)) - used_ids

        return min(available)


# TODO necessary?!
if __name__ == "__main__":
    process_measurement(sys.argv[1])
