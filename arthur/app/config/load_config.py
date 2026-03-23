from logging import getLogger
from os import PathLike
from pathlib import Path

import yaml
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from yaml import YAMLError

logger = getLogger(__name__)


class AppConfig(BaseModel):
    port: int
    host: str
    measurement_timeout: int = 10800
    measurement_prefix: str = "measurement-"
    application_variant_prefix: str = "applicationvariant-"
    miles_host: str = "127.0.0.1"
    miles_port: int = 8081


class HostPathsConfig(BaseModel):
    base: Path
    tmp_measurement_subpath: str
    tmp: str
    libvirt_images: str
    dummy_test_context: PathLike = Path("/arthur/test_contexts")


class GuestPathsConfig(BaseModel):
    shared_mount: str


class HostingConfig(BaseModel):
    gm_username: str
    gm_password: str
    host_paths: HostPathsConfig
    guest_paths: GuestPathsConfig


class MinioConfig(BaseModel):
    host: str
    port: int
    user: str
    password: str
    application_variants_bucket: str


class TimescaleConfig(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str


class RabbitMQConfig(BaseModel):
    host: str
    port: int
    user: str
    password: str


class MilesConfig(BaseModel):
    host: str
    port: int
    is_stub: bool = False


class ServicesConfig(BaseModel):
    minio: MinioConfig
    timescale: TimescaleConfig
    rabbitmq: RabbitMQConfig
    miles: MilesConfig


class LoggingConfig(BaseModel):
    log_level: str = "INFO"
    log_path: str
    log_subpath: str


class RemoveMeConfig(BaseModel):
    cleanup_start: int = 0
    cleanup_end: int = 0


# class Singleton(type):
#    _instances = {}
#    def __call__(cls, *args, **kwargs):
#        if cls not in cls._instances:
#            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
#        return cls._instances[cls]


# class Config(BaseSettings, metaclass=Singleton):
class Config(BaseSettings):
    app: AppConfig
    hosting: HostingConfig
    services: ServicesConfig
    logging: LoggingConfig
    remove_me: RemoveMeConfig

    _config_file_path: str = "config.yaml"

    def __init__(self, **data):
        try:
            with open((Path(__file__).parent.parent / "config.yaml"), "r") as f:
                data = yaml.safe_load(f)
            super().__init__(**data)
        except FileNotFoundError:
            logger.warning("Configuration file not found")
        except YAMLError:
            logger.error("Configuration file could not be loaded")


# def load_config(file_path: str) -> Config:
#    with open(file_path, 'r') as f:
#        data = yaml.safe_load(f)

#    return Config(**data)

# try:
# settings = load_config("../config.yaml")
#    settings = load_config("config.yaml")
#    print(settings.app)
# except FileNotFoundError:
#    print("Config file not found.")
# except Exception as e:
#    print(f"Error loading config: {e}")
