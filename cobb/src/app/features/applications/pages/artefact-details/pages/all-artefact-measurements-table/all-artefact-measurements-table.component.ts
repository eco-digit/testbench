import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatChip, MatChipAvatar, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { MeasurementArtefactDto } from '@models/measurement';
import { MatSort } from '@angular/material/sort';
import {
  getStatusInfo,
  resolveMeasurementState,
} from '@utils/status-file.util';
import { MeasurementService } from '@services/measurement.service';
import { MatTooltip } from '@angular/material/tooltip';
import { DetailsButtonComponent } from '@components/show-details-measurement-button/details-button/details-button.component';
import { ScoreFormatterPipe } from '@utils/scoreFormatter-pipe';

@Component({
  selector: 'app-all-artefact-measurements-table',
  standalone: true,
  imports: [
    MatCell,
    MatCellDef,
    MatChip,
    MatChipAvatar,
    MatChipSet,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableModule,
    MatTooltip,
    CommonModule,
    NgClass,
    DetailsButtonComponent,
    ScoreFormatterPipe,
  ],
  templateUrl: './all-artefact-measurements-table.component.html',
  styleUrl: './all-artefact-measurements-table.component.scss',
})
export class AllArtefactMeasurementsTableComponent
  implements OnInit, AfterViewInit
{
  constructor(
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private MeasurementService: MeasurementService,
  ) {}

  displayedColumns: string[] = [
    'measurementName',
    'artefact',
    'ecoDigitScore',
    'created',
    'lastUpdated',
    'trigger',
    'measurementStatus',
    'showDetails',
  ];

  dataSource = new MatTableDataSource<MeasurementArtefactDto>([]);
  artefactId!: string;
  contextId!: string;
  applicationId!: string;

  @Output() measurementsCountChange = new EventEmitter<number>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.artefactId = this.route.snapshot.paramMap.get('artefactId')!;
    this.contextId = this.route.snapshot.paramMap.get('contextId')!;
    this.applicationId = this.route.snapshot.paramMap.get('applicationId')!;
    this.loadMeasurementsPerArtefact(this.artefactId!);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMeasurementsPerArtefact(artefactId: string) {
    this.MeasurementService.getMeasurementsOfArtefact(artefactId).subscribe({
      next: (measurementArtefactDto) => {
        this.dataSource.data = measurementArtefactDto.map(
          (measurementArtefactDto) => {
            const measurementStatus = resolveMeasurementState(
              measurementArtefactDto.measurementState,
            );
            const { status, icon, tooltip } = getStatusInfo(measurementStatus);

            return {
              ...measurementArtefactDto,
              state: measurementStatus?.toLowerCase(),
              statusClass: status,
              icon,
              tooltip,
              isRunning: false,
            };
          },
        );
        this.measurementsCountChange.emit(this.dataSource.data?.length ?? 0);
      },
    });
  }

  formatLocalDateTime(localDateTime: string | undefined | null): string {
    if (!localDateTime) {
      return '-';
    }
    const date = new Date(localDateTime);
    return this.datePipe.transform(date, 'dd.MM.yyyy HH:mm:ss') || '-';
  }
}
