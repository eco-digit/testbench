import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApplicationsService } from '@features/applications/services/applications.service';

import { BreadcrumbData } from '@models/misc';

@Injectable()
export class BreadcrumbApplicationIdResolve implements Resolve<BreadcrumbData> {
  readonly applicationsService = inject(ApplicationsService);

  resolve(route: ActivatedRouteSnapshot): Observable<BreadcrumbData> {
    const applicationId = route.params['applicationId'];
    return this.applicationsService.getApplicationById(applicationId).pipe(
      map((p) => {
        if (!p.name || !p.id) {
          throw new Error('Application data is missing necessary fields');
        }
        return {
          label: p.name,
          link: `/applications/${p.id}`,
        };
      }),
    );
  }
}
