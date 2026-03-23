import glob
import os.path
import time
from logging import getLogger
from pathlib import Path
from threading import Event
from uuid import UUID

from adapter.miles.miles_adapter import MilesAdapter
from adapter.miles.models import MilesMeasurementResult
from config import Config
from guest import Guest
from infrastructure_definition.models import Device
from util.rabbitmq_service import rabbitmq_listener

logger = getLogger(__name__)
config = Config()


class MobileGuest(Guest):
    measurement_result: MilesMeasurementResult | None = None

    def __init__(
        self, measurement_id: UUID, network_id: int, device_definition: Device
    ):
        super().__init__(measurement_id, network_id, device_definition)
        self.rabbitmq_listener = rabbitmq_listener
        self._work_finished_event = Event()

        base_context_path: Path = (
            Path(f"measurement-{measurement_id}")
            / self.application_variant_prefix
            / "applicationvariant"
        )

        search_pattern: Path = (
            Path(config.hosting.host_paths.base)
            / "shares"
            / base_context_path
            / "sut"
            / device_definition.id
            / "*.apk"
        )

        self.results_path: Path = (
            Path(f"measurement-{measurement_id}")
            / "results"
            / str(device_definition.id)
        )
        (Path(config.hosting.host_paths.base) / "shares" / self.results_path).mkdir(
            parents=True, exist_ok=True
        )

        logger.info(f"APK Search pattern: {search_pattern}")
        all_apks = glob.glob(str(search_pattern))

        if len(all_apks) == 0:
            raise ValueError("APK cannot be found")
        elif len(all_apks) > 1:
            raise ValueError("More than one APK found")
        else:
            self.apk_path = Path(
                os.path.relpath(all_apks[0], config.hosting.host_paths.base / "shares")
            )

        self.ui_test_path: Path = base_context_path / "us" / device_definition.id

        MilesAdapter.start_measurement(
            measurement_id=measurement_id,
            apk_path=self.apk_path,
            ui_test_path=self.ui_test_path,
            results_path=self.results_path,
        )

    def startup(self):
        logger.info("Android Guests do not have a STARTUP stage")

    def prepare(self) -> None:
        logger.info("Android Guests do not have a PREPARE stage")

    def install_sut(self) -> None:
        while not MilesAdapter.is_measurement_finished(self.measurement_id):
            time.sleep(5)

        self.measurement_result = MilesAdapter.get_measurement_result(
            self.measurement_id
        )
        logger.info(
            f"Miles measurement result: Duration={self.measurement_result.duration}s Power={self.measurement_result.ws}Ws"
        )

    def run_us(self) -> None:
        logger.info("Android Guests do not have a WORK stage")

    def _on_miles_update(self, message, properties):
        logger.info(f"Update received with message {message}")
        self._work_finished_event.set()

    def cleanup(self) -> None:
        self.rabbitmq_listener.deregister_callback(self.measurement_id)
        logger.info("Cleaning up Android Guest")
