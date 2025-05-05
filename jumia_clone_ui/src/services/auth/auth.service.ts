// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  SellerRegisterRequest,
  UserData,
  RefreshTokenRequest,
  ChangePasswordRequest
} from '../../models/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }
  
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }
  
  public get currentUserValue(): UserData | null {
    return this.currentUserSubject.value;
  }
  externalAuth(provider: string, token: string, userData: any, isNewUser: boolean): Observable<AuthResponse> {
    const externalAuthData = {
      provider: provider.toUpperCase(),
      idToken: token,
      email: userData.email,
      name: userData.name,
      photoUrl: userData.photoUrl,
      isNewUser: isNewUser
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/api/Auth/external-auth`, externalAuthData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.storeUserData(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/Auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.storeUserData(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  registerSeller(sellerData: SellerRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/Auth/register-seller`, sellerData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.storeUserData(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/Auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.storeUserData(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.currentUserValue?.refreshToken;
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    const request: RefreshTokenRequest = { refreshToken };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/Auth/refresh-token`, request)
      .pipe(
        tap(response => {
          if (response.success) {
            this.storeUserData(response.data);
          }
        }),
        catchError(error => {
          // If refresh token fails, log the user out
          this.logout();
          return this.handleError(error);
        })
      );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/Auth/change-password`, passwordData)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    // You might want to redirect to login page here
    // You would need to inject Router for this
  }

  private storeUserData(userData: UserData): void {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
   
     // Handle specific status codes
     switch (statusCode) {
      case 400:
        errorMessage = errorMessage || 'Invalid request format';
        break;
      case 401:
        errorMessage = 'Session expired. Please login again';
        break;
      case 403:
        errorMessage = 'You are not authorized for this action';
        break;
    }
     //console.error('Auth service error:', errorMessage);
     console.error(`Auth Error [${statusCode}]:`, errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue?.token;
  }

  isTokenExpired(): boolean {
    if (!this.currentUserValue?.token) {
      return true;
    }
    
    try {
      const token = this.currentUserValue.token;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      
      // Add a small buffer (e.g., 10 seconds) to prevent edge cases
      return Date.now() >= (expiry - 10000);
    } catch (e) {
      console.error('Error checking token expiry:', e);
      return true;
    }
  }

  // Helper method to get user roles
  getUserRole(): string | null {
    return this.currentUserValue?.userType || null;
  }

  // Helper method to check if user has a specific role
  hasRole(role: string): boolean {
    return this.currentUserValue?.userType === role;
  }
}