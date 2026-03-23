import {
  Component,
  EventEmitter,
  Inject,
  Output,
  ViewChild,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import {
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GitRepoService } from '@services/git-repo-service';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { SnackbarService } from '@services/snackbar.service';
import { ActivatedRoute } from '@angular/router';
import { CreateGitRepoDto } from '@models/gitrepo';

@Component({
  selector: 'app-add-git-repository',
  standalone: true,
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
  ],
  templateUrl: './add-git-repository.component.html',
  styleUrl: './add-git-repository.component.scss',
})
export class AddGitRepositoryComponent {
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;
  @Output() gitUploaded = new EventEmitter<void>();

  gitForm: FormGroup;
  accessTypeControl = new FormControl('', Validators.required);
  repositoryUrlControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^https?:\/\/[^\s/$.?#].[^\s]*$/),
  ]);
  accessTokenControl = new FormControl('', Validators.required);
  usernameControl = new FormControl('', Validators.required);
  contextId: string | null = null;

  accessOptions = [
    { value: 'Public Repository', label: 'PUBLIC_REPOSITORY' },
    { value: 'Repository Access Token', label: 'REPOSITORY_ACCESS_TOKEN' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddGitRepositoryComponent>,
    private gitRepoService: GitRepoService,
    private route: ActivatedRoute,
    private snackbar: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: { contextId: string },
  ) {
    this.gitForm = this.fb.group({
      gitName: ['', [Validators.required]],
      repositoryUrl: this.repositoryUrlControl,
      accessType: this.accessTypeControl,
      accessToken: this.accessTokenControl,
      username: this.usernameControl,
    });
    this.contextId = data.contextId;
  }

  isFormValid(): boolean {
    if (!this.gitForm.get('gitName')?.valid) return false;

    const accessType = this.gitForm.get('accessType')?.value;
    if (!accessType || !this.repositoryUrlControl.valid) return false;

    // Public Repository requires only repository URL
    if (accessType === 'PUBLIC_REPOSITORY') return true;

    //Access Token requires accessToken
    if (accessType === 'REPOSITORY_ACCESS_TOKEN') {
      return !!this.accessTokenControl.value;
    }

    return false;
  }

  connectGitRepository() {
    const contextId = this.contextId;
    const gitRepoName = this.gitForm.get('gitName')?.value;
    const repositoryUrl = this.gitForm.get('repositoryUrl')?.value;
    const accessType = this.gitForm.get('accessType')?.value;
    const accessToken = this.gitForm.get('accessToken')?.value;

    const gitRepoDto: CreateGitRepoDto = {
      contextId: contextId,
      repositoryName: gitRepoName,
      repositoryLink: repositoryUrl,
      accessType: accessType,
      accessToken: accessToken,
      creationDate: new Date(),
    };

    this.gitRepoService.connectGitRepository(gitRepoDto).subscribe({
      next: () => {
        this.snackbar.show(
          'Git Repository connected successfully!',
          SnackbarTypeEnum.SUCCESS,
        );
        this.gitUploaded.emit();
        this.dialogRef.close();
      },
      complete: () => console.log('Git Repository creation process completed.'),
    });
  }

  onSubmit() {
    this.connectGitRepository();
  }
}
