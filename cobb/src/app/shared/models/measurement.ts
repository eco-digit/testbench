import { InfrastructureDefinition } from '@models/files';
import { MeasurementState } from '@enums/measurement-state.enum';

export type NumericMeasurementKey =
  | 'ecodigitScore'
  | 'adp'
  | 'ced'
  | 'gwp'
  | 'water'
  | 'weee'
  | 'tox';

export type VmState = 'PREPARE' | 'INSTALL' | 'WORK' | 'COLLECT' | 'CLEANUP';

// please note: names need to be adapted soon
export interface MeasurementData {
  id: string;
  name: string;
  lastUpdated?: number;
  applicationId: number;
  artefactId: number;
  measurementState?: string;
  trigger?: string;
  organizationName?: string;
  ecodigitScore: number;
  adp: number;
  ced: number;
  gwp: number;
  tox: number;
  water: number;
  weee: number;
}

export interface CreateMeasurementData {
  applicationVariantId: string;
  name: string;
}

export interface MeasurementOverviewData {
  id: string;
  name: string;
  applicationVariantName: string;
  description: string;
  ecodigitScore: number;
  lastUpdated: string;
  simulationDuration: number;
  trigger?: string;
  measurementState: MeasurementState;
  adp: number;
  ced: number;
  gwp: number;
  water: number;
  weee: number;
  tox: number;
  state?: string;
  statusClass?: string;
  icon?: string;
  tooltip?: string;
}

export interface MeasurementContextDto {
  id: string;
  contextId: string;
  name: string;
  artefactName: string;
  ecodigitScore: number;
  created: string;
  lastUpdated: string;
  trigger: string;
  measurementState: MeasurementState;
}

export interface MeasurementArtefactDto {
  id: string;
  contextId: string;
  name: string;
  artefactName: string;
  ecodigitScore: number;
  created: string;
  lastUpdated: string;
  trigger: string;
  measurementState: MeasurementState;
}

export interface MeasuredApplication {
  id: string;
  timestamp: string;
  infrastructure: InfrastructureDefinition;
  loads: LoadDefinition[];
  result?: null; // not available yet
  name?: string;
  description: string;
}

export interface LoadDefinition {
  id: string;
  name: string;
  content: string;
}

export interface DashboardStatistics {
  applications: number;
  measurements: number;
  criticalApplications: number;
  disruptedApplications: number;
}
export interface MeasurementStatusUpdate {
  measurementId: string;
  userId: string;
  measurementState: MeasurementState;
  createdAt: string;
}

export interface MeasurementResults {
  applicationVariantId: string;
  measurementId: string;
  simulationDurationInSeconds: number;

  totalAdp: number;
  totalCed: number;
  totalEcoDigitScore: number;
  totalGwp: number;
  totalTox: number;
  totalWater: number;
  totalWeee: number;
  states: StateResult[];
}

export interface StateResult {
  adp: number;
  ced: number;
  ecoDigitScore: number;
  gwp: number;
  state: VmState;
  tox: number;
  water: number;
  weee: number;
}

export interface UiMeasurementTotals {
  totalGlobalWarmingPotential: number;
  totalWasteElectricalAndElectronicEquipment: number;
  totalCumulativeEnergyDemand: number;
  totalWaterConsumption: number;
  totalAbioticDepletionPotential: number;
  totalEcoToxity: number;
}

export interface UiMeasurementDetailRow extends UiMeasurementTotals {
  phase: string;
}
