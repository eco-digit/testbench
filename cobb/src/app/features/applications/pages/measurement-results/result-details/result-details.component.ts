import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import {
  ChartClickEvent,
  ResultChartComponent,
} from '@features/applications/pages/measurement-results/result-details/pages/result-chart/result-chart.component';
import { RoundUpPipe } from '@pipes/roundUp.pipe';
import { NgStyle } from '@angular/common';
import { DisplayMetric } from '@models/eco-insights';
import {
  UiMeasurementDetailRow,
  UiMeasurementTotals,
} from '@models/measurement';
import { ActivatedRoute } from '@angular/router';
import { MeasurementService } from '@services/measurement.service';
import { ScientificFormatPipe } from '@pipes/scientificFormat.pipe';

interface DetailRow {
  phase: string;
  totalGlobalWarmingPotential: number;
  totalWasteElectricalAndElectronicEquipment: number;
  totalCumulativeEnergyDemand: number;
  totalWaterConsumption: number;
  totalAbioticDepletionPotential: number;
  totalEcoToxity: number;
}

type DetailNumericKey = Exclude<keyof DetailRow, 'phase'>;
type TotalsRow = Record<DetailNumericKey, number>;

const metricOrder: DetailNumericKey[] = [
  'totalGlobalWarmingPotential',
  'totalWasteElectricalAndElectronicEquipment',
  'totalCumulativeEnergyDemand',
  'totalWaterConsumption',
  'totalAbioticDepletionPotential',
  'totalEcoToxity',
];

@Component({
  selector: 'app-result-details',
  standalone: true,
  imports: [
    MatIcon,
    MatButton,
    ResultChartComponent,
    NgStyle,
    ScientificFormatPipe,
  ],
  templateUrl: './result-details.component.html',
  styleUrl: './result-details.component.scss',
  providers: [],
})
export class ResultDetailsComponent implements OnInit {
  constructor(
    readonly route: ActivatedRoute,
    readonly measurementService: MeasurementService,
  ) {}
  isClicked = 'total';
  clickedPhase = '';

  displayedMetrics: DisplayMetric[] = [
    {
      title: 'Global Warming Potential',
      unit: 'in kg CO2-eq (GWP)',
      value: 0,
      image: '/assets/images/co2-icon.svg',
    },
    {
      title: 'Waste Electrical and Electronic Equip.',
      unit: 'in kg (WEEE)',
      value: 0,
      image: '/assets/images/weee-icon.svg',
    },
    {
      title: 'Cumulative Energy Demand',
      unit: 'in kWh (CED)',
      value: 0,
      image: '/assets/images/offline_bolt.svg',
    },
    {
      title: 'Water Consumption',
      unit: 'in m3 (Water)',
      value: 0,
      image: '/assets/images/local_drink.svg',
    },
    {
      title: 'Abiotic Depletion Potential',
      unit: 'in kg Sb-eq (ADP)',
      value: 0,
      image: '/assets/images/abitoic.svg',
    },
    {
      title: 'Ecotoxicity',
      unit: 'in CTUe (TOX)',
      value: 0,
      image: '/assets/images/toxity.svg',
    },
  ];

  totalResultForMeasurement: UiMeasurementTotals[] = [
    {
      totalGlobalWarmingPotential: 0,
      totalWasteElectricalAndElectronicEquipment: 0,
      totalCumulativeEnergyDemand: 0,
      totalWaterConsumption: 0,
      totalAbioticDepletionPotential: 0,
      totalEcoToxity: 0,
    },
  ];

  detailsPerPhase: UiMeasurementDetailRow[] = [];
  detailsCumulative: UiMeasurementDetailRow[] = [];

  ngOnInit() {
    const measurementId = this.route.snapshot.paramMap.get('measurementId')!;
    this.loadTotals(measurementId);
    this.loadPerPhase(measurementId);
  }

  private loadTotals(measurementId: string) {
    this.measurementService.getTotals(measurementId).subscribe({
      next: (totals) => {
        this.totalResultForMeasurement = [totals];
        this.loadTotalsAndApply();
      },
      error: (err) => {
        console.error('Totals error', err);
      },
    });
  }

  private loadPerPhase(measurementId: string) {
    this.measurementService.getPerPhase(measurementId).subscribe({
      next: (rows) => {
        this.detailsPerPhase = rows;
      },
      error: (err) => {
        console.error('PerPhase error', err);
      },
    });
  }

  private buildValuesFromDetail(detail: DetailRow): number[] {
    return metricOrder.map((k) => detail[k]);
  }

  private applyValues(values: number[]) {
    this.displayedMetrics = this.displayedMetrics.map((m, i) => ({
      ...m,
      value: values[i] ?? 0,
    }));
  }

  private buildValuesFromTotals(totals: TotalsRow): number[] {
    return metricOrder.map((k) => Number(totals[k] ?? 0));
  }

  private loadTotalsAndApply() {
    this.applyValues(
      this.buildValuesFromTotals(this.totalResultForMeasurement[0]),
    );
    this.isClicked = 'total';
    this.clickedPhase = '';
  }

  onChartInteraction(event: ChartClickEvent) {
    if (event.source === 'bar' && event.pointIndex != null) {
      const row = this.detailsPerPhase[event.pointIndex];
      this.applyValues(this.buildValuesFromDetail(row));
      this.isClicked = 'perPhase';
      this.clickedPhase = row.phase;
    } else if (event.source === 'line' && event.pointIndex != null) {
      const row = this.detailsCumulative[event.pointIndex];
      if (!row) return;
      this.applyValues(this.buildValuesFromDetail(row));
      this.isClicked = 'cumulative';
      this.clickedPhase = row.phase;
    } else {
      this.loadTotalsAndApply();
    }
  }
}
