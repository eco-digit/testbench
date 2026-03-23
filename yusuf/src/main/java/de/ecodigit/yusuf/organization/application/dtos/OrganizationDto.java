package de.ecodigit.yusuf.organization.application.dtos;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record OrganizationDto(
    UUID organizationId, @NotNull String name, String address, String industry) {}
