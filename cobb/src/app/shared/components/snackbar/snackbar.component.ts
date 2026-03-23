import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss',
})
export class SnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: { message: string; type: SnackbarTypeEnum },
    private snackBarRef: MatSnackBarRef<SnackbarComponent>,
  ) {}

  protected readonly SnackbarTypeEnum = SnackbarTypeEnum;

  getIcon(): string {
    switch (this.data.type) {
      case SnackbarTypeEnum.SUCCESS:
        return 'check';
      case SnackbarTypeEnum.ERROR:
        return 'info';
      default:
        return '';
    }
  }

  close(): void {
    this.snackBarRef.dismiss();
  }
}
