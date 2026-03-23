import { AllApplicationsComponent } from '@features/applications/pages/all-applications.component';
import { ApplicationDetailsComponent } from '@features/applications/pages/application-details/application-details.component';
import { BreadcrumbApplicationIdResolve } from '@features/applications/breadcrumb-application-id.resolve';
import { Routes } from '@angular/router';
import { MeasurementResultsComponent } from './pages/measurement-results/measurement-results.component';
import { BreadcrumbMeasurementIdResolve } from './breadcrumb-measurement-id.resolve';
import { AuthGuard } from '@core/auth/auth.guard';
import { ApplicationContextDetailsComponent } from '@features/applications/pages/application-context-details/application-context-details.component';
import { BreadcrumbContextIdResolve } from '@features/applications/breadcrumb-context-id.resolve';
import { ArtefactDetailsComponent } from '@features/applications/pages/artefact-details/artefact-details.component';
import { BreadcrumbArtefactIdResolve } from '@features/applications/breadcrumb-artefact-id.resolve';

export const applicationRoutes: Routes = [
  {
    path: '',
    component: AllApplicationsComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: { skip: true } },
  },
  {
    path: ':applicationId',
    canActivate: [AuthGuard],
    resolve: {
      breadcrumb: BreadcrumbApplicationIdResolve,
    },
    children: [
      {
        path: '',
        component: ApplicationDetailsComponent,
        canActivate: [AuthGuard],
        data: { breadcrumb: { skip: true } },
      },
      {
        path: 'context/:contextId',
        canActivate: [AuthGuard],
        resolve: {
          breadcrumb: BreadcrumbContextIdResolve,
        },
        children: [
          {
            path: '',
            component: ApplicationContextDetailsComponent,
            canActivate: [AuthGuard],
            data: { breadcrumb: { skip: true } },
          },
          {
            path: 'artefact/:artefactId',
            component: ArtefactDetailsComponent,
            canActivate: [AuthGuard],
            resolve: {
              breadcrumb: BreadcrumbArtefactIdResolve,
            },
          },
          {
            path: 'measurements/measurementResults/:measurementId',
            component: MeasurementResultsComponent,
            canActivate: [AuthGuard],
            resolve: {
              breadcrumb: BreadcrumbMeasurementIdResolve,
            },
          },
        ],
      },
    ],
  },
];
