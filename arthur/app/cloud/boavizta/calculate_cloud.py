import datetime
from logging import getLogger
from os.path import basename

from calculation import calculation
from cloud.adapters.boavizta_client import get_environmental_impacts
from cloud.domain.cloud_device import CloudDevice
from cloud.dtos.workload import WorkloadPoint, TimeWorkloadDTO

logger = getLogger(basename(__file__))


def calculate_public_cloud(
    device_definition,
    datasets,
    measured_guest,  # managed von sql alchemy, watch out that it doesn't get referenced after persisting. Should be ok though
):

    if device_definition.cloud_parameters is None:
        raise Exception(
            "calculate_cloud() was called on a device with no cloud parameters in its infrastructure definition"
        )

    elif device_definition.cloud_parameters.is_public:
        return calculate_hyperscaler(device_definition, datasets, measured_guest)

    else:
        raise Exception(
            "calculate_cloud() was called on a device with unknown provider"
        )


def calculate_hyperscaler(device_definition, datasets, measured_guest):
    result = calculation.calculate_utilization_in_buckets(datasets)

    if result != {}:
        workload_points = [
            WorkloadPoint(time_percentage=key, load_percentage=value)
            for key, value in result.items()
        ]

        cloud_device = CloudDevice(
            id="vm-live-test-001",
            provider=device_definition.cloud_parameters.provider,
            instance_type=device_definition.cloud_parameters.instance_type,
            usage_location=device_definition.cloud_parameters.usage_location,
        )

        workload_dto = TimeWorkloadDTO(workload_points)

        dateformat = "%Y-%m-%dT%H:%M:%S.%f"

        start_time: datetime = datasets[0].timestamp
        end_time: datetime = datasets[-1].timestamp
        delta_hours: float = (end_time - start_time).total_seconds() / 3600

        api_response = get_environmental_impacts(
            cloud_device, workload_dto, delta_hours
        )

        emission_factors_impacts = {
            "gwp": api_response.impacts.values["gwp"],
            "adp": api_response.impacts.values["adp"],
            "pe": api_response.impacts.values["pe"],
        }

        return emission_factors_impacts
