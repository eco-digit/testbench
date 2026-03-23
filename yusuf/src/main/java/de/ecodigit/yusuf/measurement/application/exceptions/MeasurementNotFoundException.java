package de.ecodigit.yusuf.measurement.application.exceptions;

import java.util.UUID;

public class MeasurementNotFoundException extends RuntimeException {

  public MeasurementNotFoundException(UUID measurementId) {
    super("Could not find measurement with id " + measurementId);
  }
}
