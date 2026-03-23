import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { SnackbarService } from '@services/snackbar.service';
import { FileDataService } from '@services/file-data.service';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';

@Component({
  selector: 'app-upload-artifacts',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSelectModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './upload-artifacts.component.html',
  styleUrl: './upload-artifacts.component.scss',
})
export class UploadArtifactsComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;
  @Output() fileUploaded = new EventEmitter<void>();

  uploadArtifactsForm: FormGroup;

  isDragOver = false;
  fileName: string | null = null;
  selectedFile: File | null = null;
  fileTypeError = false;
  contextId: string;

  constructor(
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private fileDataService: FileDataService,
    @Inject(MAT_DIALOG_DATA) public data: { contextId: string },
  ) {
    this.uploadArtifactsForm = this.fb.group({
      artifactType: [{ value: 'applicationVariant', disabled: true }],
      artifactName: [''],
      description: [''],
    });
    this.contextId = data.contextId;
  }

  onDrag(event: DragEvent, isOver: boolean): void {
    event.preventDefault();
    this.isDragOver = isOver;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    this.processFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileName = null;
    this.fileTypeError = false;
    this.fileInputRef.nativeElement.value = '';
  }

  private processFile(file: File | null | undefined): void {
    const isZip = file?.name.toLowerCase().endsWith('.zip') ?? false;

    this.fileTypeError = !isZip;
    this.selectedFile = isZip ? file! : null;
    this.fileName = isZip ? file!.name : null;
  }

  onSubmit(): void {
    if (!this.selectedFile) return;

    const meta = {
      contextId: this.contextId,
      artefactType: 'APPLICATION_VARIANT',
      defaultFile: false,
      customFileName: this.uploadArtifactsForm.value.artifactName || null,
      description: this.uploadArtifactsForm.value.description || '',
    };

    const formData = new FormData();
    formData.append('artefact', this.selectedFile);
    formData.append(
      'meta',
      new Blob([JSON.stringify(meta)], { type: 'application/json' }),
    );

    this.fileDataService
      .uploadFileToApplication(this.contextId, formData)
      .subscribe({
        next: () => {
          let fileName =
            this.uploadArtifactsForm.value.artifactName || this.fileName;

          const message = `${fileName} uploaded successfully. It is now available for use.`;
          this.snackbar.show(message, SnackbarTypeEnum.SUCCESS);
          this.removeFile();
          this.fileUploaded.emit();
        },
        error: (err) => {
          this.snackbar.show('Failed to upload file.', SnackbarTypeEnum.ERROR);
          console.error('Upload error:', err);
        },
      });
  }
}
