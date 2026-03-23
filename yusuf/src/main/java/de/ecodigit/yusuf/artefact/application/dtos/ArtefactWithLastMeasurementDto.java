package de.ecodigit.yusuf.artefact.application.dtos;

import de.ecodigit.yusuf.artefact.domain.ArtefactType;
import de.ecodigit.yusuf.measurement.domain.MeasurementDto;
import java.time.Instant;
import java.util.UUID;

public record ArtefactWithLastMeasurementDto(
    UUID id,
    String originalFileName,
    String customFileName,
    String mimeType,
    ArtefactType artefactType,
    String description,
    Instant creationTime,
    boolean defaultFile,
    MeasurementDto lastMeasurement) {}
