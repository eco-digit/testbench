package de.ecodigit.yusuf.measurement.domain;

import java.time.Instant;
import java.util.UUID;

public record MeasurementDto(
    UUID id,
    String name,
    Instant lastUpdated,
    UUID artefactId,
    UUID applicationId,
    MeasurementState measurementState,
    Trigger trigger,
    Double ecodigitScore,
    Double adp,
    Double ced,
    Double gwp,
    Double tox,
    Double water,
    Double weee) {}
