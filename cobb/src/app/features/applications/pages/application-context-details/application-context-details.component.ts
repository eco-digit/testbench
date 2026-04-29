import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatMiniFabButton } from '@angular/material/button';
import {
  MatTab,
  MatTabChangeEvent,
  MatTabGroup,
  MatTabLabel,
} from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { GitReposTableComponent } from '@features/applications/pages/application-context-details/pages/git-repos-table/git-repos-table.component';
import { MatTableModule } from '@angular/material/table';
import { AllArtifactsTableComponent } from '@features/applications/pages/application-context-details/pages/all-artifacts-table/all-artifacts-table.component';
import { MatDialog } from '@angular/material/dialog';
import { UploadArtifactsComponent } from '@features/applications/pages/application-context-details/pages/upload-artifacts/upload-artifacts.component';
import { ContextService } from '@features/applications/services/context.service';
import { AllMeasurementsTableComponent } from '@features/applications/pages/application-context-details/pages/all-measurements/all-measurements-table.component';
import { AddGitRepositoryComponent } from '@features/applications/pages/application-context-details/pages/add-git-repository/add-git-repository.component';
import { EcoInsightsScreenComponent } from '@components/eco-insights-screen/eco-insights-screen.component';
import { EditContextDto, NormalizedMeasurement } from '@models/context';
import { MeasurementOverviewData } from '@models/measurement';
import { MeasurementState } from '@enums/measurement-state.enum';
import { DeleteApplicationContextComponent } from '@features/applications/pages/application-context-details/pages/delete-application-context/delete-application-context.component';
import { EditApplicationContextComponent } from '@features/applications/pages/application-context-details/pages/edit-application-context/edit-application-context.component';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { SnackbarService } from '@services/snackbar.service';

@Component({
  selector: 'app-application-context-details',
  standalone: true,
  imports: [
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMiniFabButton,
    MatTab,
    MatTabGroup,
    MatTabLabel,
    MatTableModule,
    CommonModule,
    MatMenuTrigger,
    GitReposTableComponent,
    AllArtifactsTableComponent,
    EcoInsightsScreenComponent,
    AllMeasurementsTableComponent,
  ],
  templateUrl: './application-context-details.component.html',
  styleUrl: './application-context-details.component.scss',
})
export class ApplicationContextDetailsComponent implements OnInit {
  contextName?: string;
  description?: string;
  artefactCount?: number;
  gitRepoCount?: number;
  applicationId!: string;
  contextId!: string;
  selectedTabIndex = 0;
  measurementCount?: number;

  normalizedMeasurements: NormalizedMeasurement[] = [];
  atLeastOneMeasurementIsCompleted = false;

  @ViewChild('artefactTable') artefactTable!: AllArtifactsTableComponent;
  @ViewChild('measurementContextTable')
  measurementContextTable!: AllMeasurementsTableComponent;
  @ViewChild('gitTable') gitTable!: GitReposTableComponent;

  constructor(
    private route: ActivatedRoute,
    readonly router: Router,
    private applicationContextService: ContextService,
    readonly snackbar: SnackbarService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.contextId = this.route.snapshot.paramMap.get('contextId')!;
    this.applicationId = this.route.snapshot.paramMap.get('applicationId')!;
    this.applicationContextService
      .getContextById(this.contextId)
      .subscribe((context) => {
        this.contextName = context.name;
        this.description = context.description;
      });

    this.loadContextMeasurements(this.contextId);
  }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
  }

  private loadContextMeasurements(contextId: string): void {
    this.applicationContextService
      .getAllMeasurementsByContext(contextId)
      .subscribe({
        next: (measurements: MeasurementOverviewData[]) => {
          const completedMeasurements = measurements
            .filter(
              (measurement) =>
                measurement.measurementState === MeasurementState.COMPLETED,
            )
            .sort(
              (a, b) =>
                new Date(b.lastUpdated).getTime() -
                new Date(a.lastUpdated).getTime(),
            )
            .slice(0, 10);

          this.normalizedMeasurements = completedMeasurements.map(
            (measurement) => ({
              contextId: this.contextId,
              name: measurement.name,
              description: measurement.description,
              lastMeasurement: measurement,
            }),
          );

          this.atLeastOneMeasurementIsCompleted =
            completedMeasurements.length > 0;
        },
      });
  }

  openConnectGitRepoDialog() {
    const contextId = this.route.snapshot.params['contextId'];

    const dialogRef = this.dialog.open(AddGitRepositoryComponent, {
      panelClass: 'dialog-container',
      data: {
        contextId: contextId,
      },
    });

    dialogRef.componentInstance.gitUploaded.subscribe(() => {
      this.gitTable.loadGitRepos(contextId);
    });
  }

  openDeleteContextDialog() {
    this.dialog.open(DeleteApplicationContextComponent, {
      panelClass: 'dialog-delete-container',
      data: {
        applicationId: this.applicationId,
        contextId: this.contextId,
      },
    });
  }

  editContextDialog() {
    const dialogRef = this.dialog.open(EditApplicationContextComponent, {
      panelClass: 'dialog-container',
      data: {
        contextName: this.contextName,
        description: this.description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const contextId = String(this.route.snapshot.paramMap.get('contextId'));

      const requestBody: EditContextDto = {
        contextName: result.contextName,
        description: result.description,
      };

      this.applicationContextService
        .editContext(contextId, requestBody)
        .subscribe({
          next: (updated) => {
            this.contextName = updated.name;
            this.description = updated.description ?? '';
            this.snackbar.show(
              'Context updated successfully.',
              SnackbarTypeEnum.SUCCESS,
            );
          },
        });
    });
  }
  uploadArtefact() {
    const dialogRef = this.dialog.open(UploadArtifactsComponent, {
      panelClass: 'dialog-container',
      data: {
        contextId: this.contextId,
      },
    });

    dialogRef.componentInstance.fileUploaded.subscribe(() => {
      this.artefactTable.fetchArtefacts(this.contextId);
    });
  }
}
