import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EcoInsightChartComponent } from '@components/eco-insight-chart/eco-insight-chart.component';
import { MeasurementBarChartComponent } from '@features/eco-insights/measurement-bar-chart/measurement-bar-chart.component';
import { NgStyle } from '@angular/common';
import { ChartSelectionService } from '@services/chart-selection.service';
import { Metric, DisplayMetric } from '@models/eco-insights';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { RoundUpPipe } from '@pipes/roundUp.pipe';

@Component({
  selector: 'app-eco-insights',
  standalone: true,
  imports: [
    MatButton,
    MatIconModule,
    EcoInsightChartComponent,
    MeasurementBarChartComponent,
    NgStyle,
    RoundUpPipe,
  ],
  templateUrl: './eco-insights.component.html',
  styleUrl: './eco-insights.component.scss',
  providers: [ChartSelectionService],
})
export class EcoInsightsComponent implements OnInit {
  isClicked = false;
  displayedMetrics: DisplayMetric[] = [];
  metrics: Metric[] = [];
  totalEcoIndicators: number[] = [];
  totalGlobalWarmingPotential: number[] = [];
  totalWasteElectricalAndElectronicEquipment: number[] = [];
  totalCumulativeEnergyDemand: number[] = [];
  totalWaterConsumption: number[] = [];
  totalAbioticDepletionPotential: number[] = [];
  totalEcoToxity: number[] = [];
  clickedMonth = '';

  constructor(
    private selectionService: ChartSelectionService,
    readonly applicationService: ApplicationsService,
  ) {}

  ngOnInit() {
    this.loadMonthlyMetrics();
    this.loadMetrics();
    this.selectionCheck();
  }

  private selectionCheck() {
    this.selectionService.selectedIndex$.subscribe((index) => {
      if (index !== null) {
        this.isClicked = true;
        this.displayedMetrics = this.metrics.map((metric) => ({
          ...metric,
          value: metric.values[index + 1] ?? 0,
        }));
      } else {
        this.isClicked = false;
        this.displayedMetrics = this.metrics.map((metric, i) => ({
          ...metric,
          value: this.totalEcoIndicators[i] ?? 0,
        }));
      }
    });
  }

  private loadMetrics() {
    this.applicationService.getEcoIndicators().subscribe((response) => {
      this.totalEcoIndicators = Object.values(response);
      this.selectionService.clearSelection();
    });
  }

  private loadMonthlyMetrics() {
    this.applicationService.getMonthlyEcoInsight().subscribe((data) => {
      this.totalGlobalWarmingPotential = data.map(
        (item) => item.totalGlobalWarmingPotential,
      );
      this.totalWaterConsumption = data.map(
        (item) => item.totalWaterConsumption,
      );
      this.totalCumulativeEnergyDemand = data.map(
        (item) => item.totalCumulativeEnergyDemand,
      );
      this.totalWasteElectricalAndElectronicEquipment = data.map(
        (item) => item.totalWasteElectricalAndElectronicEquipment,
      );
      this.totalAbioticDepletionPotential = data.map(
        (item) => item.totalAbioticDepletionPotential,
      );
      this.totalEcoToxity = data.map((item) => item.totalEcotoxicity);

      this.metrics = [
        {
          title: 'Global Warming Potential',
          unit: 'in kg CO2-eq (GWP)',
          values: this.totalGlobalWarmingPotential,
          image: '/assets/images/co2-icon.svg',
        },
        {
          title: 'Waste Electrical and Electronic Equip.',
          unit: 'in kg (WEEE)',
          values: this.totalWasteElectricalAndElectronicEquipment,
          image: '/assets/images/weee-icon.svg',
        },
        {
          title: 'Cumulative Energy Demand',
          unit: 'in kWh (CED)',
          values: this.totalCumulativeEnergyDemand,
          image: '/assets/images/offline_bolt.svg',
        },
        {
          title: 'Water Consumption',
          unit: 'in m3 (Water)',
          values: this.totalWaterConsumption,
          image: '/assets/images/local_drink.svg',
        },
        {
          title: 'Abiotic Depletion Potential',
          unit: 'in kg Sb-eq (ADP)',
          values: this.totalAbioticDepletionPotential,
          image: '/assets/images/abitoic.svg',
        },
        {
          title: 'Ecotoxicity',
          unit: 'in CTUe (TOX)',
          values: this.totalEcoToxity,
          image: '/assets/images/toxity.svg',
        },
      ];
      this.selectionService.clearSelection();
    });
  }
}
