import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ApplicationData,
  ApplicationsTableData,
  DashboardApplicationTableData,
  EcoData,
  EcoInsightData,
  UpdateApplicationBody,
} from '@models/applications';
import { environment } from '@environment';
import { MeasuredApplication } from '@models/measurement';
import { DashboardChart, TotalDashboardValues } from '@models/dashboard';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly baseUrl = `${environment.baseUrl}/applications`;
  constructor(private httpClient: HttpClient) {}

  public getDashboardChart(): Observable<DashboardChart[]> {
    return this.httpClient.get<DashboardChart[]>(
      `${this.baseUrl}/dashboardChart`,
    );
  }

  public getApplicationsForDashboard(): Observable<
    DashboardApplicationTableData[]
  > {
    return this.httpClient.get<DashboardApplicationTableData[]>(
      `${this.baseUrl}/dashboardApplicationList`,
    );
  }

  public getApplicationById(
    applicationId: string,
  ): Observable<MeasuredApplication> {
    return this.httpClient.get<MeasuredApplication>(
      `${this.baseUrl}/${applicationId}`,
    );
  }

  public addApplications(
    applicationName: string,
    description: string,
  ): Observable<ApplicationData> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      applicationName: applicationName,
      description,
    };
    return this.httpClient.post<ApplicationData>(`${this.baseUrl}`, body, {
      headers,
    });
  }

  public getEcoIndicators(): Observable<EcoData> {
    return this.httpClient.get<EcoData>(
      `${this.baseUrl}/dashboardEnvironmentAmounts`,
    );
  }

  public getAllApplicationsList(): Observable<ApplicationsTableData[]> {
    return this.httpClient.get<ApplicationsTableData[]>(
      `${this.baseUrl}/allApplicationsList`,
    );
  }

  public getMonthlyEcoInsight(): Observable<EcoInsightData[]> {
    return this.httpClient.get<EcoInsightData[]>(`${this.baseUrl}/ecoInsights`);
  }

  public updateApplication(
    applicationId: string,
    body: UpdateApplicationBody,
  ): Observable<ApplicationData> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.put<ApplicationData>(
      `${this.baseUrl}/${applicationId}`,
      body,
      { headers },
    );
  }

  public getTotalDashboardValues(): Observable<TotalDashboardValues> {
    return this.httpClient.get<TotalDashboardValues>(
      `${this.baseUrl}/totalDashboardValues`,
    );
  }

  public deleteApplication(applicationId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${applicationId}`);
  }
}
