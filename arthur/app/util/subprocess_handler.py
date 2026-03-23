import os
from logging import getLogger
from os.path import basename, join
from subprocess import Popen
from threading import Lock
import signal
from typing import List

from config import Config

logger = getLogger(basename(__file__))
_config = Config()

# threadsicher für parallele Starts
running_processes: dict[str, Popen] = {}
process_lock = Lock()


def run_subprocess(
    command_arguments: List[str],
    name: str,
    measurement_id: str,
    client_id: int = None,
    ignore_error: bool = False,
) -> int:
    logger.debug("running cmd %s", str(command_arguments))
    tmp_measurement_path = join(
        _config.hosting.host_paths.base,
        _config.hosting.host_paths.tmp_measurement_subpath,
    )
    measurement_prefix = _config.app.measurement_prefix

    log_dir = join(
        tmp_measurement_path, measurement_prefix + str(measurement_id), "logs"
    )
    os.makedirs(log_dir, exist_ok=True)

    log_file_path = (
        join(log_dir, f"{measurement_id}-{client_id}.log")
        if client_id is not None
        else join(log_dir, f"{measurement_id}.log")
    )
    with open(log_file_path, "a+") as file:
        process_id = create_process_id(measurement_id, client_id)
        subprocess = Popen(command_arguments, stdout=file, stderr=file)

        # Registrierung
        with process_lock:
            running_processes[process_id] = subprocess

        file.write(
            f"End of output from subprocess {name} (or maybe not, async and stuff).\n"
        )

        return_code = subprocess.wait()

        # Aufräumen nach Beendigung
        with process_lock:
            running_processes.pop(process_id, None)

        if return_code == 0:
            logger.info(f"Subprocess {name} finished successfully.")
        elif return_code == 3:
            logger.info(
                f"Application Variant for measurement {measurement_id} not found"
            )
        elif return_code == 4:
            logger.info(
                f"Measurement {measurement_id} successfully stopped by endpoint or timeout"
            )
        elif not ignore_error:
            raise SubprocessError(
                f"Subprocess {name} failed with exit code {return_code}"
            )

        return return_code


def stop_subprocess(measurement_id: str):
    with process_lock:
        proc = running_processes.get(measurement_id)

    if proc:
        logger.info(f"Stopping measurement {measurement_id} with PID {proc.pid}")
        proc.send_signal(signal.SIGTERM)
    else:
        logger.info(f"No running process found for measurement {measurement_id}")


def stop_subprocess_with_timeout(measurement_id: str):
    with process_lock:
        proc = running_processes.get(measurement_id)

    if proc:
        logger.info(
            f"Stopping measurement {measurement_id} with PID {proc.pid} because of timeout"
        )
        proc.send_signal(signal.SIGTERM)
    else:
        logger.info(f"No running process found for measurement {measurement_id}")


def create_process_id(measurement_id, client_id):
    return (
        f"{str(measurement_id)}{'_' + str(client_id) if client_id is not None else ''}"
    )


class SubprocessError(Exception):
    pass
