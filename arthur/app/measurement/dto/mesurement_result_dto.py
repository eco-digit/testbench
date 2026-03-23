from collections import defaultdict
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from entities import Measurement, MeasuredGuest
from measurement.measurement import StateEnum


class StateResultDTO(BaseModel):
    state: str | None = None

    ecoDigitScore: float = Field(default=0.0)
    ced: float = Field(default=0.0)
    gwp: float = Field(default=0.0)
    adp: float = Field(default=0.0)
    water: float = Field(default=0.0)
    weee: float = Field(default=0.0)
    tox: float = Field(default=0.0)


class MeasurementResultDTO(BaseModel):
    measurementId: UUID
    applicationVariantId: str
    simulationDurationInSeconds: Optional[float]
    totalEcoDigitScore: Optional[float]
    totalCed: Optional[float]
    totalGwp: Optional[float]
    totalAdp: Optional[float]
    totalWater: Optional[float]
    totalWeee: Optional[float]
    totalTox: Optional[float]
    states: List[StateResultDTO]

    @classmethod
    def from_entity(cls, measurement: Measurement):
        return cls(
            measurementId=measurement.id,
            applicationVariantId=measurement.application_variant_id,
            simulationDurationInSeconds=(
                measurement.simulation_duration.total_seconds()
                if measurement.simulation_duration
                else None
            ),
            totalEcoDigitScore=measurement.total_eco_digit_score,
            totalCed=measurement.total_ced,
            totalGwp=measurement.total_gwp,
            totalAdp=measurement.total_adp,
            totalWater=measurement.total_water,
            totalWeee=measurement.total_weee,
            totalTox=measurement.total_tox,
            states=MeasurementResultDTO.accumulate_by_state(
                guests=measurement.measured_guests
            ),
        )

    @staticmethod
    def accumulate_by_state(guests: list["MeasuredGuest"]) -> list["StateResultDTO"]:
        results_per_state: dict[StateEnum, StateResultDTO] = defaultdict(
            lambda: StateResultDTO()
        )

        for guest in guests:
            result_dto = results_per_state[guest.state]

            if result_dto.state is None:
                result_dto.state = guest.state.value

            result_dto.ecoDigitScore += guest.eco_digit_score
            result_dto.ced += guest.ced
            result_dto.gwp += guest.gwp
            result_dto.adp += guest.adp
            result_dto.water += guest.water
            result_dto.weee += guest.weee
            result_dto.tox += guest.tox

        return list(results_per_state.values())
