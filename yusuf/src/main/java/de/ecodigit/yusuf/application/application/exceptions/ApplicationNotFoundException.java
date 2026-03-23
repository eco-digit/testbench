package de.ecodigit.yusuf.application.application.exceptions;

import java.util.NoSuchElementException;
import java.util.UUID;

public class ApplicationNotFoundException extends NoSuchElementException {

  public ApplicationNotFoundException(UUID applicationId) {
    super("cannot find application for id " + applicationId);
  }
}
