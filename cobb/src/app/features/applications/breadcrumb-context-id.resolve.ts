import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BreadcrumbData } from '@models/misc';
import { ContextService } from '@features/applications/services/context.service';

@Injectable()
export class BreadcrumbContextIdResolve implements Resolve<BreadcrumbData> {
  readonly applicationContextService = inject(ContextService);

  resolve(route: ActivatedRouteSnapshot): Observable<BreadcrumbData> {
    const contextId = route.params['contextId'];
    return this.applicationContextService.getContextById(contextId).pipe(
      map((p) => {
        if (!p.name || !p.id) {
          throw new Error('Context data is missing necessary fields');
        }
        return {
          label: p.name,
          link: `/context/${p.id}`,
        };
      }),
    );
  }
}
