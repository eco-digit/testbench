from datetime import timedelta
from statistics import mean

from sqlalchemy import (
    Column,
    SmallInteger,
    String,
    Float,
    ForeignKey,
    UUID,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql.sqltypes import Enum

from entities import DataSet
from entities.base import Base
from export.exportable import Exportable
from measurement.measurement import StateEnum


class MeasuredGuest(Base, Exportable):
    __tablename__ = "measured_guest"

    measurement_id = Column(
        UUID,
        ForeignKey("measurement.id", ondelete="CASCADE"),
        primary_key=True,
    )
    guest_id = Column(SmallInteger, primary_key=True)
    state: StateEnum = Column(Enum(StateEnum), nullable=False, primary_key=True)
    domain_name = Column(String, nullable=False)
    gm_type = Column(String, nullable=True)
    ram_overhead = Column(Float)

    average_cpu_usage = Column(Float)
    average_ram_usage_without_overhead = Column(Float)
    average_storage_usage = Column(Float)
    average_network_usage = Column(Float)

    eco_digit_score = Column(Float)
    ced = Column(Float)
    gwp = Column(Float)
    adp = Column(Float)
    water = Column(Float)
    weee = Column(Float)
    tox = Column(Float)

    # Average cpu usage over measurement time in percentage

    measurement = relationship("Measurement", back_populates="measured_guests")

    @staticmethod
    def calculate_average_cpu_usage(datasets: list[DataSet]) -> float:
        """
        Calculates average CPU utilization [%] across all DataSet entries.
        Returns:
            float: average CPU utilization (0–100)
        """
        return (
            mean([dataset.cpu_usage for dataset in datasets])
            if len(datasets) > 0
            else 0.0
        )

    @staticmethod
    def calculate_average_ram_usage(datasets: list[DataSet]) -> float:
        """
        Calculates average RAM usage [%] across all DataSet entries.
        Returns:
            float: average RAM utilization (0–100)
        """
        return (
            mean([dataset.ram_usage for dataset in datasets])
            if len(datasets) > 0
            else 0.0
        )

    @staticmethod
    def calculate_average_storage_usage(datasets: list[DataSet]) -> float:
        """
        Calculates average storage I/O utilization [%] across the measurement.
        Returns:
           float: average storage utilization (0–100)
        """
        return (
            mean([dataset.storage_usage for dataset in datasets])
            if len(datasets) > 0
            else 0.0
        )

    @staticmethod
    def calculate_average_network_usage(
        datasets: list[DataSet], transfer_performance_in_bytes_per_second: float
    ) -> float:
        """
        Calculates average network utilization [%] over the measurement duration.
        Process:
        - Aggregate all transferred bytes over time (Δbytes per connection)
        - Divide by device's maximum transfer capacity * measurement duration
        - Convert to percentage
        Returns:
        float: average network utilization (0–100)
        """
        if len(datasets) < 2:
            return 0.0

        total_transfer_bytes = 0
        first = datasets[0]
        last = datasets[-1]

        duration_in_s = (last.timestamp - first.timestamp).total_seconds()

        for connection_ip in last.network.keys():
            if connection_ip == "0.0.0.0":
                total_transfer_bytes += (
                    last.network[connection_ip] - first.network[connection_ip]
                )
            elif connection_ip in first.network.keys():
                total_transfer_bytes += (
                    last.network[connection_ip] - first.network[connection_ip]
                )
            else:
                total_transfer_bytes += last.network[connection_ip]

        return (
            total_transfer_bytes
            / (transfer_performance_in_bytes_per_second * duration_in_s)
        ) * 100.0

    @staticmethod
    def get_duration_of_dataset(datasets: list[DataSet]) -> timedelta:
        """
        Computes the total duration of the measurement from first to last DataSet.
        Returns:
        timedelta: measurement duration
        """
        if len(datasets) < 1:
            return timedelta(seconds=0.0)
        return datasets[-1].timestamp - datasets[0].timestamp

    def to_dict(self):
        return {
            "id": self.measurement_id,
            "guest_id": self.guest_id,
            "average_cpu_usage": self.average_cpu_usage,
            "average_ram_usage_without_overhead": self.average_ram_usage_without_overhead,
            "ram_overhead": self.ram_overhead,
            "average_storage_usage": self.average_storage_usage,
            "data_sets": [ds.to_dict() for ds in self.data_sets],
        }

    def to_export_dict(self) -> dict:
        return {
            "guest_id": self.guest_id,
            "measurement_id": self.measurement_id,
            "state": self.state.value,
            "gm_type": self.gm_type,
            "eco_digit_score": self.eco_digit_score,
            "ced": self.ced,
            "gwp": self.gwp,
            "adp": self.adp,
            "water": self.water,
            "weee": self.weee,
            "tox": self.tox,
            "average_cpu_usage": self.average_cpu_usage,
            "average_ram_usage": self.average_ram_usage_without_overhead,
            "average_storage_usage": self.average_storage_usage,
            "average_network_usage": self.average_network_usage,
        }
