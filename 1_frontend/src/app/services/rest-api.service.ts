import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RestApiService {
  private apiURL = 'http://localhost:1234/'; // backend
  private tokenKey : string = 'authToken';

  isLoggedIn = signal(false);

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const res = this.http.post(this.apiURL + 'login', { username, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
        }
      })
    );
    console.log('Login response:', res);
    this.isLoggedIn.set(true);
    return res;
  }

  // obtener token almacenado
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // cerrar sesión
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn.set(false);
  }

  // obtener perfil protegido
  getProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return this.http.get(this.apiURL + 'profile', { headers });
  }

  getPosts(): Observable<any> {
    return this.http.get(this.apiURL + 'posts');
  }
}
