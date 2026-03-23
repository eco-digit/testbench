package de.ecodigit.yusuf.measurement.application.exceptions;

public class NoLogsPresentException extends RuntimeException {
  public NoLogsPresentException(long measurementId) {
    super("Cannot find logs for measurement " + measurementId);
  }
}
