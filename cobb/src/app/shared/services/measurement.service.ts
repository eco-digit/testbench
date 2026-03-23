import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment';
import {
  CreateMeasurementData,
  DashboardStatistics,
  MeasurementArtefactDto,
  MeasurementContextDto,
  MeasurementData,
  MeasurementOverviewData,
  MeasurementResults,
  MeasurementStatusUpdate,
  UiMeasurementDetailRow,
  UiMeasurementTotals,
} from '@models/measurement';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class MeasurementService {
  private baseUrl = `${environment.baseUrl}/measurements`;

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
  ) {}

  createAndStartMeasurement(
    measurementData: CreateMeasurementData,
  ): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/createAndStart`,
      measurementData,
    );
  }

  stopMeasurement(measurementId: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/stopMeasurement/${measurementId}`,
      {},
    );
  }

  getMeasurementOfApplication(
    applicationId: string | undefined,
  ): Observable<MeasurementOverviewData[]> {
    return this.http.get<MeasurementOverviewData[]>(
      `${this.baseUrl}/ofApplication/${applicationId}`,
    );
  }

  getMeasurementsOfContext(
    contextId: string | null,
  ): Observable<MeasurementContextDto[]> {
    return this.http.get<MeasurementContextDto[]>(
      `${this.baseUrl}/ofContext/${contextId}`,
    );
  }

  getMeasurementsOfArtefact(
    artefactId: string | null,
  ): Observable<MeasurementArtefactDto[]> {
    return this.http.get<MeasurementArtefactDto[]>(
      `${this.baseUrl}/ofArtefact/${artefactId}`,
    );
  }

  getLastMeasurement(): Observable<MeasurementData> {
    return this.http.get<MeasurementData>(`${this.baseUrl}/last`);
  }

  getOverviewCounts(applicationId: string): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatistics>(
      `${this.baseUrl}/counts/${applicationId}`,
    );
  }

  getTotals(measurementId: string): Observable<UiMeasurementTotals> {
    return this.http
      .get<MeasurementResults>(
        `${this.baseUrl}/measurementResults/${measurementId}`,
      )
      .pipe(
        map((res) => ({
          totalGlobalWarmingPotential: res.totalGwp,
          totalWasteElectricalAndElectronicEquipment: res.totalWeee,
          totalCumulativeEnergyDemand: res.totalCed,
          totalWaterConsumption: res.totalWater,
          totalAbioticDepletionPotential: res.totalAdp,
          totalEcoToxity: res.totalTox,
        })),
      );
  }

  getPerPhase(measurementId: string): Observable<UiMeasurementDetailRow[]> {
    return this.http
      .get<MeasurementResults>(
        `${this.baseUrl}/measurementResults/${measurementId}`,
      )
      .pipe(
        map((res) =>
          res.states.map((res) => ({
            phase: res.state.toLowerCase(),
            totalGlobalWarmingPotential: res.gwp,
            totalWasteElectricalAndElectronicEquipment: res.weee,
            totalCumulativeEnergyDemand: res.ced,
            totalWaterConsumption: res.water,
            totalAbioticDepletionPotential: res.adp,
            totalEcoToxity: res.tox,
          })),
        ),
      );
  }

  getEcoDigitScores(measurementId: string): Observable<number[]> {
    return this.http
      .get<MeasurementResults>(
        `${this.baseUrl}/measurementResults/${measurementId}`,
      )
      .pipe(map((res) => res.states.map((s) => s.ecoDigitScore ?? 0)));
  }

  listenToMeasurementUpdates(): Observable<MeasurementStatusUpdate> {
    return new Observable((observer) => {
      let eventSource: EventSource;
      let retryTimeout: any;

      const connect = () => {
        eventSource = new EventSource(
          `${environment.baseUrl}/measurementStatus/stream`,
        );

        eventSource.addEventListener(
          'measurement-status-update',
          (event: MessageEvent) => {
            this.ngZone.run(() => {
              const data: MeasurementStatusUpdate = JSON.parse(event.data);
              observer.next(data);
            });
          },
        );

        eventSource.onerror = (error) => {
          this.ngZone.run(() => {
            console.warn(
              'SSE connection lost. Reconnecting in 5 seconds...',
              error,
            );
            eventSource.close();

            retryTimeout = setTimeout(() => connect(), 5000);
          });
        };
      };

      connect();

      return () => {
        if (eventSource) {
          eventSource.close();
        }
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
      };
    });
  }
}
