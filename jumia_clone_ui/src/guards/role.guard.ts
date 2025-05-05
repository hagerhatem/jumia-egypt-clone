// src/app/guards/role.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Check if the user is authenticated
  if (!authService.isAuthenticated() || authService.isTokenExpired()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  // Get the required role from the route data
  const requiredRole = route.data['role'] as string;
  
  // If no specific role is required, allow access
  if (!requiredRole) {
    return true;
  }
  
  // Check if the user has the required role
  const userType = authService.currentUserValue?.userType;
  
  if (userType?.toLowerCase() === requiredRole.toLowerCase()) {
    return true;
  }
  
  // Redirect to home page or unauthorized page
  router.navigate(['/unauthorized']);
  return false;
};