import { MeasurementState } from '@enums/measurement-state.enum';

export function getStatusInfo(state: MeasurementState | undefined): {
  status: string;
  icon: string;
  tooltip: string;
} {
  switch (state) {
    case MeasurementState.CREATED:
      return {
        status: 'status-created',
        icon: 'clock_loader_20',
        tooltip: 'created but not yet configured',
      };
    case MeasurementState.ABORTED:
      return {
        status: 'status-aborted',
        icon: 'cancel',
        tooltip: 'has been aborted by the user',
      };
    case MeasurementState.QUEUED:
      return {
        status: 'status-triggered',
        icon: 'clock_loader_90',
        tooltip: 'initiated and is waiting to be measured',
      };
    case MeasurementState.CONFIGURED:
      return {
        status: 'status-configured',
        icon: 'clock_loader_40',
        tooltip: 'configured and ready for measurement',
      };
    case MeasurementState.RUNNING:
      return {
        status: 'status-running',
        icon: 'pending',
        tooltip: 'measurement is running',
      };
    case MeasurementState.FAILED:
      return {
        status: 'status-failed',
        icon: 'error',
        tooltip: 'has encountered an error and could not complete',
      };
    case MeasurementState.COMPLETED:
      return {
        status: 'status-completed',
        icon: 'check_circle',
        tooltip: 'finished measurement successfully or with results available',
      };
    default:
      return { status: '', icon: 'help', tooltip: 'Unknown status' };
  }
}

export function resolveMeasurementState(
  receivedState: string | undefined,
): MeasurementState | undefined {
  if (!receivedState) {
    return undefined;
  }
  const isStateKey = receivedState in MeasurementState;
  return isStateKey
    ? MeasurementState[receivedState as keyof typeof MeasurementState]
    : undefined;
}
