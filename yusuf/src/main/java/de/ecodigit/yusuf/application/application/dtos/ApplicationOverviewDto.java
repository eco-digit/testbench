package de.ecodigit.yusuf.application.application.dtos;

import de.ecodigit.yusuf.application.domain.HealthStatus;
import de.ecodigit.yusuf.measurement.domain.MeasurementDto;
import java.util.UUID;
import lombok.Builder;

@Builder
public record ApplicationOverviewDto(
    UUID applicationId,
    String applicationName,
    Double ecodigitScore,
    HealthStatus healthStatus,
    Integer measurementAmount,
    MeasurementDto lastMeasurement) {}
