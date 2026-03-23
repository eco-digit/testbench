package de.ecodigit.yusuf.measurement.application.dtos;

import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import de.ecodigit.yusuf.measurement.domain.Trigger;
import java.time.Instant;
import java.util.UUID;

public record MeasurementOverviewDto(
    UUID id,
    String name,
    String applicationVariantName,
    String description,
    Double ecodigitScore,
    Instant lastUpdated,
    Double simulationDuration,
    Trigger trigger,
    MeasurementState measurementState,
    Double adp,
    Double ced,
    Double gwp,
    Double water,
    Double weee,
    Double tox) {}
