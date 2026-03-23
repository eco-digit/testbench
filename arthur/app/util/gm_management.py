"""Module for querying information about golden masters.
Golden masters are used as the `backing image <https://www.libvirt.org/kbase/backing_chains.html>`_ for eames domains.
For each type of domain there exists a golden master, which has a specific OS and predefined set of packages installed.

The golden masters are updated once a day by a cron measurement.
"""

import re
from collections.abc import Iterable
from logging import getLogger
from os.path import basename
from pathlib import Path
from subprocess import run
from xml.etree import ElementTree as ET

from .errors import GMConfigurationError

logger = getLogger(basename(__file__))

DOMAIN_XML_NS = {"ecodigit": "http://ecodigit.de/xmlns/domain/metadata"}


def all_domains(measurement_id: int) -> Iterable[str]:
    """Get all domain names, gm or eames alike, on this host.

    :meta private:
    """
    out = run(
        ["sudo", "virsh", "list", "--all"], capture_output=True, text=True, check=True
    ).stdout
    lines = out.splitlines()[2:]
    lines = filter(lambda line: line, lines)
    return map(lambda line: re.split("\s+", line)[2], lines)


def gm_type_of_domain(domain: str, measurement_id: int) -> str | None:
    """Get the domain type from the domain's xml definition.

    :meta private:
    """
    out = run(
        ["sudo", "virsh", "dumpxml", domain], capture_output=True, text=True, check=True
    ).stdout
    root = ET.fromstring(out)
    domain_type = root.find(".//ecodigit:domain_type", DOMAIN_XML_NS)
    if domain_type is None:
        return None
    return domain_type.text


def is_domain_ready(domain: str, measurement_id: int) -> bool:
    """Get the readiness from the domain's xml definition.

    :meta private:
    """
    out = run(
        ["sudo", "virsh", "dumpxml", domain], capture_output=True, text=True, check=True
    ).stdout
    root = ET.fromstring(out)
    ready_element = root.find(".//ecodigit:ready", DOMAIN_XML_NS)
    if ready_element is None:
        return False
    return ready_element.text == str(True)


def creation_date(domain: str, measurement_id: int) -> str:
    """Get the creation date from the domain's xml definition.

    :meta private:
    """
    out = run(
        ["sudo", "virsh", "dumpxml", domain], capture_output=True, text=True, check=True
    ).stdout
    root = ET.fromstring(out)
    creation_date = root.find(".//ecodigit:creation_date", DOMAIN_XML_NS)
    if creation_date is None:
        raise GMConfigurationError(f"cannot find creation date of domain {domain}")
    return creation_date.text.lower()


def latest_domain(gm_type: str, measurement_id: int) -> str:
    """Get the latest domain, which is ready, of type gm_type.

    :param gm_type: type of the domain.
    :param measurement_id: id of the current measurement.
    :return: the name of the latest domain.
    :raise GMConfigurationError: If no domain of the given type can be found.
    """
    logger.debug("all domains: %s", list(all_domains(measurement_id)))
    domains = filter(
        lambda domain: gm_type_of_domain(domain, measurement_id) == gm_type,
        all_domains(measurement_id),
    )
    domains = filter(lambda domain: is_domain_ready(domain, measurement_id), domains)
    domains = list(domains)
    if not domains:
        raise GMConfigurationError(
            f"no domains applicable as gm found for gm type {gm_type}"
        )
    logger.debug("found the following domains of type %s: %s", gm_type, domains)
    return sorted(domains, key=lambda domain: creation_date(domain, measurement_id))[-1]


def get_domain_drive_path(domain: str, measurement_id: int) -> Path:
    """Get the drive path from the domain's xml defintion.

    The first disk of type disk(not cdrom, etc.) is picked.

    :param domain: name of the domain.
    :param measurement_id: id of the current measurement.
    :return: Path to the image file.
    :raise GMConfigurationError: If there is no disk image assigned to the domain.
    """
    out = run(
        ["sudo", "virsh", "dumpxml", domain], capture_output=True, text=True, check=True
    ).stdout
    root = ET.fromstring(out)
    source_element = root.find("./devices/disk[@type='file'][@device='disk']/source")
    if source_element is None:
        raise GMConfigurationError(f"domain {domain} has no file disk")
    drive_path = source_element.get("file")
    if drive_path is None:
        raise GMConfigurationError(
            f"drive of domain {domain} is missing a file attribute"
        )
    return Path(drive_path)
