import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NumericMeasurementKey } from '@models/measurement';
import { MatIcon } from '@angular/material/icon';
import { MatChipOption, MatChipSet } from '@angular/material/chips';
import { VariableBarChartComponent } from '@components/eco-insights-screen/variable-bar-chart/variable-bar-chart.component';
import { DatePipe, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScientificFormatPipe } from '@pipes/scientificFormat.pipe';
import { DurationPipe } from '@pipes/duration.pipe';
import { MatButton } from '@angular/material/button';
import { NormalizedMeasurement } from '@models/context';

@Component({
  selector: 'app-eco-insights-screen',
  standalone: true,
  imports: [
    MatIcon,
    MatChipSet,
    MatChipOption,
    VariableBarChartComponent,
    NgStyle,
    RouterLink,
    ScientificFormatPipe,
    DatePipe,
    DurationPipe,
    MatButton,
  ],
  templateUrl: './eco-insights-screen.component.html',
  styleUrl: './eco-insights-screen.component.scss',
})
export class EcoInsightsScreenComponent implements OnInit, OnChanges {
  @Input() active = false;
  @Input() applicationId: string = '';
  @Input() normalizedMeasurements: NormalizedMeasurement[] = [];
  @Input() atLeastOneMeasurementIsCompleted = true;

  @Output() categoryChanged = new EventEmitter<string>();

  selectedIndexFromBarChart: number | null = null;
  selectedCategory: string | null = null;
  selectedCategoryKey: NumericMeasurementKey | null = null;
  categoryValues?: number[];
  allLastMeasurements?: string[];

  categories = [
    this.createCategory(
      'ECO:DIGIT Score',
      'ecodigitScore',
      '/assets/images/ecodigit-score_icon.svg',
      'score',
    ),
    this.createCategory(
      'Abiotic Depletion',
      'adp',
      '/assets/images/abiotic.svg',
      'kg Sb–eq',
    ),
    this.createCategory(
      'Cumulative Energy Demand',
      'ced',
      '/assets/images/offline_bolt.svg',
      'kWh',
    ),
    this.createCategory(
      'Global Warming Potential',
      'gwp',
      '/assets/images/co2-icon.svg',
      'kg CO2–eq',
    ),
    this.createCategory(
      'Water Consumption',
      'water',
      '/assets/images/local_drink.svg',
      'm3',
    ),
    this.createCategory(
      'Waste Electrical and Electronic Equipment',
      'weee',
      '/assets/images/weee-icon.svg',
      'kg',
    ),
    this.createCategory('Toxicity', 'tox', '/assets/images/toxity.svg', 'CTUe'),
  ];

  ngOnInit(): void {
    const defaultCategory = this.categories.find(
      (c) => c.label === 'ECO:DIGIT Score',
    );
    if (defaultCategory)
      this.updateCategoryValues(defaultCategory.key, defaultCategory.label);
    this.recomputeDerived();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['normalizedMeasurements']) {
      this.recomputeDerived();

      if (!this.selectedCategory || !this.selectedCategoryKey) {
        const def = this.categories.find((c) => c.label === 'ECO:DIGIT Score');
        if (def) this.updateCategoryValues(def.key, def.label);
      }
    }
  }

  updateCategoryValues(
    categoryKey: NumericMeasurementKey,
    categoryLabel: string,
  ): void {
    this.selectedCategory = categoryLabel;
    this.selectedCategoryKey = categoryKey;

    this.categoryValues = this.normalizedMeasurements
      .map((item) => item.lastMeasurement[categoryKey])
      .slice(0, 10);

    this.allLastMeasurements = this.normalizedMeasurements.map((v) => v.name);
    this.categoryChanged.emit(categoryLabel);
  }

  get selectedCategoryValue(): number | null {
    if (
      this.selectedIndexFromBarChart === null ||
      this.selectedCategoryKey === null
    )
      return null;
    return (
      this.normalizedMeasurements[this.selectedIndexFromBarChart]
        ?.lastMeasurement?.[this.selectedCategoryKey] ?? null
    );
  }

  private recomputeDerived(): void {
    this.allLastMeasurements = this.normalizedMeasurements.map((v) => v.name);
    if (this.selectedCategoryKey) {
      this.categoryValues = this.normalizedMeasurements
        .map((item) => item.lastMeasurement[this.selectedCategoryKey!])
        .slice(0, 10);
    }
  }

  getIndex(index: number | null): void {
    this.selectedIndexFromBarChart = index;
  }

  selectedCategoryData() {
    return this.categories.find((c) => c.label === this.selectedCategory);
  }

  private createCategory(
    label: string,
    key: NumericMeasurementKey,
    image: string,
    unit: string,
  ) {
    return { label, key, image, unit };
  }
}
