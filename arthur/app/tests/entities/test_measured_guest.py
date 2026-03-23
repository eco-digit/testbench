from datetime import datetime, timedelta

import pytest

from entities import DataSet, MeasuredGuest


@pytest.fixture
def sample_dataset_fixture() -> list[DataSet]:
    base_time = datetime.fromisoformat("2021-01-01T01:00:00+00:00")

    return [
        DataSet(
            timestamp=base_time,
            cpu_usage=0.0,
            ram_usage=0.0,
            storage_usage=0.0,
            network={"0.0.0.0": 0, "172.16.2.1": 0, "172.16.2.2": 0},
        ),
        DataSet(
            timestamp=base_time + timedelta(seconds=5),
            cpu_usage=75.0,
            ram_usage=75.0,
            storage_usage=75.0,
            network={"0.0.0.0": 100, "172.16.2.1": 100, "172.16.2.2": 50},
        ),
        DataSet(
            timestamp=base_time + timedelta(seconds=10),
            cpu_usage=100.0,
            ram_usage=100.0,
            storage_usage=100.0,
            network={
                "0.0.0.0": 200,
                "172.16.2.1": 200,
                "172.16.2.2": 50,
                "172.16.2.3": 50,
            },
        ),
        DataSet(
            timestamp=base_time + timedelta(seconds=15),
            cpu_usage=75.0,
            ram_usage=75.0,
            storage_usage=75.0,
            network={
                "0.0.0.0": 300,
                "172.16.2.1": 200,
                "172.16.2.2": 150,
                "172.16.2.3": 150,
            },
        ),
        DataSet(
            timestamp=base_time + timedelta(seconds=20),
            cpu_usage=0.0,
            ram_usage=0.0,
            storage_usage=0.0,
            network={
                "0.0.0.0": 300,
                "172.16.2.1": 300,
                "172.16.2.2": 250,
                "172.16.2.3": 250,
            },
        ),
    ]


def test_calculate_average_cpu_ok(sample_dataset_fixture):
    # WHEN
    avg_cpu_usage = MeasuredGuest.calculate_average_cpu_usage(
        datasets=sample_dataset_fixture
    )

    # THEN
    assert avg_cpu_usage == 50.0


def test_calculate_average_mem_ok(sample_dataset_fixture):
    # WHEN
    avg_mem_usage = MeasuredGuest.calculate_average_ram_usage(
        datasets=sample_dataset_fixture
    )
    # THEN
    assert avg_mem_usage == 50.0


def test_calculate_average_network_ok(sample_dataset_fixture):
    # WHEN
    avg_network_usage = MeasuredGuest.calculate_average_network_usage(
        datasets=sample_dataset_fixture,
        transfer_performance_in_bytes_per_second=100.0,
    )
    # THEN
    assert avg_network_usage == pytest.approx(55.0)


def test_calculate_average_storage_ok(sample_dataset_fixture):
    # WHEN
    avg_storage_usage = MeasuredGuest.calculate_average_storage_usage(
        datasets=sample_dataset_fixture,
    )
    # THEN
    assert avg_storage_usage == 50.0
