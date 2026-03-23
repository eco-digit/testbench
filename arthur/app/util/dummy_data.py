from logging import getLogger
from os.path import join

from config import Config
from .minio_wrapper import MinioWrapper

logger = getLogger(__name__)
_config = Config()


def put_tc_android_into_minio():
    minio_client = MinioWrapper()
    logger.info("Putting Android test-context into minio")
    minio_client.put_complete_dir(
        _config.services.minio.application_variants_bucket,
        join(
            _config.hosting.host_paths.dummy_test_context,
            "applicationvariant-android",
        ),
        join("applicationvariant-android", "applicationvariant"),
        False,
    )


def put_tc_firewall_into_minio():
    minio_client = MinioWrapper()
    logger.info("Putting Firewall test-context into minio")
    minio_client.put_complete_dir(
        _config.services.minio.application_variants_bucket,
        join(
            _config.hosting.host_paths.dummy_test_context,
            "applicationvariant-firewall_check",
        ),
        join("applicationvariant-firewall_check", "applicationvariant"),
        False,
    )


def put_tc_cloud_firewall_into_minio():
    minio_client = MinioWrapper()
    logger.info("Putting Cloud + Firewall test-context into minio")
    minio_client.put_complete_dir(
        _config.services.minio.application_variants_bucket,
        join(
            _config.hosting.host_paths.dummy_test_context,
            "applicationvariant-cloud_firewall_check",
        ),
        join("applicationvariant-cloud_firewall_check", "applicationvariant"),
        False,
    )


def put_tc_locust_into_minio():
    minio_client = MinioWrapper()
    logger.info("Putting Locust test-context into minio")
    minio_client.put_complete_dir(
        _config.services.minio.application_variants_bucket,
        join(
            _config.hosting.host_paths.dummy_test_context,
            "applicationvariant-teastore_locust",
        ),
        join("applicationvariant-teastore_locust", "applicationvariant"),
        False,
    )


def put_teastore_server_client_into_minio():
    minio_client = MinioWrapper()
    logger.info(
        "Putting applicationvariant-teastore_serverclient test-context into minio"
    )
    minio_client.put_complete_dir(
        _config.services.minio.application_variants_bucket,
        join(
            _config.hosting.host_paths.dummy_test_context,
            "applicationvariant-teastore_serverclient",
        ),
        join("applicationvariant-teastore_serverclient", "applicationvariant"),
        False,
    )


def put_tc_teastore_distributed_into_minio():
    minio_client = MinioWrapper()
    logger.info(
        "Putting applicationvariant-teastore_distributed test-context into minio"
    )
    minio_client.put_complete_dir(
        _config.services.minio.application_variants_bucket,
        join(
            _config.hosting.host_paths.dummy_test_context,
            "applicationvariant-teastore_distributed",
        ),
        join("applicationvariant-teastore_distributed", "applicationvariant"),
        False,
    )
