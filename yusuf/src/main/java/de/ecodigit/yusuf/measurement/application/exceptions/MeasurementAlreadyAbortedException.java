package de.ecodigit.yusuf.measurement.application.exceptions;

import java.util.UUID;

public class MeasurementAlreadyAbortedException extends RuntimeException {

  public MeasurementAlreadyAbortedException(UUID measurementId) {
    super("measurement with id " + measurementId + " already aborted ,finished or failed");
  }
}
