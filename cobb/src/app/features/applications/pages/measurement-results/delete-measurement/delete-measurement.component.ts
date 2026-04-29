import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { MeasurementService } from '@services/measurement.service';
import { SnackbarService } from '@services/snackbar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-measurement',
  standalone: true,
  imports: [MatButton, MatDialogActions, MatDialogClose, MatIcon],
  templateUrl: './delete-measurement.component.html',
  styleUrl: './delete-measurement.component.scss',
})
export class DeleteMeasurementComponent {
  constructor(
    readonly measurementService: MeasurementService,
    readonly snackbar: SnackbarService,
    readonly router: Router,
    public dialogRef: MatDialogRef<DeleteMeasurementComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      measurementId: string;
      applicationId: string;
      contextId: string;
    },
  ) {}

  onSubmit() {
    this.measurementService
      .deleteMeasurement(this.data.measurementId)
      .subscribe({
        next: () => {
          this.snackbar.show(
            'Measurement deleted successfully.',
            SnackbarTypeEnum.SUCCESS,
          );
          this.router.navigate([
            '/applications',
            this.data.applicationId,
            'context',
            this.data.contextId,
          ]);
          this.dialogRef.close(true);
        },
      });
  }
}
