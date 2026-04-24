import { Injectable } from '@angular/core';
import { ArtefactsOverviewDto } from '@models/artefacts';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environment';

@Injectable({ providedIn: 'root' })
export class ArtefactsService {
  private readonly baseUrl = `${environment.baseUrl}/artefacts`;
  constructor(private http: HttpClient) {}

  public getArtefacts(
    contextId: string,
    artefactType?: string,
  ): Observable<ArtefactsOverviewDto[]> {
    let params = new HttpParams().set('contextId', contextId);

    if (artefactType) {
      params = params.set('artefactType', artefactType);
    }

    return this.http.get<ArtefactsOverviewDto[]>(this.baseUrl, { params });
  }

  public getArtefactById(artefactId: string): Observable<ArtefactsOverviewDto> {
    return this.http.get<ArtefactsOverviewDto>(`${this.baseUrl}/${artefactId}`);
  }

  deleteArtefacts(artefactId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${artefactId}`);
  }
}
