import { environment } from '@environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateGitRepoDto, GitRepoDto } from '@models/gitrepo';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GitRepoService {
  private readonly baseUrl = `${environment.baseUrl}/git`;
  constructor(private http: HttpClient) {}

  getAllReposByContextId(contextId: string): Observable<GitRepoDto[]> {
    return this.http.get<GitRepoDto[]>(
      `${this.baseUrl}/getAllGitReposPerContext/${contextId}`,
    );
  }

  startMeasurementWithGitRepo(gitRepoId: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/startMeasurementWithGit/${gitRepoId}`,
      gitRepoId,
    );
  }

  deleteGitRepo(gitRepoId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${gitRepoId}`);
  }

  connectGitRepository(createGitRepoDto: CreateGitRepoDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/addGit`, createGitRepoDto);
  }
}
