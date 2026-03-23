package de.ecodigit.yusuf.measurement.application.dtos.measurementresults;

import java.util.List;
import java.util.UUID;

public record MeasurementResultDto(
    UUID applicationVariantId,
    UUID measurementId,
    Double simulationDurationInSeconds,
    Double totalAdp,
    Double totalCed,
    Double totalEcoDigitScore,
    Double totalGwp,
    Double totalTox,
    Double totalWater,
    Double totalWeee,
    List<StateResultDto> states) {}
