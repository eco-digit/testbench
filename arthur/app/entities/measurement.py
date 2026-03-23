from sqlalchemy import Column, String, Interval, Float
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.sql.sqltypes import Enum, UUID

from entities import MeasuredGuest, DataSet
from entities.base import Base
from export.exportable import Exportable
from measurement.measurement import StateEnum


class Measurement(Base, Exportable):
    __tablename__ = "measurement"

    application_variant_id = Column(String, nullable=False)
    id = Column(UUID, nullable=False, primary_key=True)

    git_repository_name = Column(String, nullable=True)
    git_url = Column(String, nullable=True)
    git_access_type = Column(String, nullable=True)
    git_access_token = Column(String, nullable=True)

    simulation_duration = Column(Interval)

    total_eco_digit_score = Column(Float)
    total_ced = Column(Float)
    total_gwp = Column(Float)
    total_adp = Column(Float)
    total_water = Column(Float)
    total_weee = Column(Float)
    total_tox = Column(Float)

    state: StateEnum = Column(Enum(StateEnum), default=StateEnum.QUEUED)

    measured_guests: Mapped[list[MeasuredGuest]] = relationship(
        "MeasuredGuest",
        back_populates="measurement",
        cascade="all, delete-orphan",
        lazy="joined",
    )

    datasets: Mapped[list[DataSet]] = relationship(
        "DataSet",
        back_populates="measurement",
        cascade="all, delete-orphan",
        lazy="joined",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "measurement_id": self.id,
            "measured_guests": [guest.to_dict() for guest in self.measured_guests],
        }

    def to_export_dict(self) -> dict:
        return {
            "application_variant_id": self.application_variant_id,
            "measurement_id": self.id,
            "simulation_duration": str(self.simulation_duration),
            "total_eco_digit_score": self.total_eco_digit_score,
            "total_ced": self.total_ced,
            "total_gwp": self.total_gwp,
            "total_adp": self.total_adp,
            "total_water": self.total_water,
            "total_weee": self.total_weee,
            "total_tox": self.total_tox,
        }
