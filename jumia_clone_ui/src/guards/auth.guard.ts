// src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated() && !authService.isTokenExpired()) {
    return true;
  }
  
  // Store the attempted URL for redirecting after login
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};