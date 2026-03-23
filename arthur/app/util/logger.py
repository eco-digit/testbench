import sys
from logging import (
    basicConfig,
    FileHandler,
    getLevelName,
    StreamHandler,
    getLogger,
    WARNING,
)

from config import Config

_config = Config()


def configure_logger(log_path: str) -> None:
    basicConfig(
        level=getLevelName(_config.logging.log_level),
        format=f"%(asctime)s.%(msecs)03d %(levelname)-5s %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[FileHandler(log_path), StreamHandler(stream=sys.stdout)],
    )
    getLogger("pika").setLevel(WARNING)
