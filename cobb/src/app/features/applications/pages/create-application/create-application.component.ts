import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { Router } from '@angular/router';
import { VersionService } from '@services/version.service';
import { SnackbarService } from '@services/snackbar.service';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';

@Component({
  selector: 'app-create-application',
  standalone: true,
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIcon,
    FormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateApplicationComponent {
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;
  applicationForm: FormGroup;
  applicationId?: number;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateApplicationComponent>,
    private applicationsService: ApplicationsService,
    private router: Router,
    private snackbar: SnackbarService,
  ) {
    this.applicationForm = this.fb.group({
      appName: ['', [Validators.required]],
      description: [''],
    });
  }

  isFormValid(): boolean {
    return this.applicationForm.get('appName')?.valid ?? false;
  }

  createAppInfo() {
    const applicationName = this.applicationForm.get('appName')?.value;
    const description = this.applicationForm.get('description')?.value;

    this.applicationsService
      .addApplications(applicationName, description)
      .subscribe({
        next: (response) => {
          this.snackbar.show(
            'Application created successfully!',
            SnackbarTypeEnum.SUCCESS,
          );
          this.router.navigate(['/applications', response]);
          this.dialogRef.close();
        },
        complete: () => console.log('Application creation process completed.'),
      });
  }

  onSubmit() {
    this.createAppInfo();
  }
}
