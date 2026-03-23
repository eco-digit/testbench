import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { BreadcrumbData } from '@models/misc';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MeasurementService } from '@services/measurement.service'; // adjust the path as needed
@Injectable({
  providedIn: 'root',
})
export class BreadcrumbMeasurementIdResolve
  implements Resolve<Observable<BreadcrumbData>>
{
  constructor(private measurementService: MeasurementService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<BreadcrumbData> {
    const measurementId = route.params['measurementId'];
    const applicationId = route.parent?.params['applicationId'];

    if (!measurementId || !applicationId) {
      return of({ label: 'Unknown', link: '' });
    }

    return this.measurementService
      .getMeasurementOfApplication(applicationId)
      .pipe(
        map((measurements) => {
          const found = measurements.find((m) => m.id === measurementId);
          return {
            label: found?.name ?? 'Result',
            link: measurementId,
          };
        }),
        catchError(() => of({ label: 'Result', link: measurementId })),
      );
  }
}
