import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ContextService } from '@features/applications/services/context.service';
import { SnackbarService } from '@services/snackbar.service';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { CreateApplicationContextForm } from '@models/context';

@Component({
  selector: 'app-create-application-context',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
  ],
  templateUrl: './create-application-context.component.html',
})
export class CreateApplicationContextComponent {
  applicationId?: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateApplicationContextComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      applicationId: string;
      appName: string;
      description?: string;
    },
    private applicationContextService: ContextService,
    private snackbar: SnackbarService,
  ) {}

  form: FormGroup<CreateApplicationContextForm> = this.fb.nonNullable.group({
    appName: [this.data?.appName ?? '', Validators.required],
    description: [this.data?.description ?? ''],
  });

  hasAppNameRequiredError() {
    return this.form.controls.appName.hasError('required');
  }

  onSubmit() {
    const applicationName = this.form.controls.appName.value;
    const description = this.form.controls.description.value;

    this.applicationContextService
      .createContext({
        name: applicationName,
        description: description,
        applicationId: this.data.applicationId,
      })
      .subscribe({
        next: () => {
          this.snackbar.show(
            'Application Context created successfully.',
            SnackbarTypeEnum.SUCCESS,
          );
          this.dialogRef.close(true);
        },
      });
  }
}
