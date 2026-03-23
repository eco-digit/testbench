import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { CreateApplicationContextComponent } from '@features/applications/pages/application-details/pages/create-application-context/create-application-context.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-application-context',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatIcon,
    ReactiveFormsModule,
  ],
  templateUrl: './delete-application-context.component.html',
  styleUrl: './delete-application-context.component.scss',
})
export class DeleteApplicationContextComponent {
  applicationId?: string;
  constructor(
    readonly contextService: ContextService,
    readonly snackbar: SnackbarService,
    readonly router: Router,
    public dialogRef: MatDialogRef<CreateApplicationContextComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      applicationId: string;
      contextId: string;
    },
  ) {}

  onSubmit() {
    const applicationId = this.data.applicationId;
    this.contextService.deleteContext(this.data.contextId).subscribe({
      next: () => {
        this.snackbar.show(
          'Context deleted successfully.',
          SnackbarTypeEnum.SUCCESS,
        );
        this.router.navigate(['/applications', applicationId]);
        this.dialogRef.close(true);
      },
    });
  }
}
