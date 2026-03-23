import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MeasurementStatusUpdate,
  MeasurementOverviewData,
} from '@models/measurement';
import { MeasurementService } from '@services/measurement.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getStatusInfo } from '@utils/status-file.util';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { FileDataService } from '@services/file-data.service';
import { saveAs } from 'file-saver';
import { SnackbarService } from '@services/snackbar.service';
import { ScoreFormatterPipe } from '@utils/scoreFormatter-pipe';
import { ErrorDisplayComponent } from '@components/error-display/error-display.component';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { MeasurementState } from '@enums/measurement-state.enum';
import { DATE_FORMAT } from '@constants/date-formats';

@Component({
  selector: 'app-measurements-table',
  templateUrl: './measurements-table.component.html',
  styleUrls: ['./measurements-table.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    CommonModule,
    MatIconModule,
    MatSortModule,
    MatTooltipModule,
    MatButtonModule,
    ErrorDisplayComponent,
    ScoreFormatterPipe,
  ],
  providers: [DatePipe],
})
export class MeasurementsTableComponent implements OnInit, AfterViewInit {
  displayedColumns: (
    | keyof MeasurementOverviewData
    | 'show-details'
    | 'download-csv'
  )[] = [
    'name',
    'applicationVariantName',
    'ecodigitScore',
    'lastUpdated',
    'trigger',
    'measurementState',
    'show-details',
    'download-csv',
  ];

  dataSource = new MatTableDataSource<MeasurementOverviewData>([]);
  hasError = false;
  measurementId?: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Output() measurementCountChange = new EventEmitter<number>();
  @Output() lastMeasurementFormatted = new EventEmitter<string>();

  constructor(
    readonly measurementService: MeasurementService,
    readonly route: ActivatedRoute,
    readonly fileService: FileDataService,
    readonly snackbar: SnackbarService,
    readonly router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.fetchMeasurements();
    this.updateMeasurementState();
  }

  private getLatestMeasurement(data: MeasurementOverviewData[]) {
    return data.reduce((latest, current) => {
      return new Date(current.lastUpdated) > new Date(latest.lastUpdated)
        ? current
        : latest;
    }, data[0]);
  }

  fetchMeasurements() {
    const applicationIdString =
      this.route.snapshot.paramMap.get('applicationId');
    const applicationId = String(applicationIdString);

    this.measurementService
      .getMeasurementOfApplication(applicationId)
      .subscribe(
        (data) => {
          const mappedData = data.map((value) => {
            const state = Object.values(MeasurementState).includes(
              value.measurementState as MeasurementState,
            )
              ? value.measurementState
              : MeasurementState[
                  value.measurementState as unknown as keyof typeof MeasurementState
                ] || value.measurementState;

            const { status, icon, tooltip } = getStatusInfo(state);

            return {
              ...value,
              id: value.id,
              state: state.toLowerCase(),
              statusClass: status,
              icon,
              tooltip,
              trigger: value.trigger
                ? value.trigger.charAt(0).toUpperCase() +
                  value.trigger.slice(1).toLowerCase()
                : '-',
            };
          });

          this.dataSource.data = mappedData;
          this.hasError = false;
          const lastMeasurement = this.getLatestMeasurement(mappedData);

          if (lastMeasurement) {
            this.lastMeasurementFormatted.emit(lastMeasurement.lastUpdated);
          }
          this.measurementCountChange.emit(this.dataSource.data?.length ?? 0);
        },
        (error) => {
          console.error('Error fetching measurement data:', error);
          this.hasError = true;
        },
      );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  showMeasurementDetails(row: MeasurementOverviewData): void {
    const measurementId = row.id;
    const applicationId = this.route.snapshot.paramMap.get('applicationId');

    if (measurementId && applicationId) {
      this.router.navigate([
        '/applications',
        applicationId,
        'measurements',
        'measurementResults',
        measurementId,
      ]);
    } else {
      console.warn('Missing ID(s):', { applicationId, measurementId });
    }
  }

  downloadCsv(measurementId: string): void {
    const measurementState = this.dataSource.data.find(
      (m) => m.id === measurementId,
    )?.measurementState;

    if (!measurementState || measurementState !== MeasurementState.COMPLETED) {
      this.snackbar.show(
        'Measurement is not complete yet. Cannot download.',
        SnackbarTypeEnum.ERROR,
      );
      return;
    }
    this.fileService.downloadCsv(measurementId).subscribe({
      next: (response) => {
        const blob = response.body as Blob;
        const fileName = 'results.zip';
        saveAs(blob, fileName);

        this.snackbar.show(
          `${fileName} downloaded successfully! It is now available for use.`,
          SnackbarTypeEnum.SUCCESS,
        );
      },
      error: () => {
        this.snackbar.show(
          'Something went wrong while downloading.. Please try again.',
          SnackbarTypeEnum.ERROR,
        );
      },
    });
  }

  private updateMeasurementState(): void {
    this.measurementService.listenToMeasurementUpdates().subscribe({
      next: (update: MeasurementStatusUpdate) => {
        const updateId = update.measurementId;
        const idx = this.dataSource.data.findIndex((d) => d.id === updateId);
        if (idx === -1) return;

        const newState = Object.values(MeasurementState).includes(
          update.measurementState,
        )
          ? update.measurementState
          : MeasurementState[
              update.measurementState as unknown as keyof typeof MeasurementState
            ] || update.measurementState;
        this.dataSource.data[idx].measurementState = newState;

        // 2) Recalculate derived UI fields:
        const { status, icon, tooltip } = getStatusInfo(newState);

        this.dataSource.data[idx].state = newState.toLowerCase();
        this.dataSource.data[idx].statusClass = status;
        this.dataSource.data[idx].icon = icon;
        this.dataSource.data[idx].tooltip = tooltip;

        // 3) Refresh the table
        this.dataSource.data = [...this.dataSource.data];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('SSE error:', err),
    });
  }

  protected readonly DATE_FORMAT = DATE_FORMAT;
}
