package de.ecodigit.yusuf.application.application.dtos;

import java.util.UUID;
import lombok.Builder;

@Builder
public record ApplicationDashboardDto(UUID id, String name, Double lastMeasurementScore) {}
