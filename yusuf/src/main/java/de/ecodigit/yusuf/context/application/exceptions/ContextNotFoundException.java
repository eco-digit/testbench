package de.ecodigit.yusuf.context.application.exceptions;

import java.util.UUID;

public class ContextNotFoundException extends RuntimeException {

  public ContextNotFoundException(UUID contextId) {
    super("Could not find measurement with id " + contextId);
  }
}
