import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatButton } from '@angular/material/button';
import {
  ContextOverviewDto,
  HealthStatusInfo,
  HealthStatusInfoMap,
} from '@models/context';
import { ContextService } from '@features/applications/services/context.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatChip, MatChipAvatar, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { HealthStatus } from '@enums/measurement-state.enum';
import { MatTooltip } from '@angular/material/tooltip';
import { ScoreFormatterPipe } from '@utils/scoreFormatter-pipe';
import { DATE_FORMAT } from '@constants/date-formats';

@Component({
  selector: 'app-application-context',
  standalone: true,
  imports: [
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableModule,
    CommonModule,
    MatButton,
    MatPaginator,
    MatChip,
    MatChipAvatar,
    MatChipSet,
    MatIcon,
    MatTooltip,
    ScoreFormatterPipe,
    RouterLink,
  ],
  templateUrl: './application-context-table.component.html',
  styleUrl: './application-context-table.component.scss',
})
export class ApplicationContextTableComponent implements OnInit, AfterViewInit {
  constructor(
    private applicationContextService: ContextService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
  ) {}

  displayedColumns: string[] = [
    'name',
    'healthStatus',
    'lastMeasurement',
    'ecodigitScore',
    'showDetails',
  ];

  dataSource = new MatTableDataSource<ContextOverviewDto>([]);
  error?: string;
  readonly DATE_FORMAT = DATE_FORMAT;
  applicationId: string | null = null;
  contextId: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Output() measurementCountChange = new EventEmitter<number>();
  getStatusInfo(healthStatus: string): HealthStatusInfo {
    const stateValue = HealthStatus[healthStatus as keyof typeof HealthStatus];
    return (
      HealthStatusInfoMap[stateValue] ?? {
        status: 'status-unknown',
        label: 'unknown status',
      }
    );
  }

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('applicationId');
    this.loadApplicationContexts(this.applicationId!);
  }

  loadApplicationContexts(applicationId: string) {
    this.applicationContextService.getContexts(applicationId).subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.measurementCountChange.emit(this.dataSource.data?.length ?? 0);
      },
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDateOfLastMeasurement(element: ContextOverviewDto) {
    return element.lastMeasurement?.lastUpdated
      ? (this.datePipe.transform(
          element.lastMeasurement.lastUpdated,
          this.DATE_FORMAT,
        ) ?? '-')
      : '-';
  }
}
