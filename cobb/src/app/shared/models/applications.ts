import { HealthStatus } from '@enums/measurement-state.enum';

export interface ApplicationData {
  id: string;
  name: string;
  lastUpdated?: string | null;
  repositoryId?: number;
  description?: string;
  ecodigitScore?: number;
  state?: HealthStatus;
}

export interface DashboardApplicationTableData {
  id: string;
  name: string;
  lastMeasurementScore?: number;
}

export interface MeasurementApplicationsTable {
  applicationId?: string;
  lastUpdated: string;
  lastMeasurement?: {
    lastUpdated?: string;
  };
}

export interface ApplicationsTableData {
  applicationId?: string;
  applicationName: string;
  ecodigitScore: number;
  healthStatus: string;
  lastMeasurement: MeasurementApplicationsTable;
}

export interface EcoData {
  totalGlobalWarmingPotential: number;
  totalWasteElectricalAndElectronicEquipment: number;
}

export interface EcoInsightData {
  month: string;
  measurements: number;
  totalGlobalWarmingPotential: number;
  totalWasteElectricalAndElectronicEquipment: number;
  totalCumulativeEnergyDemand: number;
  totalWaterConsumption: number;
  totalAbioticDepletionPotential: number;
  totalEcotoxicity: number;
}

export interface EditApplicationData {
  appName: string;
  description: string;
  applicationId: string;
}

export interface UpdateApplicationBody {
  applicationName: string;
  description: string;
}
