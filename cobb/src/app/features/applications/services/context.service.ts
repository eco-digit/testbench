import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { HttpClient } from '@angular/common/http';
import {
  ContextDto,
  ContextOverviewDto,
  CreateContextDto,
  EditContextDto,
} from '@models/context';
import { Observable } from 'rxjs';
import { MeasurementOverviewData } from '@models/measurement';

@Injectable({ providedIn: 'root' })
export class ContextService {
  private readonly baseUrl = `${environment.baseUrl}/context`;
  constructor(private http: HttpClient) {}

  getContexts(applicationId: string): Observable<ContextOverviewDto[]> {
    return this.http.get<ContextOverviewDto[]>(
      `${this.baseUrl}/getAllContextsPerApplication/${applicationId}`,
    );
  }

  getContextById(contextId: string | null): Observable<ContextDto> {
    return this.http.get<ContextDto>(`${this.baseUrl}/${contextId}`);
  }

  createContext(dto: CreateContextDto): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/create`, dto);
  }

  getAllMeasurementsByContext(
    contextId: string,
  ): Observable<MeasurementOverviewData[]> {
    return this.http.get<MeasurementOverviewData[]>(
      `${this.baseUrl}/getAllMeasurements/${contextId}`,
    );
  }

  deleteContext(contextId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${contextId}`);
  }

  editContext(
    contextId: string,
    dto: Partial<EditContextDto>,
  ): Observable<ContextDto> {
    return this.http.put<ContextDto>(`${this.baseUrl}/${contextId}`, dto);
  }
}
