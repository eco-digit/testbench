package de.ecodigit.yusuf.measurement.application.dtos;

import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import de.ecodigit.yusuf.measurement.domain.Trigger;
import java.time.Instant;
import java.util.UUID;

public record MeasurementContextDto(
    UUID id,
    UUID contextId,
    String name,
    String artefactName,
    Double ecodigitScore,
    Instant created,
    Instant lastUpdated,
    Trigger trigger,
    MeasurementState measurementState) {}
