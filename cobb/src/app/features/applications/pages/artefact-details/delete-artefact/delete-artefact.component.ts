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
import { ArtefactsService } from '@features/applications/services/artefact.service';
import { SnackbarService } from '@services/snackbar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-artefact',
  standalone: true,
  imports: [MatButton, MatDialogActions, MatDialogClose, MatIcon],
  templateUrl: './delete-artefact.component.html',
  styleUrl: './delete-artefact.component.scss',
})
export class DeleteArtefactComponent {
  constructor(
    readonly artefactsService: ArtefactsService,
    readonly snackbar: SnackbarService,
    readonly router: Router,
    public dialogRef: MatDialogRef<DeleteArtefactComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      artefactId: string;
      applicationId: string;
      contextId: string;
    },
  ) {}

  onSubmit() {
    this.artefactsService.deleteArtefacts(this.data.artefactId).subscribe({
      next: () => {
        this.snackbar.show(
          'Artefact deleted successfully.',
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
