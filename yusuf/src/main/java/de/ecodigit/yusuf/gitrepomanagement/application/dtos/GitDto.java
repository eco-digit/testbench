package de.ecodigit.yusuf.gitrepomanagement.application.dtos;

import de.ecodigit.yusuf.gitrepomanagement.domain.AccessType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder
public record GitDto(
    UUID id,
    @NotNull UUID contextId,
    @NotEmpty String repositoryName,
    @NotEmpty String repositoryLink,
    @NotNull AccessType accessType,
    String accessToken,
    LocalDateTime creationDate) {}
