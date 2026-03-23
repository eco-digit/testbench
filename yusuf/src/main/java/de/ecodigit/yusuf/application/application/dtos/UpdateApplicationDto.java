package de.ecodigit.yusuf.application.application.dtos;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;

public record UpdateApplicationDto(
    @NotBlank String applicationName, @Nullable String description) {}
