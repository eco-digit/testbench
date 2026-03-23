import { HealthStatus } from '@enums/measurement-state.enum';
import { MeasurementOverviewData } from '@models/measurement';
import { FormControl } from '@angular/forms';

export interface ContextOverviewDto {
  contextId: string;
  name: string;
  description?: string;
  ecodigitScore: number | null;
  healthStatus: HealthStatus;
  lastMeasurement: MeasurementOverviewData | null;
}

export interface ContextDto {
  id: string;
  name: string;
  description?: string;
}

export interface EditContextDto {
  contextName: string;
  description?: string;
}

export interface CreateContextDto {
  name: string;
  description?: string;
  applicationId: string;
}

export interface HealthStatusInfo {
  status: string;
  label: string;
  icon?: string;
  tooltip?: string;
}

export const HealthStatusInfoMap: Record<HealthStatus, HealthStatusInfo> = {
  [HealthStatus.HEALTHY]: {
    status: 'status-healthy',
    label: 'healthy',
    icon: 'mood',
    tooltip: 'Executable with no known issues',
  },
  [HealthStatus.CRITICAL]: {
    status: 'status-critical',
    label: 'critical',
    icon: 'release_alert',
    tooltip: 'Executable but has known issues that need attention',
  },
  [HealthStatus.DISRUPTED]: {
    status: 'status-disrupted',
    label: 'disrupted',
    icon: 'assignment_late',
    tooltip: 'Not executable and requires immediate action',
  },
  [HealthStatus.NOT_STARTED]: {
    status: 'status-not-started',
    label: 'not started yet',
  },
};

export interface CreateApplicationContextForm {
  appName: FormControl<string>;
  description: FormControl<string>;
}

export interface NormalizedMeasurement {
  contextId?: string;
  name: string;
  description?: string;
  lastMeasurement: MeasurementOverviewData;
}

export type UnifiedMeasurementItem =
  | ContextOverviewDto
  | MeasurementOverviewData;
