package de.ecodigit.yusuf.measurement.application.exceptions;

public class MeasurementAlreadyStartedException extends RuntimeException {
  public MeasurementAlreadyStartedException(long measurementId) {
    super("Cannot start the measurement " + measurementId + " a second time.");
  }
}
