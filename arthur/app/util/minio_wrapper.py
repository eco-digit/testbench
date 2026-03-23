import os
from logging import getLogger
from os.path import basename
from os.path import join

from minio import Minio
from minio.error import S3Error

from config import Config
from util.exceptions import MinIoFileNotFound

logger = getLogger(basename(__file__))
_config = Config()

# From https://min.io/docs/minio/linux/developers/python/API.html
# NOTE on concurrent usage: Minio object is thread safe when using the Python threading library. Specifically, it is NOT safe to share it between multiple processes, for example when using multiprocessing.Pool. The solution is simply to create a new Minio object in each process, and not share it between processes.


class MinioWrapper:
    def __init__(self):
        self.minio_client = Minio(
            endpoint=f"{_config.services.minio.host}:{_config.services.minio.port}",
            access_key=_config.services.minio.user,
            secret_key=_config.services.minio.password,
            secure=False,
        )

    def make_bucket(self, bucket_name):
        if self.minio_client.bucket_exists(bucket_name):
            return
        self.minio_client.make_bucket(bucket_name)

    def remove_bucket(self, bucket_name):
        if not self.minio_client.bucket_exists(bucket_name):
            return
        for file in self.minio_client.list_objects(bucket_name, recursive=True):
            self.minio_client.remove_object(bucket_name, file.object_name)
        self.minio_client.remove_bucket(bucket_name)

    def put_file(self, bucket_name, object_name, file_path, create_bucket=False):
        try:
            self.minio_client.fput_object(bucket_name, object_name, file_path)
        except S3Error as e:
            if not create_bucket:
                raise e
            self.make_bucket(bucket_name)
            self.put_file(bucket_name, object_name, file_path, create_bucket=False)

    def get_file(self, bucket_name, object_name, file_path):
        self.minio_client.fget_object(bucket_name, object_name, file_path)

    def get_all_files(self, bucket_name, object_prefix, path):
        files = list(
            self.minio_client.list_objects(
                bucket_name, prefix=object_prefix, recursive=True
            )
        )

        if not files:
            raise MinIoFileNotFound(
                f"No files found in bucket '{bucket_name}' with prefix '{object_prefix}'"
            )

        for file in files:
            self.minio_client.fget_object(
                bucket_name, file.object_name, join(path, file.object_name)
            )

    def put_complete_dir(
        self, bucket_name, local_folder, object_prefix=None, include_local_folder=True
    ):
        """
        Lädt einen gesamten Ordner in ein MinIO-Bucket hoch.

        :param bucket_name: Name des MinIO-Buckets.
        :param local_folder: Lokaler Ordner, der hochgeladen werden soll.
        :param object_prefix: Optionaler Präfix für die Objektnamen in MinIO (Präfixe dienen in MinIO als Ordner)
        :param include_local_folder: Falls True, wird der übergebene Hauptordner mit in den Bucket-Pfad hochgeladen. Falls False wird nur der Inhalt des Ordners hochgeladen.
        """
        if not os.path.isdir(local_folder):
            raise ValueError(
                f"Der angegebene Pfad {local_folder} ist kein gültiger Ordner."
            )

        base_path = (
            os.path.dirname(local_folder) if include_local_folder else local_folder
        )
        for root, _, files in os.walk(local_folder):
            for file in files:
                local_file_path = os.path.join(root, file)
                object_name = os.path.relpath(local_file_path, base_path).replace(
                    "\\", "/"
                )
                if object_prefix:
                    object_name = f"{object_prefix}/{object_name}"
                self.put_file(bucket_name, object_name, local_file_path, True)
