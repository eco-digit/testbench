/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { MeasurementOverviewData } from '@models/measurement';
import { FileDataService } from '@services/file-data.service';
import { MeasurementService } from '@services/measurement.service';
import { SnackbarService } from '@services/snackbar.service';
import { getStatusInfo } from '@utils/status-file.util';
import { saveAs } from 'file-saver';
import { MatStepperModule } from '@angular/material/stepper';
import { CustomStepperComponent } from '@components/custom-stepper/custom-stepper.component';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { MatDividerModule } from '@angular/material/divider';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { MeasurementState } from '@enums/measurement-state.enum';
import { DATE_FORMAT } from '@constants/date-formats';
import { ResultDetailsComponent } from '@features/applications/pages/measurement-results/result-details/result-details.component';

@Component({
  selector: 'app-measurement-results',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatIcon,
    CommonModule,
    MatChipsModule,
    MatTooltipModule,
    MatStepperModule,
    CustomStepperComponent,
    MatDividerModule,
    ResultDetailsComponent,
  ],
  templateUrl: './measurement-results.component.html',
  styleUrls: ['./measurement-results.component.scss'],
})
export class MeasurementResultsComponent implements OnInit {
  applicationId: string | null = null;
  measurementId: string | null = null;
  name: string = '';
  measurementState: string = '';
  lastUpdated: string = '';
  statusClass: string = '';
  icon: string = '';
  tooltip: string = '';
  stateDisplay: string = '';
  isHelpSidebarOpen: boolean = false;
  detailedMeasurementState: keyof typeof MeasurementState | undefined;

  constructor(
    readonly measurementService: MeasurementService,
    readonly route: ActivatedRoute,
    readonly date: DatePipe,
    readonly fileService: FileDataService,
    readonly snackbar: SnackbarService,
    readonly helpSidebarState: HelpSidebarStateService,
  ) {}

  ngOnInit(): void {
    this.initializeRouteParams();

    if (this.applicationId) {
      this.loadMeasurementData();
    } else {
      console.warn('applicationId param is missing');
    }

    this.helpSidebarState.sidebarOpen$.subscribe((isOpen) => {
      this.isHelpSidebarOpen = isOpen;
    });
  }

  private initializeRouteParams(): void {
    this.applicationId =
      this.route.parent?.snapshot.paramMap.get('applicationId') ?? null;
    this.measurementId = this.route.snapshot.paramMap.get('measurementId');
  }

  private loadMeasurementData(): void {
    this.measurementService
      .getMeasurementOfApplication(this.applicationId!)
      .subscribe((responseFromAPI: MeasurementOverviewData[]) => {
        responseFromAPI.forEach((data) => this.enrichMeasurementData(data));
      });
  }

  private enrichMeasurementData(data: MeasurementOverviewData): void {
    const state = this.resolveState(data.measurementState);
    const { status, icon, tooltip } = getStatusInfo(state);

    data.state = status;
    data.icon = icon;
    data.tooltip = tooltip;

    if (data.id === this.measurementId) {
      this.setSelectedMeasurementData(data);
    }
  }

  private resolveState(measurementState: string): MeasurementState {
    if (
      Object.values(MeasurementState).includes(
        measurementState as MeasurementState,
      )
    ) {
      return measurementState as MeasurementState;
    }

    const resolved =
      MeasurementState[measurementState as keyof typeof MeasurementState];
    return resolved ?? MeasurementState.Unknown; // Fallback to a safe enum value
  }

  getStatusHeading(): string {
    switch (this.stateDisplay.toUpperCase()) {
      case MeasurementState.FAILED:
        return 'Your Measurement failed!';
      case MeasurementState.ABORTED:
        return 'Your Measurement was aborted manually!';
      default:
        return 'Your Measurement is currently running';
    }
  }

  getStatusDescription(): string[] {
    switch (this.stateDisplay.toUpperCase()) {
      case MeasurementState.FAILED:
        return [
          'Something went wrong during the measurement process, and no results could be generated. This measurement will not be included in Eco.Insights. \n' +
            'You can try again or check the logs for more details.',
        ];
      case MeasurementState.ABORTED:
        return [
          'This measurement was manually aborted and did not complete. No results were generated, and this measurement will not be included in Eco:Insights.',
        ];
      default:
        return [
          'The duration depends on the scope of the measurement and may take some time. Once completed, you will be notified, and the results will be displayed here.',
          'The progress indicator below shows the current status of the measurement. To see the latest status, please refresh the page manually, as the progress does not update automatically to reduce data traffic.',
        ];
    }
  }

  getStatusIcon(): string {
    switch (this.stateDisplay.toUpperCase()) {
      case MeasurementState.FAILED:
        return 'release_alert';
      case MeasurementState.ABORTED:
        return 'release_alert';
      default:
        return 'hourglass_empty';
    }
  }

  private setSelectedMeasurementData(data: MeasurementOverviewData): void {
    this.name = data.name ?? '';
    this.measurementState = Object.values(MeasurementState).includes(
      data.measurementState,
    )
      ? data.measurementState
      : MeasurementState[
          data.measurementState as keyof typeof MeasurementState
        ] || data.measurementState;
    this.lastUpdated = this.date.transform(data.lastUpdated, DATE_FORMAT) ?? '';
    this.statusClass = data.state ?? '';
    this.icon = data.icon ?? '';
    this.tooltip = data.tooltip ?? '';
    this.stateDisplay = this.measurementState.toLowerCase();
    this.detailedMeasurementState = data.measurementState;
  }

  downloadCsvFile(): void {
    const measurementId = this.route.snapshot.paramMap.get('measurementId');
    if (!measurementId) {
      this.snackbar.show('Measurement ID is missing.', SnackbarTypeEnum.ERROR);
      return;
    }

    if (this.measurementState !== 'completed') {
      this.snackbar.show(
        'Measurement is not completed yet.',
        SnackbarTypeEnum.ERROR,
      );
    } else {
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
  }

  protected readonly MeasurementState = MeasurementState;
}
