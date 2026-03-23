import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = `${environment.baseUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(): void {
    window.location.href = `${this.authUrl}/login`;
  }

  logout(): void {
    window.location.href = `${this.authUrl}/logout`;
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get<{ status: string }>(`${this.authUrl}/user`).pipe(
      map((response) => response.status === 'authenticated'),
      catchError((error) => {
        console.warn('Problem with authorization:', error);
        return of(false);
      }),
    );
  }
}
