import { MeasurementOverviewData } from '@models/measurement';

export interface ArtefactsOverviewDto {
  id: string;
  fileName: string;
  originalFileName: string;
  customFileName: string;
  mimeType: string;
  fileType: string;
  description: string;
  creationTime: string;
  defaultFile: boolean;
  lastMeasurement: MeasurementOverviewData;
}

export interface ArtefactRow extends ArtefactsOverviewDto {
  state?: string;
  statusClass?: string;
  icon?: string;
  tooltip?: string;
  isRunning: boolean;
}
