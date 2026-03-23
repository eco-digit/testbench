import { Component, Inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { EditApplicationData } from '@models/applications';

@Component({
  selector: 'app-edit-application',
  standalone: true,
  imports: [
    MatIcon,
    MatFormField,
    MatDialogActions,
    FormsModule,
    MatError,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatButton,
    MatDialogClose,
  ],
  templateUrl: './edit-application.component.html',
})
export class EditApplicationComponent {
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditApplicationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<EditApplicationData>,
  ) {}

  form = this.fb.nonNullable.group({
    appName: [this.data?.appName, Validators.required],
    description: [this.data?.description ?? ''],
  });

  hasAppNameRequiredError() {
    return this.form.get('appName')?.hasError('required');
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}
