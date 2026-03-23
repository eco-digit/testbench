package de.ecodigit.yusuf.context.application.dtos;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import lombok.Builder;

@Builder
public record CreateContextDto(UUID applicationId, @NotBlank String name, String description) {}
