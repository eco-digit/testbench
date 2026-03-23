import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BreadcrumbData } from '@models/misc';
import { ArtefactsService } from '@features/applications/services/artefact.service';

@Injectable()
export class BreadcrumbArtefactIdResolve implements Resolve<BreadcrumbData> {
  readonly artefactsService = inject(ArtefactsService);

  resolve(route: ActivatedRouteSnapshot): Observable<BreadcrumbData> {
    const artefactId = route.params['artefactId'];
    return this.artefactsService.getArtefactById(artefactId).pipe(
      map((p) => {
        if (!p.id) {
          throw new Error('Artefact data is missing necessary fields');
        }
        return {
          label: p.originalFileName || 'Unknown Artefact',
          link: `/artefact/${p.id}`,
        };
      }),
    );
  }
}
