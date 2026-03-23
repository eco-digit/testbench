package de.ecodigit.yusuf.measurement.application.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;

@Builder
public record CreateMeasurementDto(
    @NotNull UUID applicationVariantId, String description, @NotBlank String name) {}
