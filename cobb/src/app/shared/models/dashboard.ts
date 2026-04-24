export interface InfoBoxMetrics {
  title: string;
  subtitle: string;
  value: number | undefined;
}

export interface MonthlyScores {
  month: string;
  ecoDigitScore: number;
}

export interface DashboardChart {
  applicationName: string;
  monthlyScores: MonthlyScores[];
}

export interface TotalDashboardValues {
  totalMeasurements: number;
  totalApplications: number;
  totalCriticalMeasurements: number;
}
