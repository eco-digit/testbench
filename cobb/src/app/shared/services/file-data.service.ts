import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment';
import { ApplicationFile } from '@models/files';

@Injectable({
  providedIn: 'root',
})
export class FileDataService {
  private baseUrl = `${environment.baseUrl}/artefacts`;
  private resultsUrl = `${this.baseUrl}/resultsZip`;

  constructor(private http: HttpClient) {}

  uploadFileToApplication(
    contextId: string,
    formData: FormData,
  ): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}`, formData);
  }

  getFilesByApplicationId(
    applicationId: string,
  ): Observable<ApplicationFile[]> {
    const params = new HttpParams()
      .set('applicationId', applicationId.toString())
      .set('fileType', 'APPLICATION_VARIANT');

    return this.http.get<ApplicationFile[]>(`${this.baseUrl}`, { params });
  }

  downloadCsv(measurementId: string): Observable<HttpResponse<Blob>> {
    const url = `${this.resultsUrl}/${measurementId}`;
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
