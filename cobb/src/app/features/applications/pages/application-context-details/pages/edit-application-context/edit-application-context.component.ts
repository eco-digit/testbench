import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
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
import { EditContextDto } from '@models/context';

@Component({
  selector: 'app-edit-application-context',
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
  templateUrl: './edit-application-context.component.html',
  styleUrl: './edit-application-context.component.scss',
})
export class EditApplicationContextComponent {
  constructor(
    readonly fb: FormBuilder,
    readonly dialogRef: MatDialogRef<EditContextDto>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<EditContextDto>,
  ) {}

  form = this.fb.nonNullable.group({
    contextName: [this.data?.contextName, Validators.required],
    description: [this.data?.description ?? ''],
  });

  hasAppNameRequiredError() {
    return this.form.get('contextName')?.hasError('required');
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}
