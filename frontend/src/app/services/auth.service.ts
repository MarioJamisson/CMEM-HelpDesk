import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, of, catchError, switchMap } from 'rxjs';
import { Router } from '@angular/router';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  public user$ = this.userSubject.asObservable();

  private get apiUrl() {
    const host = window.location.hostname;
    
    // 1. Check if running on localhost or local network IP
    if (
      host === 'localhost' || 
      host === '127.0.0.1' || 
      host.startsWith('192.168.') || 
      host.startsWith('10.') || 
      host.startsWith('172.')
    ) {
      return `http://${host}:8000/api`;
    }
    
    // 2. Check for runtime configuration from config.json
    const windowConfig = (window as any).appConfig;
    if (windowConfig && windowConfig.apiUrl) {
      return windowConfig.apiUrl;
    }

    // 3. Fallback for custom overrides
    const customApiUrl = localStorage.getItem('API_URL');
    if (customApiUrl) {
      return customApiUrl;
    }
    
    // 4. Default fallback URL (useful as placeholder)
    return 'https://seu-backend.onrender.com/api';
  }

  constructor(private http: HttpClient, private router: Router) {
    // Tenta carregar informações do usuário se houver token
    if (this.isAuthenticated()) {
      this.fetchCurrentUser().subscribe({
        error: () => this.logout() // Se falhar ao carregar perfil (ex: token expirado), faz logout
      });
    }
  }

  login(email: string, password: string): Observable<UserProfile> {
    return this.http.post<any>(`${this.apiUrl}/token/`, { username: email, password }).pipe(
      tap(response => {
        if (response.access) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
        }
      }),
      switchMap(() => this.fetchCurrentUser())
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/register/`, userData);
  }

  fetchCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/me/`).pipe(
      tap(user => {
        this.userSubject.next(user);
      })
    );
  }

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/users/`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}/`);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUserValue();
    return !!(user && (user.is_staff || user.is_superuser));
  }


  getCurrentUserValue(): UserProfile | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
