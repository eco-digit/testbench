import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/auth.guard';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';
import { EcoInsightsComponent } from '@features/eco-insights/eco-insights.component';

export const routes: Routes = [
  {
    path: 'applications',
    loadChildren: () =>
      import('./features/applications/application.routes').then(
        (m) => m.applicationRoutes,
      ),
    canActivate: [AuthGuard],
    data: {
      breadcrumb: {
        label: 'Applications',
      },
    },
  },
  {
    path: 'eco-insights',
    component: EcoInsightsComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: {
        label: 'Eco Insights',
      },
    },
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
