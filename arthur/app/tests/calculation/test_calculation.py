from logging import getLogger
from pathlib import Path
from datetime import datetime, timezone, timedelta

import pytest
import random

from entities import MeasuredGuest, DataSet
from infrastructure_definition.factory import build_devices
from infrastructure_definition.repository import InfrastructureRepository

logger = getLogger(__name__)


# TODO Needs to be checked
def no_test_calculation():
    # This is moved in here since the test is not executed, but the imports are still checked.
    # Which leads to an issue with the config not being found
    from calculation.calculation import calculate_single_eco_digit_score

    base_dir = Path(__file__).parent / "sample_data"

    repo = InfrastructureRepository(str(base_dir))
    devices = build_devices(repo, "infrastructure_definition.json")
    device0 = devices[0]

    target_score = 2259572.4177518087

    measurement_results = MeasuredGuest(
        average_cpu_usage=20,
        average_ram_usage_without_overhead=10,
        average_storage_usage=50,
        average_network_usage=2,
        device_definition=device0,  # important
    )

    eco_digit_score = calculate_single_eco_digit_score(
        device0, measurement_results, 86400
    )

    logger.info("REAL-SCORE: ", eco_digit_score)
    logger.info("TARGET-SCORE:", target_score)

    # stabile float comparison (== can flip at roundings)
    assert eco_digit_score == pytest.approx(target_score, rel=1e-9, abs=1e-9)


def test_bucket_calculation():
    from calculation.calculation import calculate_utilization_in_buckets

    timestamp_list = []

    last_timestamp = datetime.now(timezone.utc)

    cpu_usage = 0.0

    for idx in range(1000):
        ds = DataSet(timestamp=last_timestamp, cpu_usage=cpu_usage)
        timestamp_list.append(ds)
        increment_seconds = 0.1
        last_timestamp += timedelta(seconds=increment_seconds)

        cpu_delta = random.uniform(0.0, 0.2)
        cpu_usage += cpu_delta

    result_multi_core = calculate_utilization_in_buckets(
        timestamp_list, num_cores=2, resolution=5
    )
    logger.info(result_multi_core)
    assert len(result_multi_core) == 5
