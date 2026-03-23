from os import PathLike
from uuid import UUID

import requests
from charset_normalizer.md import getLogger
from requests import HTTPError
from urllib3.exceptions import NameResolutionError, ConnectionError

from adapter.miles.models import MilesMeasurementResult
from config import Config

logger = getLogger(__name__)
config = Config()


class MilesAdapter:
    @staticmethod
    def start_measurement(
        measurement_id,
        apk_path: PathLike,
        ui_test_path: PathLike,
        results_path: PathLike,
    ) -> None:
        if config.services.miles.is_stub:
            return
        try:
            miles_url = (
                f"http://{config.app.miles_host}:{config.app.miles_port}/api/job/new"
            )
            logger.debug(f'Miles URL for measurement "{miles_url}"')
            logger.debug(
                {
                    "id": measurement_id,
                    "name": "name",
                    "appPath": apk_path,
                    "testImagePath": ui_test_path,
                    "resultFolderPath": results_path,
                }
            )
            response = requests.post(
                miles_url,
                timeout=10,
                data={
                    "id": measurement_id,
                    "name": "name",
                    "appPath": apk_path,
                    "testImagePath": ui_test_path,
                    "resultFolderPath": results_path,
                },
            )
            response.raise_for_status()
            return
        except (HTTPError, ConnectionError, NameResolutionError) as error:
            logger.error(f"Failed to connect to Miles API: {error}")
        except TimeoutError as error:
            logger.error(f"Connection to Miles API timed out: {error}")

    @staticmethod
    def is_measurement_finished(measurement_id: UUID) -> bool | None:
        try:
            miles_url = f"http://{config.app.miles_host}:{config.app.miles_port}/api/job/{measurement_id}/status"
            response = requests.get(
                miles_url,
                timeout=10,
            )
            logger.info(response.text)
            response.raise_for_status()
            if response.text == "MEASUREMENT_FAILED":
                raise RuntimeError("Android Measurement has failed")
            if response.text == "MEASUREMENT_FINISHED":
                return True
            return False

        except (HTTPError, ConnectionError, NameResolutionError) as error:
            logger.error(f"Failed to connect to Miles API: {error}")
        except TimeoutError as error:
            logger.error(f"Connection to Miles API timed out: {error}")

    @staticmethod
    def get_measurement_result(measurement_id: UUID) -> MilesMeasurementResult | None:
        if config.services.miles.is_stub:
            return MilesMeasurementResult(duration=31.63, ws=127.94)
        try:
            miles_url = f"http://{config.app.miles_host}:{config.app.miles_port}/api/job/{measurement_id}/result"
            response = requests.get(
                miles_url,
                timeout=10,
            )
            response.raise_for_status()
            print(response.content)
            return MilesMeasurementResult(**response.json())
        except HTTPError as error:
            if error.response.status_code == 404:
                return None
            logger.error(f"Failed HTTPRequest: {error}")
        except (ConnectionError, NameResolutionError) as error:
            logger.error(f"Failed to connect to Miles API: {error}")
        except TimeoutError as error:
            logger.error(f"Connection to Miles API timed out: {error}")
