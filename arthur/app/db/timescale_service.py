from logging import getLogger
from uuid import UUID

from db.timescale_manager import timescale_manager
from entities import Measurement, MeasuredGuest, DataSet
from measurement.measurement import StateEnum

logger = getLogger(__name__)


class TimescaleService:
    def __init__(self):
        self.db_manager = timescale_manager
        self.session = None

    def __enter__(self):
        self.session = self.db_manager.Session()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            logger.error(f"An error occurred. Rolling back session: {exc_val}")
            self.session.rollback()
        else:
            self.session.commit()

        self.session.close()

    def save_measurement(self, measurement: Measurement):
        measurement_id = measurement.id
        self.session.add(measurement)
        self.session.commit()
        return self.get_measurement_by_id(measurement_id)

    def save_measured_guest(self, measured_guest: MeasuredGuest):
        self.session.add(measured_guest)
        self.session.commit()

    def save_dataset(self, dataset: DataSet):
        self.session.add(dataset)
        self.session.commit()

    def update_measurement_state(self, measurement_id: UUID, new_state: StateEnum):
        measurement = self.session.get(Measurement, measurement_id)
        measurement.state = new_state
        self.session.commit()

    def get_measurement_by_id(self, measurement_id: UUID) -> Measurement | None:
        return self.session.get(Measurement, measurement_id)

    def get_datasets_by_measurement_id_guest_id_and_state(
        self, measurement_id: UUID, guest_id: int, new_state: StateEnum
    ) -> list[DataSet]:
        return (
            self.session.query(DataSet)
            .filter(DataSet.measurement_id == measurement_id)
            .filter(DataSet.guest_id == guest_id)
            .filter(DataSet.state == new_state)
            .all()
        )

    def get_datasets_by_measurement_id(self, measurement_id: UUID) -> list[DataSet]:
        return (
            self.session.query(DataSet)
            .filter(DataSet.measurement_id == measurement_id)
            .all()
        )

    def exists_measurement_by_id(self, measurement_id: UUID) -> bool:
        return self.session.get(Measurement, measurement_id) is not None
