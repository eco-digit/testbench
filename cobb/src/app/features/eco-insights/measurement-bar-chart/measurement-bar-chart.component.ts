import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ColorService } from '@services/color.service';
import { ChartSelectionService } from '@services/chart-selection.service';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-measurement-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './measurement-bar-chart.component.html',
  styleUrl: './measurement-bar-chart.component.scss',
})
export class MeasurementBarChartComponent implements OnInit {
  constructor(
    readonly colorService: ColorService,
    private selectionService: ChartSelectionService,
    private applicationService: ApplicationsService,
    readonly datePipe: DatePipe,
  ) {}

  @ViewChild('chartCanvas', { static: true })
  chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  color = this.colorService.chartColors;
  monthsLabel: string[] = [];
  rawMonths: string[] = [];
  measurements: number[] = [];
  STEP_Y = 1;

  @Output() clickedMonth = new EventEmitter<string>();

  ngOnInit() {
    this.initChart();
    this.selectionCheck();
    this.loadBarData();
  }

  private highlightPoint(index: number): void {
    this.chart.data.datasets.forEach((dataset) => {
      const highlightColor = this.color.tertiary;
      const disabledColor = this.color.primary16;

      const bgColors = dataset.data.map((_, i) =>
        i === index ? highlightColor : disabledColor,
      );
      const borderColors = dataset.data.map((_, i) =>
        i === index ? highlightColor : disabledColor,
      );

      dataset.backgroundColor = bgColors;
      dataset.borderColor = borderColors;
    });

    this.chart.update();
  }

  private initChart() {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Amount of Measurements',
            data: this.measurements,
            borderWidth: 1,
            backgroundColor: this.color.primary,
          },
        ],
      },
      options: {
        onClick: (event, barElements) => {
          if (barElements.length > 0) {
            const index = barElements[0].index;
            this.selectionService.selectIndex(index);
          } else {
            this.selectionService.clearSelection();
          }
        },
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            callbacks: {
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                return this.formatTooltipTitle(index);
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: this.color.outline,
              stepSize: this.STEP_Y,
            },
            grid: {
              color: this.color.grid,
            },
          },
          x: {
            ticks: {
              color: this.color.outline,
            },
            grid: {
              color: this.color.grid,
            },
          },
        },
      },
    });
  }

  private selectionCheck(): void {
    this.selectionService.selectedIndex$.subscribe((index) => {
      if (index !== null) {
        this.highlightPoint(index);
        this.clickedMonth.emit(this.formatTooltipTitle(index));
      } else {
        const dataset = this.chart.data.datasets[0];
        const defaultColor = this.color.primary;

        if (Array.isArray(dataset.backgroundColor)) {
          dataset.backgroundColor = dataset.data.map(() => defaultColor);
        }
        this.chart.update();
      }
    });
  }

  private formatTooltipTitle = (index: number): string => {
    const [year, month] = this.rawMonths[index].split('-');
    const date = new Date(+year, +month - 1);
    const monthName = this.datePipe.transform(date, 'MMMM') || '';
    return `${monthName} ${year}`;
  };

  private formatMonth(months: string): string {
    const [year, month] = months.split('-');
    const date = new Date(+year, +month - 1);
    return this.datePipe.transform(date, 'MMM') || '';
  }

  private loadBarData(): void {
    this.applicationService.getMonthlyEcoInsight().subscribe((barData) => {
      this.rawMonths = barData.map((item) => item.month);
      this.monthsLabel = barData.map((item) => this.formatMonth(item.month));
      this.measurements = barData.map((item) => item.measurements);
      this.chart.data.labels = this.monthsLabel;
      this.chart.data.datasets[0].data = this.measurements;
      this.chart.update();
    });
  }
}
