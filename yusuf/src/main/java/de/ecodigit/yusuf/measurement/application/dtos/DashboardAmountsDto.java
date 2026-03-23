package de.ecodigit.yusuf.measurement.application.dtos;

import lombok.Builder;

@Builder
public record DashboardAmountsDto(
    Integer applications,
    Integer measurements,
    Integer criticalApplications,
    Integer disruptedApplications) {}
