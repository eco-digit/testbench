import { importProvidersFrom, ErrorHandler } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { AuthInterceptor } from '@core/auth/auth.interceptor';
import { BreadcrumbApplicationIdResolve } from '@features/applications/breadcrumb-application-id.resolve';
import { BreadcrumbContextIdResolve } from '@features/applications/breadcrumb-context-id.resolve';
import { GlobalErrorHandler } from '@core/services/global-error-handler.service';
import { httpErrorInterceptor } from '@core/interceptors/http-error.interceptor';
import { BreadcrumbArtefactIdResolve } from '@features/applications/breadcrumb-artefact-id.resolve';

export const appProviders = [
  provideHttpClient(
    withInterceptorsFromDi(),
    withInterceptors([httpErrorInterceptor]),
  ),
  importProvidersFrom(
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatTooltipModule,
  ),
  provideAnimations(),
  BreadcrumbApplicationIdResolve,
  BreadcrumbContextIdResolve,
  BreadcrumbArtefactIdResolve,
  DatePipe,
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: ErrorHandler, useClass: GlobalErrorHandler },
];
