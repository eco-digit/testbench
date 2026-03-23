import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { ApplicationsTableData } from '@models/applications';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorDisplayComponent } from '@components/error-display/error-display.component';
import { ScoreFormatterPipe } from '@utils/scoreFormatter-pipe';
import { DATE_FORMAT } from '@constants/date-formats';

@Component({
  selector: 'app-all-applications-table',
  templateUrl: './all-applications-table.component.html',
  styleUrls: ['./all-applications-table.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    CommonModule,
    MatIconModule,
    MatSortModule,
    MatButtonModule,
    MatTooltipModule,
    ErrorDisplayComponent,
    ScoreFormatterPipe,
  ],
})
export class AllApplicationsTableComponent implements AfterViewInit, OnInit {
  dataSource = new MatTableDataSource<ApplicationsTableData>();
  displayedColumns: (keyof ApplicationsTableData | 'show-details')[] = [
    'applicationName',
    'lastMeasurement',
    'ecodigitScore',
    'show-details',
  ];

  hasError = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private applicationsService: ApplicationsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadApplicationsList();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (
      item: ApplicationsTableData,
      property: string,
    ) => {
      return property === 'lastMeasurement'
        ? (item.lastMeasurement?.lastUpdated ?? '-')
        : String(item[property as keyof ApplicationsTableData] ?? '-');
    };
  }

  showDetails(row: ApplicationsTableData): void {
    const applicationId = row.applicationId;
    if (applicationId) {
      this.router.navigate([`/applications/${applicationId}`]);
    }
  }

  loadApplicationsList(): void {
    this.applicationsService.getAllApplicationsList().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.hasError = false;
      },
      error: () => {
        this.hasError = true;
      },
    });
  }

  refresh(): void {
    this.loadApplicationsList();
  }

  protected readonly DATE_FORMAT = DATE_FORMAT;
}
