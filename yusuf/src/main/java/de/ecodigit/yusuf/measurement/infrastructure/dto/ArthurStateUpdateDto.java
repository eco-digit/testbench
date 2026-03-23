package de.ecodigit.yusuf.measurement.infrastructure.dto;

import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import java.time.Instant;
import java.util.UUID;
import lombok.Builder;

@Builder
public record ArthurStateUpdateDto(
    UUID measurementId, UUID userId, MeasurementState measurementState, Instant createdAt) {}
