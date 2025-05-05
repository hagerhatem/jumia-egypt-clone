// src/app/interceptors/token.interceptor.ts

import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

// State variables for token refresh
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Skip adding token for auth endpoints (except refresh token)
  if (isAuthRequest(req.url) && !isRefreshTokenRequest(req.url)) {
    return next(req);
  }

  // Add token to request if available
  const currentUser = authService.currentUserValue;
  if (currentUser?.token) {
    const authReq = addToken(req, currentUser.token);
    return next(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return handle401Error(authReq, next, authService);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

function isAuthRequest(url: string): boolean {
  return (
    url.includes('/api/Auth/login') ||
    url.includes('/api/Auth/register') ||
    url.includes('/api/Auth/register-seller')
  );
}

function isRefreshTokenRequest(url: string): boolean {
  return url.includes('/api/Auth/refresh-token');
}

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  request: HttpRequest<any>, 
  next: HttpHandlerFn, 
  authService: AuthService
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(response => {
        isRefreshing = false;
        refreshTokenSubject.next(response.data.token);
        
        // Retry the original request with the new token
        return next(addToken(request, response.data.token));
      }),
      catchError(error => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  }

  // Wait until the token refreshing is completed
  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(addToken(request, token as string)))
  );
}