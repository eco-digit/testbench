package de.ecodigit.yusuf.artefact.domain;

import java.time.Instant;
import java.util.UUID;

public record ArtefactDTO(
    UUID id,
    String originalFileName,
    String customFileName,
    String mimeType,
    ArtefactType artefactType,
    String description,
    Instant creationTime,
    boolean defaultFile) {}
