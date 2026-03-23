package de.ecodigit.yusuf.artefact.application.exceptions;

import java.util.UUID;

public class ArtefactNotFoundException extends ArtefactException {

  public ArtefactNotFoundException(UUID fileEntityId) {
    super("Could not find artefact with ID " + fileEntityId);
  }
}
