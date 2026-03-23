import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardTableComponent } from '@features/dashboard/pages/dashboard-table/dashboard-table.component';
import { MatButton } from '@angular/material/button';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardStatistics, MeasurementData } from '@models/measurement';
import { InfoBoxMetrics, TotalDashboardValues } from '@models/dashboard';
import { MeasurementService } from '@services/measurement.service';
import { MatDialog } from '@angular/material/dialog';
import {
  getStatusInfo,
  resolveMeasurementState,
} from '@utils/status-file.util';
import { MeasurementState } from '@enums/measurement-state.enum';
import { ApplicationsService } from '@features/applications/services/applications.service';

@Component({
  selector: 'app-dashboard-application',
  standalone: true,
  imports: [
    DashboardTableComponent,
    MatButton,
    MatChip,
    MatIcon,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './dashboard-application.component.html',
  styleUrl: './dashboard-application.component.scss',
})
export class DashboardApplicationComponent implements OnInit {
  lastMeasurementState?: MeasurementState;
  metrics?: InfoBoxMetrics[];
  statusColor?: string;
  statusIcon?: string;
  lastMeasurement?: MeasurementData;
  totalDashboardData?: TotalDashboardValues;
  dashboardStatistics?: DashboardStatistics;

  constructor(
    readonly measurementService: MeasurementService,
    readonly applicationService: ApplicationsService,
    readonly dialog: MatDialog,
    readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.getLatestMeasurement();
    this.retrieveAllDashboardValues();
  }

  getLatestMeasurement() {
    this.measurementService.getLastMeasurement().subscribe({
      next: (response) => {
        this.lastMeasurement = response;
        this.lastMeasurementState = resolveMeasurementState(
          this.lastMeasurement?.measurementState,
        );

        if (this.lastMeasurementState) {
          const statusInfo = getStatusInfo(this.lastMeasurementState);
          this.statusColor = statusInfo.status;
          this.statusIcon = statusInfo.icon;
        } else {
          console.warn(
            'Unknown measurement state:',
            this.lastMeasurement?.measurementState,
          );
          this.statusIcon = 'help';
        }
      },
      error: (error) => {
        console.error('Error while loading last measurement', error);
      },
    });
  }

  retrieveAllDashboardValues() {
    this.applicationService.getTotalDashboardValues().subscribe({
      next: (response) => {
        this.totalDashboardData = response;
        this.metrics = [
          {
            title: 'Measurements',
            subtitle: 'in total',
            value: this.totalDashboardData.totalMeasurements,
          },
          {
            title: 'Applications',
            subtitle: 'in total',
            value: this.totalDashboardData.totalApplications,
          },
          {
            title: 'Critical Measurements',
            subtitle: 'in total',
            value: this.totalDashboardData.totalCriticalMeasurements,
          },
        ];
      },
    });
  }
}
