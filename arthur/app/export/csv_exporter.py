import csv
import logging
import os
from typing import List

from entities import Measurement
from .exportable import Exportable

logger = logging.getLogger(__name__)


def create_result_csv_files(measurement: Measurement, target_dir: str) -> None:
    logger.info("Exporting measurement-results to csv")
    logger.debug(measurement)
    save_export_object_list_to_csv([measurement], target_dir, "Total-Results.csv")
    save_export_object_list_to_csv(
        measurement.measured_guests, target_dir, "VM-Results.csv"
    )

    for guest_id in set([guest.guest_id for guest in measurement.measured_guests]):
        save_export_object_list_to_csv(
            [
                dataset
                for dataset in measurement.datasets
                if dataset.guest_id == guest_id
            ],
            target_dir,
            f"Data-Sets-{guest_id}.csv",
        )
    logger.info("Exporting measurement successfully")
    return


def save_export_object_list_to_csv(
    export_objects: List[Exportable], target_dir: str, filename: str
) -> str | None:
    """
    Speichert eine Liste von Exportable-Objekten als CSV-Datei.
    """
    if not export_objects:
        logger.error("Die Liste ist leer. Es gibt nichts zu speichern.")
        return

    newline = ""
    encoding = "utf-8"

    # Sicherstellen, dass der Zielordner existiert
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        logger.debug("Zielordner erstellt: %s", target_dir)

    # Sicherstellen, dass der Dateiname .csv endet
    if not filename.endswith(".csv"):
        filename += ".csv"

    # Vollständiger Pfad
    pfad = os.path.join(target_dir, filename)

    # Sicherstellen, dass das erste Objekt das Interface unterstützt
    export_object = export_objects[0]
    if not isinstance(export_object, Exportable):
        raise TypeError(
            f"Objekt {type(export_object)} unterstützt nicht das Exportable-Interface."
        )

    # Felder aus erstem Objekt ableiten
    data_export_object = export_object.to_export_dict()
    fieldnames = list(data_export_object.keys())

    # Datei schreiben
    with open(pfad, mode="w", newline=newline, encoding=encoding) as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()

        for obj in export_objects:
            data = obj.to_export_dict()
            writer.writerow(data)

    logger.info("Datei erfolgreich gespeichert: %s", pfad)
    return pfad
