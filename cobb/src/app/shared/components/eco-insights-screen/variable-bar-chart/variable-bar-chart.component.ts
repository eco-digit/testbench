import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ColorService } from '@services/color.service';
import { NumberFormatService } from '@services/number-format.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-variable-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './variable-bar-chart.component.html',
  styleUrls: ['./variable-bar-chart.component.scss'],
})
export class VariableBarChartComponent implements OnInit, OnChanges {
  constructor(
    readonly colorService: ColorService,
    private numFormatting: NumberFormatService,
  ) {}

  @ViewChild('variableBarChart', { static: true })
  chartRef!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;
  color = this.colorService.chartColors;

  @Input() selectedCategory?: string | null;
  @Input() selectedCategoryUnit?: string;
  @Input() categoryData?: number[];
  @Input() allLastMeasurements?: string[];

  @Output() selectedBarIndex = new EventEmitter<number | null>();

  selectedIndex: number | null = null;

  ngOnInit() {
    this.initBarChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.chart) return;

    if (changes['categoryData'] && this.categoryData) {
      this.updateChartData();
    }

    if (changes['selectedCategory']) {
      this.updateChartLabel();
    }

    if (changes['allLastMeasurements']) {
      this.updateAllLabels();
    }

    this.chart.update();
  }

  private updateChartData(): void {
    this.chart.data.datasets[0].data = this.categoryData || [];
  }

  private updateChartLabel(): void {
    this.chart.data.datasets[0].label = this.selectedCategory || '';
  }

  private updateAllLabels(): void {
    this.chart.data.labels = this.allLastMeasurements || [];
  }

  private updateBarColors() {
    if (this.selectedIndex !== null) {
      this.chart.data.datasets.forEach((dataset) => {
        dataset.backgroundColor = dataset.data.map((_, index) =>
          index === this.selectedIndex
            ? this.color.tertiary
            : this.color.primary16,
        );
      });
    } else {
      const dataset = this.chart.data.datasets[0];
      const defaultColor = this.color.primary;
      dataset.backgroundColor = dataset.data.map(() => defaultColor);
    }
    this.chart.update();
  }

  private initBarChart(): void {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.allLastMeasurements || [],
        datasets: [
          {
            label: this.selectedCategory || '',
            data: this.categoryData || [],
            borderWidth: 1,
            backgroundColor: this.color.primary,
          },
        ],
      },
      options: {
        onClick: (_, barElements) => {
          if (barElements.length > 0) {
            this.selectedIndex = barElements[0].index;
            this.updateBarColors();
            this.selectedBarIndex.emit(barElements[0].index);
          } else {
            this.selectedIndex = null;
            this.updateBarColors();
            this.selectedBarIndex.emit(null);
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                this.numFormatting.formatYAxisTick(Number(ctx.parsed.y)),
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: this.color.outline,
              callback: (val) =>
                this.numFormatting.formatYAxisTick(Number(val)),
            },
            grid: { color: this.color.grid },
          },
          x: {
            ticks: { color: this.color.outline },
            grid: { color: this.color.grid },
          },
        },
      },
    });
  }
}
