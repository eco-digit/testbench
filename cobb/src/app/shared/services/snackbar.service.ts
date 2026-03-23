import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackbarComponent } from '@components/snackbar/snackbar.component';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  show(message: string, type?: SnackbarTypeEnum): void {
    const config: MatSnackBarConfig = {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type ? [type] : [],
      ...(type === SnackbarTypeEnum.SUCCESS && { duration: 5000 }),
    };

    this.snackBar.openFromComponent(SnackbarComponent, {
      ...config,
      data: { message, type },
    });
  }
}
