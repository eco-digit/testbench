import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ColorService } from '@services/color.service';
import { Chart } from 'chart.js/auto';
import { ChartDataset } from 'chart.js';
import { MeasurementService } from '@services/measurement.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

type ChartClickSource = 'bar' | 'line' | 'outside';
type MixedDataset =
  | ChartDataset<'bar', number[]>
  | ChartDataset<'line', number[]>;

export interface ChartClickEvent {
  source: ChartClickSource;
  datasetIndex: number | null;
  pointIndex: number | null;
}

@Component({
  selector: 'app-result-chart',
  standalone: true,
  imports: [],
  templateUrl: './result-chart.component.html',
  styleUrl: './result-chart.component.scss',
})
export class ResultChartComponent implements OnInit {
  constructor(
    readonly colorService: ColorService,
    readonly measurementService: MeasurementService,
    readonly route: ActivatedRoute,
  ) {}

  @ViewChild('chartCanvas', { static: true })
  chartRef!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  color = this.colorService.chartColors;
  environmentAmountsPerPhase: number[] = [];
  environmentAmountsCumulative: number[] = [];
  activeDatasetIndex: number | null = null;
  selectedPointIndex: number | null = null;

  @Output() interaction = new EventEmitter<ChartClickEvent>();

  ngOnInit() {
    const measurementId = this.route.snapshot.paramMap.get('measurementId')!;
    this.getEcoDigitScoresPerPhase(measurementId);
    this.getEcoDigitScoresCumulative(measurementId);
    this.initChart();
  }

  getEcoDigitScoresPerPhase(measurementId: string) {
    this.measurementService
      .getEcoDigitScores(measurementId)
      .subscribe((scores) => {
        this.environmentAmountsPerPhase = scores;
        this.chart.data.datasets[0].data = this.environmentAmountsPerPhase;
        this.chart.update();
      });
  }

  getEcoDigitScoresCumulative(measurementId: string) {
    this.measurementService
      .getEcoDigitScores(measurementId)
      .pipe(
        map((scores) => {
          const cumulative: number[] = [];
          scores.reduce((sum, current) => {
            const newSum = sum + current;
            cumulative.push(newSum);
            return newSum;
          }, 0);
          return cumulative;
        }),
      )
      .subscribe((cumulativeScores) => {
        this.environmentAmountsCumulative = cumulativeScores;
        this.chart.data.datasets[1].data = this.environmentAmountsCumulative;
        this.chart.update();
      });
  }
  private isLineDataset(dataset: MixedDataset): boolean {
    return (dataset.type ?? 'bar') === 'line';
  }

  private fillColorArray(length: number, color: string) {
    return Array(length).fill(color);
  }

  private updateBarColors(): void {
    const disabledColor = this.color.primary16;
    const highlightColor = this.color.tertiary;
    const lineBaseColor = this.color.primaryFix;
    const barBaseColor = this.color.primary;

    const selectedIndex = this.selectedPointIndex;
    const activeDatasetIndex = this.activeDatasetIndex;

    const datasets: MixedDataset[] = this.chart.data.datasets as MixedDataset[];

    if (selectedIndex === null || activeDatasetIndex === null) {
      this.resetAllDatasetsToBase(datasets, barBaseColor, lineBaseColor);
      this.chart.update();
      return;
    }

    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i];
      const isLine = this.isLineDataset(dataset);

      const dataArray = Array.isArray(dataset.data) ? dataset.data : [];
      const itemCount = dataArray.length;

      if (i === activeDatasetIndex && isLine) {
        this.highlightLineDataset(
          dataset as ChartDataset<'line', number[]>,
          itemCount,
          selectedIndex,
          disabledColor,
          highlightColor,
        );
        continue;
      }

      if (i === activeDatasetIndex && !isLine) {
        this.highlightBarDataset(
          dataset as ChartDataset<'bar', number[]>,
          itemCount,
          selectedIndex,
          disabledColor,
          highlightColor,
        );
        continue;
      }

      this.disableDataset(dataset, itemCount, disabledColor, isLine);
    }

    this.chart.update();
  }

  private resetAllDatasetsToBase(
    datasets: MixedDataset[],
    barBaseColor: string,
    lineBaseColor: string,
  ) {
    for (const dataset of datasets) {
      const isLine = this.isLineDataset(dataset);
      const dataArray = Array.isArray(dataset.data) ? dataset.data : [];
      const itemCount = dataArray.length;

      const baseColor = isLine ? lineBaseColor : barBaseColor;
      const colorArray = this.fillColorArray(itemCount, baseColor);

      dataset.backgroundColor = colorArray;
      dataset.borderColor = isLine ? lineBaseColor : colorArray;

      if (isLine) {
        const line = dataset as ChartDataset<'line', number[]>;
        line.pointBackgroundColor = colorArray;
        line.pointBorderColor = colorArray;
      }
    }
  }

  private highlightLineDataset(
    dataset: ChartDataset<'line', number[]>,
    itemCount: number,
    selectedIndex: number,
    disabledColor: string,
    highlightColor: string,
  ) {
    const allDisabled = this.fillColorArray(itemCount, disabledColor);
    const highlighted = this.addHighlight(
      allDisabled,
      selectedIndex,
      highlightColor,
    );

    dataset.backgroundColor = allDisabled;
    dataset.borderColor = disabledColor;
    dataset.pointBackgroundColor = highlighted;
    dataset.pointBorderColor = highlighted;
  }

  private highlightBarDataset(
    dataset: ChartDataset<'bar', number[]>,
    itemCount: number,
    selectedIndex: number,
    disabledColor: string,
    highlightColor: string,
  ) {
    const highlighted = this.addHighlight(
      this.fillColorArray(itemCount, disabledColor),
      selectedIndex,
      highlightColor,
    );

    dataset.backgroundColor = highlighted;
    dataset.borderColor = highlighted;
  }

  private disableDataset(
    dataset: MixedDataset,
    itemCount: number,
    disabledColor: string,
    isLine: boolean,
  ) {
    const disabledArray = this.fillColorArray(itemCount, disabledColor);

    dataset.backgroundColor = disabledArray;
    dataset.borderColor = isLine ? disabledColor : disabledArray;

    if (isLine) {
      const line = dataset as ChartDataset<'line', number[]>;
      line.pointBackgroundColor = disabledArray;
      line.pointBorderColor = disabledArray;
    }
  }

  private addHighlight(
    colors: string[],
    index: number,
    highlightColor: string,
  ) {
    if (index >= 0 && index < colors.length) {
      colors[index] = highlightColor;
    }
    return colors;
  }

  private initChart() {
    this.chart = new Chart(this.chartRef.nativeElement, {
      data: {
        labels: ['prepare', 'install', 'work', 'collect', 'cleanup'],
        datasets: [
          {
            label: 'Per Phase',
            data: this.environmentAmountsPerPhase,
            borderWidth: 1,
            backgroundColor: this.color.primary,
            type: 'bar',
          },
          {
            label: 'Cumulative',
            data: this.environmentAmountsCumulative,
            borderColor: this.color.primaryFix,
            backgroundColor: this.color.primaryFix,
            type: 'line',
          },
        ],
      },
      options: {
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const { datasetIndex, index } = elements[0];
            this.selectedPointIndex = index;
            this.activeDatasetIndex = datasetIndex;

            const dataset = (this.chart.data.datasets as MixedDataset[])[
              datasetIndex
            ];
            const source: ChartClickSource =
              (dataset.type ?? 'bar') === 'line' ? 'line' : 'bar';

            this.interaction.emit({
              source,
              datasetIndex,
              pointIndex: index,
            });
          } else {
            this.activeDatasetIndex = null;
            this.selectedPointIndex = null;

            this.interaction.emit({
              source: 'outside',
              datasetIndex: null,
              pointIndex: null,
            });
          }
          this.updateBarColors();
        },
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            displayColors: false,
            callbacks: {},
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: this.color.outline,
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
}
