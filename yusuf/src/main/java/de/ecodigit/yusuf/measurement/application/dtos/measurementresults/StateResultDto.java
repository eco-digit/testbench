package de.ecodigit.yusuf.measurement.application.dtos.measurementresults;

import de.ecodigit.yusuf.measurement.domain.MeasurementState;

public record StateResultDto(
    Double adp,
    Double ced,
    Double ecoDigitScore,
    Double gwp,
    MeasurementState state,
    Double tox,
    Double water,
    Double weee) {}
