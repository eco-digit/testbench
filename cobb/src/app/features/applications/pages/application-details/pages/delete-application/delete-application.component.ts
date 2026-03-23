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
import { ContextService } from '@features/applications/services/context.service';
import { SnackbarService } from '@services/snackbar.service';
import { Router } from '@angular/router';
import { CreateApplicationContextComponent } from '@features/applications/pages/application-details/pages/create-application-context/create-application-context.component';
import { ApplicationsService } from '@features/applications/services/applications.service';

@Component({
  selector: 'app-delete-application',
  standalone: true,
  imports: [MatButton, MatDialogActions, MatDialogClose, MatIcon],
  templateUrl: './delete-application.component.html',
  styleUrl: './delete-application.component.scss',
})
export class DeleteApplicationComponent {
  applicationId?: string;
  constructor(
    readonly contextService: ContextService,
    readonly applicationService: ApplicationsService,
    readonly snackbar: SnackbarService,
    readonly router: Router,
    public dialogRef: MatDialogRef<CreateApplicationContextComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      applicationId: string;
    },
  ) {}
  onSubmit() {
    const applicationId = this.data.applicationId;
    this.applicationService.deleteApplication(applicationId).subscribe({
      next: () => {
        this.snackbar.show(
          'Application deleted successfully.',
          SnackbarTypeEnum.SUCCESS,
        );
        this.router.navigate(['/applications']);
        this.dialogRef.close(true);
      },
    });
  }
}
