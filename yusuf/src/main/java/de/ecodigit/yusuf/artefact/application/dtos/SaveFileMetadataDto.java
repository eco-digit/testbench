package de.ecodigit.yusuf.artefact.application.dtos;

import de.ecodigit.yusuf.artefact.domain.ArtefactType;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;

@Builder
public record SaveFileMetadataDto(
    @NotNull UUID contextId,
    @NotNull ArtefactType artefactType,
    boolean defaultFile,
    String customFileName,
    String description) {}
