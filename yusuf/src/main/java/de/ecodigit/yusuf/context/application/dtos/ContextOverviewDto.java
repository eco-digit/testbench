package de.ecodigit.yusuf.context.application.dtos;

import de.ecodigit.yusuf.application.domain.HealthStatus;
import de.ecodigit.yusuf.measurement.application.dtos.MeasurementOverviewDto;
import java.util.UUID;

public record ContextOverviewDto(
    UUID contextId,
    String name,
    Double ecodigitScore,
    HealthStatus healthStatus,
    MeasurementOverviewDto lastMeasurement) {}
