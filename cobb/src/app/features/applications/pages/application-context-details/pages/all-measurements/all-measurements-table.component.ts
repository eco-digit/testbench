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
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { MeasurementService } from '@services/measurement.service';
import { MatChip, MatChipAvatar, MatChipSet } from '@angular/material/chips';
import { MeasurementArtefactDto } from '@models/measurement';
import { MatTooltip } from '@angular/material/tooltip';
import {
  getStatusInfo,
  resolveMeasurementState,
} from '@utils/status-file.util';
import { DetailsButtonComponent } from '@components/show-details-measurement-button/details-button/details-button.component';
import { ScoreFormatterPipe } from '@utils/scoreFormatter-pipe';

@Component({
  selector: 'app-all-measurements',
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
    CommonModule,
    MatTooltip,
    DetailsButtonComponent,
    ScoreFormatterPipe,
  ],
  templateUrl: './all-measurements-table.component.html',
  styleUrl: './all-measurements-table.component.scss',
})
export class AllMeasurementsTableComponent implements OnInit, AfterViewInit {
  constructor(
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private MeasurementService: MeasurementService,
  ) {}

  displayedColumns: string[] = [
    'measurementName',
    'artefact',
    'ecoDigitScore',
    'lastUpdated',
    'trigger',
    'measurementStatus',
    'showDetails',
  ];

  dataSource = new MatTableDataSource<MeasurementArtefactDto>([]);
  contextId!: string;
  applicationId!: string;

  @Output() measurementsCountChange = new EventEmitter<number>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.contextId = this.route.snapshot.paramMap.get('contextId')!;
    this.applicationId = this.route.snapshot.paramMap.get('applicationId')!;

    this.loadMeasurementsPerContext(this.contextId!);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMeasurementsPerContext(contextId: string) {
    this.MeasurementService.getMeasurementsOfContext(contextId).subscribe({
      next: (measurementContextDto) => {
        this.dataSource.data = measurementContextDto.map(
          (measurementContextDto) => {
            const measurementStatus = resolveMeasurementState(
              measurementContextDto.measurementState,
            );
            const { status, icon, tooltip } = getStatusInfo(measurementStatus);

            return {
              ...measurementContextDto,
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
