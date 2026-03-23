from logging import getLogger
from os.path import basename
from uuid import UUID

from guest import Guest
from infrastructure_definition.models import Device
from util import subprocess_handler

logger = getLogger(basename(__file__))


class LinuxGuest(Guest):
    """Emulate a generic linux device.

    To emulate the linux device, a libvirt virtual machine is started.

    The guest's metrics are periodically collected with the libvirt interface.
    """

    def __init__(
        self,
        measurement_id: UUID,
        network_id: int,
        device_definition: Device,
    ) -> None:
        super().__init__(
            measurement_id,
            network_id,
            device_definition,
        )

    def install_sut(self) -> None:
        super().install_sut()
        subprocess_handler.run_subprocess(
            [
                "sshpass",
                "-p",
                f"{self.gm_password}",
                "ssh",
                f"{self.gm_username}@{self.ip_address}",
                f"cd ~/shared_mount/sut/ && sudo ./sut-starter-{self.guest_id}.sh",
            ],
            f"install-sut-linux-{self.network_id}-{self.guest_id}",
            str(self.measurement_id),
            self.guest_id,
        )

    def run_us(self) -> None:
        super().run_us()
        subprocess_handler.run_subprocess(
            [
                "sshpass",
                "-p",
                f"{self.gm_password}",
                "ssh",
                f"{self.gm_username}@{self.ip_address}",
                f"cd ~/shared_mount/us/ && sudo ./us-starter-{self.guest_id}.sh",
            ],
            f"run-us-linux-{self.network_id}-{self.guest_id}",
            str(self.measurement_id),
            self.guest_id,
        )

    def cleanup(self) -> None:
        super().cleanup()
        logger.info(
            f"Ended data collection for guest {self.domain_name} for measurement {self.measurement_id}."
        )
