import threading
from uuid import UUID

from flask import request, jsonify, Flask
from markupsafe import escape

from db.timescale_manager import timescale_manager
from db.timescale_service import TimescaleService
from entities import Measurement
from measurement.dto.mesurement_result_dto import MeasurementResultDTO
from measurement.measurement import *
from measurement_queue import MQ
from util import subprocess_handler
from util.dummy_data import *
from util.rabbitmq_service import rabbitmq_listener
from util import (
    subprocess_handler,
    put_tc_firewall_into_minio,
    put_tc_locust_into_minio,
    put_tc_cloud_firewall_into_minio,
)

_config = Config()
logger = getLogger(__name__)
app = Flask(__name__)
mq = None


@app.get("/")
def index():
    return "Hello from arthur!"


@app.post("/measurement/<string:measurement_id>/start/<string:application_variant_id>")
def start_measurement(application_variant_id: UUID, measurement_id: UUID):
    # TODO check isnumber (and exists in db?)
    if not mq.stop:  # TODO and other
        if measurement_id is not None:
            with TimescaleService() as timescale_service:
                if timescale_service.exists_measurement_by_id(
                    measurement_id=measurement_id
                ):
                    return (
                        jsonify(
                            {
                                "error": f"Measurement with ID '{measurement_id}' already exists"
                            }
                        ),
                        409,
                    )

            measurement = Measurement(
                id=measurement_id,
                application_variant_id=str(application_variant_id),
                git_access_type=AccessType.MANUAL_UPLOAD,
            )
            with TimescaleService() as timescale_service:
                timescale_service.save_measurement(measurement=measurement)

            # set Timeout
            set_timeout(_config.app.measurement_timeout, measurement_id)
            mq.queue.put(measurement_id)
            return (
                f"Adding measurement {escape(measurement_id)} to the measurement queue!"
            )
        else:
            return "Please provide a valid measurement id!"
    else:
        return "The measurement queue is shut down!"


@app.post(
    "/measurement/<string:measurement_id>/start/<string:application_variant_id>/git"
)
def start_measurement_with_git(measurement_id: UUID, application_variant_id):
    if not mq.stop:
        if measurement_id is not None:
            with TimescaleService() as timescale_service:
                if timescale_service.exists_measurement_by_id(
                    measurement_id=measurement_id
                ):
                    return (
                        jsonify(
                            {
                                "error": f"Measurement with ID '{measurement_id}' already exists"
                            }
                        ),
                        409,
                    )

            data = request.get_json()
            if data is None:
                return jsonify({"error": "Invalid or missing JSON"}), 400

            measurement = Measurement(
                id=measurement_id,
                application_variant_id=application_variant_id,
                # Git Credentials hinterlegen
                git_repository_name=data["repositoryName"],
                git_url=data["repositoryLink"],
                git_access_type=data["accessType"],
                git_access_token=data["accessToken"],
            )
            # measurement_service.update_measurement_state(measurement, StateEnum.QUEUED)
            with TimescaleService() as timescale_service:
                timescale_service.save_measurement(measurement=measurement)

            # set Timeout
            set_timeout(_config.app.measurement_timeout, measurement_id)
            mq.queue.put(measurement_id)
            return (
                f"Adding measurement {escape(measurement_id)} to the measurement queue!"
            )
        else:
            return "Please provide a valid measurement id!"
    else:
        return "The measurement queue is shut down!"


@app.get("/measurement/<string:measurement_id>/result")
def get_measurement_result(measurement_id: UUID):
    with TimescaleService() as timescale_service:
        measurement = timescale_service.get_measurement_by_id(
            measurement_id=measurement_id
        )
        if measurement is None:
            return jsonify({"error": "Measurement not found"}), 404
        return jsonify(
            MeasurementResultDTO.from_entity(measurement=measurement).model_dump()
        )


@app.get("/measurement/<string:measurement_id>/getallresults")
def get_measurement_results(measurement_id: UUID):
    with TimescaleService() as timescale_service:
        measurement = timescale_service.get_measurement_by_id(
            measurement_id=measurement_id
        )
        if measurement is None:
            return jsonify({"error": "Measurement not found"}), 404

        return jsonify(
            {
                "total_results": measurement.to_export_dict(),
                "vm_results": [
                    vm.to_export_dict() for vm in measurement.measured_guests
                ],
                "data_sets": {
                    vm.guest_id: [ds.to_export_dict() for ds in vm.data_sets]
                    for vm in measurement.measured_guests
                },
            }
        )


@app.post("/measurement/<string:measurement_id>/stop")
def stop_measurement(measurement_id):
    subprocess_handler.stop_subprocess(measurement_id)
    return f"Measurement measurement_id stopped"


def set_timeout(timeout, measurement_id):
    t = threading.Timer(timeout, lambda: stop_job_by_timeout(measurement_id))
    t.start()
    logger.info(f"Started timer for measurement {measurement_id}")


def stop_job_by_timeout(measurement_id):
    subprocess_handler.stop_subprocess_with_timeout(measurement_id)
    logger.info(f"Timer for measurement {measurement_id} has ended")


def remove_later_put_tc_into_minio():
    put_tc_android_into_minio()
    put_tc_firewall_into_minio()
    put_tc_cloud_firewall_into_minio()
    # self.put_tc_teastore_distributed_into_minio()
    put_teastore_server_client_into_minio()
    put_tc_locust_into_minio()


if __name__ == "__main__":
    mq = MQ()
    timescale_manager.initialize_database()

    rabbitmq_listener.start()

    # TODO: This puts dummy data into the Minio for testing
    remove_later_put_tc_into_minio()
    app.run(
        debug=True, use_reloader=False, port=_config.app.port, host=_config.app.host
    )
