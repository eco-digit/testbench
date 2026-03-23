import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '@services/snackbar.service';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(readonly snackbarService: SnackbarService) {}

  handleError(err: Error) {
    if (err instanceof HttpErrorResponse) return;
    console.error('error handler called', err);
    const errorType = SnackbarTypeEnum.ERROR;
    const message = 'Sorry, something went wrong.';
    this.snackbarService.show(message, errorType);
  }
}
