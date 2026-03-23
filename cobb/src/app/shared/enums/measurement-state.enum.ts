export enum MeasurementState {
  CREATED = 'QUEUED',
  CONFIGURED = 'CONFIGURED',
  FAILED = 'FAILED',
  FAILED_ARTHUR = 'FAILED',
  FAILED_SUT = 'FAILED',
  COMPLETED = 'COMPLETED',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  PREPARE = 'RUNNING',
  INSTALL = 'RUNNING',
  COLLECT = 'RUNNING',
  CLEANUP = 'RUNNING',
  STARTED = 'RUNNING',
  WORK = 'RUNNING',
  ABORTED = 'ABORTED',
  Unknown = 'Unknown',
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  CRITICAL = 'critical',
  DISRUPTED = 'disrupted',
  NOT_STARTED = 'not started yet',
}
