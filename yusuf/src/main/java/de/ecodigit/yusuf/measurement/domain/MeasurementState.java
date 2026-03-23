package de.ecodigit.yusuf.measurement.domain;

public enum MeasurementState {
  CREATED,
  QUEUED,
  STARTED,
  PREPARE,
  INSTALL,
  WORK,
  CLEANUP,
  COLLECT,
  COMPLETED,
  ABORTED,
  FAILED_SUT,
  FAILED_ARTHUR
}
