package de.ecodigit.yusuf.notification.ui;

import de.ecodigit.yusuf.measurement.domain.MeasurementState;
import java.time.Instant;
import java.util.UUID;

public record NotificationDto(
    UUID id, UUID measurementId, MeasurementState measurementState, Instant createdAt) {}
