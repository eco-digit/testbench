from sqlalchemy import (
    Column,
    TIMESTAMP,
    ForeignKeyConstraint,
    PrimaryKeyConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import Float, JSON, Enum, SmallInteger, UUID

from entities.base import Base
from export.exportable import Exportable
from measurement.measurement import StateEnum


class DataSet(Base, Exportable):
    __tablename__ = "data_set"
    __table_args__ = (
        PrimaryKeyConstraint("timestamp", "measurement_id", "guest_id"),
        ForeignKeyConstraint(["measurement_id"], ["measurement.id"]),
    )

    timestamp = Column(TIMESTAMP(timezone=True), nullable=False)
    measurement_id = Column(UUID, nullable=False)

    guest_id = Column(SmallInteger, nullable=False)
    # Total CPU-Time since VM-Start
    cpu_usage = Column(Float, nullable=False, default=0.0)
    # Total Bytes since VM-Start
    network = Column(JSON)
    # Current percentage ram utilization (at the time of the timestamp)
    ram_usage = Column(Float, nullable=False, default=0.0)
    # Current percentage storage utilization (at the time of the timestamp)
    storage_usage = Column(Float, nullable=False, default=0.0)

    state: StateEnum = Column(Enum(StateEnum), nullable=False)

    measurement = relationship("Measurement", back_populates="datasets")

    def to_dict(self):
        return {
            "timestamp": self.timestamp,
            "cpu_usage": self.cpu_usage,
            "network": self.network,
            "ram_usage": self.ram_usage,
            "storage_usage": self.storage_usage,
            "state": self.state.value,
        }

    def to_export_dict(self) -> dict:
        return self.to_dict()
