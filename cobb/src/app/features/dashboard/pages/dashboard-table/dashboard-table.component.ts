import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { Router } from '@angular/router';
import { DashboardApplicationTableData } from '@models/applications';
import { CommonModule } from '@angular/common';
import { ScoreFormatterPipe } from '@utils/scoreFormatter-pipe';

@Component({
  selector: 'app-dashboard-table',
  standalone: true,
  imports: [MatTableModule, MatButton, CommonModule, ScoreFormatterPipe],
  templateUrl: './dashboard-table.component.html',
})
export class DashboardTableComponent implements OnInit {
  displayedColumns: (keyof DashboardApplicationTableData | 'actions')[] = [
    'name',
    'lastMeasurementScore',
    'actions',
  ];

  dataSource = new MatTableDataSource<DashboardApplicationTableData>([]);

  constructor(
    readonly applicationService: ApplicationsService,
    readonly router: Router,
  ) {}

  ngOnInit() {
    this.fetchApplicationsWithLastScores();
  }

  showDetails(row: DashboardApplicationTableData): void {
    this.router.navigate(['/applications', row.id]);
  }

  fetchApplicationsWithLastScores(): void {
    this.applicationService.getApplicationsForDashboard().subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource(response);
      },
    });
  }
}
