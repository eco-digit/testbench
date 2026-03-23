import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  MatChip,
  MatChipAvatar,
  MatChipSet,
  MatChipsModule,
} from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { CommonModule, NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  getStatusInfo,
  resolveMeasurementState,
} from '@utils/status-file.util';
import { DATE_FORMAT } from '@constants/date-formats';
import { ArtefactRow, ArtefactsOverviewDto } from '@models/artefacts';
import { ArtefactsService } from '@features/applications/services/artefact.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ScoreFormatterPipe } from '@utils/scoreFormatter-pipe';
import { CreateMeasurementData } from '@models/measurement';
import { MeasurementService } from '@services/measurement.service';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { SnackbarService } from '@services/snackbar.service';

@Component({
  selector: 'app-all-artifacts-table',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCell,
    MatCellDef,
    MatChip,
    MatChipsModule,
    MatChipAvatar,
    MatChipSet,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconModule,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatTableModule,
    CommonModule,
    MatTooltipModule,
    NgClass,
    ScoreFormatterPipe,
  ],
  templateUrl: './all-artifacts-table.component.html',
  styleUrl: './all-artifacts-table.component.scss',
})
export class AllArtifactsTableComponent implements OnInit, AfterViewInit {
  constructor(
    private artefactsService: ArtefactsService,
    private route: ActivatedRoute,
    private measurementService: MeasurementService,
    private snackbar: SnackbarService,
    private router: Router,
  ) {}

  displayedColumns: string[] = [
    'name',
    'lastMeasurement',
    'ecodigitScore',
    'healthStatus',
    'startMeasurement',
    'showDetails',
  ];

  dataSource = new MatTableDataSource<ArtefactsOverviewDto>([]);
  protected readonly DATE_FORMAT = DATE_FORMAT;

  @Output() artefactsCountChange = new EventEmitter<number>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  applicationId!: string;
  contextId!: string;

  ngOnInit() {
    this.applicationId = this.route.snapshot.params['applicationId'];
    this.contextId = this.route.snapshot.params['contextId'];
    this.fetchArtefacts(this.contextId);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  fetchArtefacts(contextId: string, artefactType?: string) {
    this.artefactsService
      .getArtefacts(contextId, artefactType)
      .subscribe((artefacts) => {
        this.dataSource.data = artefacts.map((artifact) => {
          const measurementStatus = resolveMeasurementState(
            artifact.lastMeasurement?.measurementState,
          );
          const { status, icon, tooltip } = getStatusInfo(measurementStatus);

          return {
            ...artifact,
            state: measurementStatus?.toLowerCase(),
            statusClass: status,
            icon,
            tooltip,
            isRunning: false,
          };
        });
        this.artefactsCountChange.emit(this.dataSource.data?.length ?? 0);
      });
  }

  private startMeasurement(element: ArtefactRow): void {
    const measurementData: CreateMeasurementData = {
      applicationVariantId: element.id,
      name: element.customFileName ?? element.originalFileName,
    };

    this.measurementService
      .createAndStartMeasurement(measurementData)
      .subscribe({
        next: () =>
          this.snackbar.show(
            'Measurement started successfully.',
            SnackbarTypeEnum.SUCCESS,
          ),
        error: () => {
          this.snackbar.show(
            'Error starting measurement.',
            SnackbarTypeEnum.ERROR,
          );
          element.isRunning = false;
        },
      });
  }

  private stopMeasurement(element: ArtefactRow): void {
    this.measurementService
      .stopMeasurement(element.lastMeasurement!.id)
      .subscribe({
        next: () =>
          this.snackbar.show(
            'Measurement stopped successfully.',
            SnackbarTypeEnum.SUCCESS,
          ),
        error: () => {
          this.snackbar.show(
            'Error stopping measurement.',
            SnackbarTypeEnum.ERROR,
          );
          element.isRunning = true;
        },
      });
  }

  toggleMeasurement(element: ArtefactRow) {
    element.isRunning = !element.isRunning;

    if (element.isRunning) {
      this.startMeasurement(element);
      return;
    }

    if (!element.lastMeasurement?.id) {
      this.snackbar.show('No measurement to stop.', SnackbarTypeEnum.ERROR);
      element.isRunning = false;
      return;
    }

    this.stopMeasurement(element);
  }

  showDetails(row: ArtefactsOverviewDto): void {
    const artefactId = row.id;
    if (artefactId) {
      this.router.navigateByUrl(
        `/applications/${this.applicationId}/context/${this.contextId}/artefact/${artefactId}`,
      );
    }
  }
}
