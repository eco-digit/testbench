import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { ColorService } from '@services/color.service';
import {
  CategoryScale,
  Chart,
  ChartDataset,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { NgStyle, DatePipe } from '@angular/common';
import { DashboardChart } from '@models/dashboard';
import { ChartSelectionService } from '@services/chart-selection.service';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-eco-insight-chart',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    NgStyle,
  ],
  templateUrl: './eco-insight-chart.component.html',
  styleUrl: './eco-insight-chart.component.scss',
})
export class EcoInsightChartComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true })
  chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  applications = new FormControl<string[]>([], { nonNullable: true });
  applicationList: string[] = [];
  fullAppData: Record<string, number[]> = {};
  legendItems: { label: string; color: string }[] = [];
  monthKeys: string[] = [];
  maxScore = 0;

  constructor(
    readonly colorService: ColorService,
    readonly applicationsService: ApplicationsService,
    readonly datePipe: DatePipe,
    private selectionService: ChartSelectionService,
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.handleSelectionChanges();
  }
  private subscribeToSelection() {
    this.selectionService.selectedIndex$.subscribe((index) => {
      if (!this.chart) return;
      if (index !== null) {
        this.highlightPoint(index);
        // When a click occurs outside the chart, reset the chart data
      } else {
        this.updateChartDatasets(this.applicationList);
      }
    });
  }

  private highlightPoint(index: number): void {
    const color = this.colorService.chartColors;
    this.chart.data.datasets.forEach((dataset) => {
      const lineDataset = dataset as ChartDataset<'line', number[]>;
      const highlightColor = color.tertiary;
      const disabledColor = this.colorService.chartColors.primary16;

      const bgColors = lineDataset.data.map((_, i) =>
        i === index ? highlightColor : disabledColor,
      );
      const borderColors = lineDataset.data.map((_, i) =>
        i === index ? highlightColor : disabledColor,
      );

      lineDataset.backgroundColor = disabledColor;
      lineDataset.borderColor = disabledColor;
      lineDataset.pointBackgroundColor = bgColors;
      lineDataset.pointBorderColor = borderColors;
    });

    this.chart.update();
  }

  private handleSelectionChanges(): void {
    this.applications.valueChanges.subscribe((selectedApps: string[]) => {
      this.updateChartDatasets(selectedApps);
    });
  }

  private loadApplications(): void {
    this.applicationsService.getDashboardChart().subscribe((appdata) => {
      this.applicationList = [];
      this.fullAppData = {};

      const monthLabels = this.getMonthLabelsFromData(appdata);

      this.monthKeys = appdata[0]?.monthlyScores.map((score) => score.month);
      appdata.forEach((data) => {
        this.applicationList.push(data.applicationName);
        this.fullAppData[data.applicationName] = data.monthlyScores.map(
          (score) => score.ecoDigitScore,
        );
        const localMax = Math.max(...this.fullAppData[data.applicationName]);
        if (localMax > this.maxScore) {
          this.maxScore = localMax;
        }
      });

      this.initChart(monthLabels);
      this.applications.setValue([...this.applicationList], {
        emitEvent: false,
      });
      this.updateChartDatasets(this.applicationList);
      this.subscribeToSelection();
    });
  }

  private getMonthLabelsFromData(appData: DashboardChart[]): string[] {
    if (!appData.length) return [];
    return appData[0].monthlyScores.map((score) =>
      this.formatMonth(score.month),
    );
  }

  private formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(+year, +month - 1);
    return this.datePipe.transform(date, 'MMM') || '';
  }

  private formatTooltipTitle = (index: number): string => {
    const [year, month] = this.monthKeys[index].split('-');
    const date = new Date(+year, +month - 1);
    const monthName = this.datePipe.transform(date, 'MMMM') || '';
    return `${monthName} ${year}`;
  };

  private initChart(labels: string[]): void {
    const colors = this.colorService.chartColors;

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [],
      },
      options: {
        spanGaps: true,
        maintainAspectRatio: false,
        responsive: true,
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.selectionService.selectIndex(index);
          } else {
            this.selectionService.clearSelection();
          }
        },
        plugins: {
          legend: {
            display: false,
            position: 'bottom',
            align: 'start',
          },
          title: {
            display: false,
            text: 'Eco:Digit Score',
            color: colors.onSurface,
            font: {
              size: 18,
            },
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                return this.formatTooltipTitle(index);
              },
              label: (tooltipItem) => {
                const score = tooltipItem.raw;
                return [`Eco:Digit Score: ${score}`];
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: colors.outline,
            },
            grid: {
              color: colors.grid,
            },
          },
          y: {
            min: 0,
            ticks: {
              color: colors.outline,
            },
            grid: {
              color: colors.grid,
            },
          },
        },
      },
    });
  }

  updateChartDatasets(selectedApps: string[]) {
    const colors = this.colorService.chartColors;
    const colorArray = [
      colors.chartBlue,
      colors.chartGreen,
      colors.chartOrange,
      colors.chartPurple,
      colors.chartRed,
    ];

    this.chart.data.datasets = selectedApps.map((app, index) => ({
      label: app,
      data: this.fullAppData[app] || [],
      borderColor: colorArray[index % colorArray.length],
      backgroundColor: colorArray[index % colorArray.length],
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: colorArray[index % colorArray.length],
      pointBorderColor: colorArray[index % colorArray.length],
    }));

    this.legendItems = selectedApps.map((app, index) => ({
      label: app,
      color: colorArray[index % colorArray.length],
    }));

    this.chart.update();
  }
}
