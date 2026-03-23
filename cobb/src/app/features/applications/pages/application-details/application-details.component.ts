import { Component, OnInit, ViewChild } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {
  MatTab,
  MatTabChangeEvent,
  MatTabGroup,
  MatTabLabel,
} from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { MatDialog } from '@angular/material/dialog';
import { EditApplicationComponent } from '@features/applications/pages/application-details/pages/edit-application/edit-application.component';
import { UpdateApplicationBody } from '@models/applications';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { SnackbarService } from '@services/snackbar.service';
import { InfoBoxMetrics } from '@models/dashboard';
import { DashboardStatistics } from '@models/measurement';
import { MeasurementService } from '@services/measurement.service';
import { ApplicationContextTableComponent } from '@features/applications/pages/application-details/pages/application-context/application-context-table.component';
import { CreateApplicationContextComponent } from '@features/applications/pages/application-details/pages/create-application-context/create-application-context.component';
import { DATE_FORMAT } from '@constants/date-formats';
import { ContextService } from '@features/applications/services/context.service';
import { MeasurementState } from '@enums/measurement-state.enum';
import { EcoInsightsScreenComponent } from '@components/eco-insights-screen/eco-insights-screen.component';
import { NormalizedMeasurement } from '@models/context';
import { DeleteApplicationComponent } from '@features/applications/pages/application-details/pages/delete-application/delete-application.component';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
  standalone: true,
  imports: [
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatIcon,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    CommonModule,
    RouterOutlet,
    ApplicationContextTableComponent,
    EcoInsightsScreenComponent,
  ],
})
export class ApplicationDetailsComponent implements OnInit {
  applicationId!: string;
  applicationName?: string;
  description?: string;
  timestamp?: string | null;
  measurementCount?: number;
  isHelpSidebarOpen = false;
  lastMeasurementDate?: string;
  selectedTabIndex = 0;
  metrics: InfoBoxMetrics[] = [];
  overviewData?: DashboardStatistics;

  normalizedMeasurements: NormalizedMeasurement[] = [];
  atLeastOneMeasurementIsCompleted = true;

  @ViewChild('contextTable') contextTable!: ApplicationContextTableComponent;

  constructor(
    private applicationsService: ApplicationsService,
    private route: ActivatedRoute,
    private helpSidebarState: HelpSidebarStateService,
    private dialog: MatDialog,
    private snackbar: SnackbarService,
    private measurementService: MeasurementService,
    private contextService: ContextService,
  ) {}

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.params['applicationId'];

    this.loadEcoInsightsData(this.applicationId);
    this.retrieveAllMeasurements(this.applicationId);

    this.applicationsService
      .getApplicationById(this.applicationId)
      .subscribe((value) => {
        this.applicationName = value.name;
        this.description = value.description;
      });
    this.helpSidebarState.sidebarOpen$.subscribe((isOpen) => {
      this.isHelpSidebarOpen = isOpen;
    });
  }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
  }

  private loadEcoInsightsData(applicationId: string): void {
    this.contextService.getContexts(applicationId).subscribe({
      next: (contexts) => {
        this.normalizedMeasurements = contexts
          .filter((c) => c.lastMeasurement !== null)
          .map((c) => ({
            contextId: c.contextId,
            name: c.name,
            description: c.lastMeasurement?.description ?? c.description,
            lastMeasurement: c.lastMeasurement!,
          }));

        this.atLeastOneMeasurementIsCompleted = contexts.some(
          (c) =>
            c.lastMeasurement?.measurementState === MeasurementState.COMPLETED,
        );
      },
    });
  }

  retrieveAllMeasurements(applicationId: string) {
    this.measurementService.getOverviewCounts(applicationId).subscribe({
      next: (response) => {
        this.overviewData = response;
        this.metrics = [
          {
            title: 'Application Context',
            subtitle: 'amount',
            value: this.overviewData.applications,
          },
          {
            title: 'Measurements',
            subtitle: 'amount',
            value: this.overviewData.measurements,
          },
          {
            title: 'Critical Measurements',
            subtitle: 'amount',
            value: this.overviewData.criticalApplications,
          },
          {
            title: 'Disrupted Measurements',
            subtitle: 'amount',
            value: this.overviewData.disruptedApplications,
          },
        ];
      },
    });
  }

  editApplicationDialog() {
    const dialogRef = this.dialog.open(EditApplicationComponent, {
      panelClass: 'dialog-container',
      data: {
        appName: this.applicationName,
        description: this.description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const applicationId = String(
        this.route.snapshot.paramMap.get('applicationId'),
      );

      const requestBody: UpdateApplicationBody = {
        applicationName: result.appName,
        description: result.description,
      };

      this.applicationsService
        .updateApplication(applicationId, requestBody)
        .subscribe({
          next: (updated) => {
            this.applicationName = updated.name;
            this.description = updated.description ?? '';
            this.snackbar.show(
              'Application updated successfully.',
              SnackbarTypeEnum.SUCCESS,
            );
          },
        });
    });
  }

  getMetricClasses(title: string): Record<string, boolean> {
    return {
      critical: title === 'Critical Measurements',
      disrupted: title === 'Disrupted Measurements',
    };
  }

  createApplicationContext() {
    const applicationId = this.route.snapshot.params['applicationId'];

    const dialogRef = this.dialog.open(CreateApplicationContextComponent, {
      panelClass: 'dialog-container',
      data: {
        applicationId: applicationId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.contextTable.loadApplicationContexts(applicationId);
      }
    });
  }

  deleteApplication() {
    const applicationId = this.route.snapshot.params['applicationId'];
    this.dialog.open(DeleteApplicationComponent, {
      panelClass: 'dialog-delete-container',
      data: {
        applicationId: applicationId,
      },
    });
  }

  protected readonly DATE_FORMAT = DATE_FORMAT;
}
