import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SnackbarService } from '@services/snackbar.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbarService = inject(SnackbarService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message: string;
      let showSnackbar = true;

      switch (error.status) {
        case 400:
          message = 'Invalid request. Error Code: ' + error.status;
          break;
        case 401:
          message = 'Unauthorized. Please log in.  Error Code: ' + error.status;
          showSnackbar = false;
          router.navigate(['auth/login']);
          break;
        case 403:
          message = 'Access denied.  Error Code: ' + error.status;
          break;
        case 404:
          message = 'Resource not found.  Error Code: ' + error.status;
          break;
        case 409:
          message =
            'This action can’t be completed because the data already exists. Error Code: ' +
            error.status;
          break;
        case 500:
          message =
            'Internal server error. Please try again later.  Error Code: ' +
            error.status;
          break;
        default:
          message = 'Unexpected error occurred. Error Code' + error.status;
          break;
      }

      if (showSnackbar) {
        snackbarService.show(message, SnackbarTypeEnum.ERROR);
      }
      return throwError(() => error);
    }),
  );
};
