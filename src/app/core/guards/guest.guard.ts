import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { ROLE_HOME_ROUTE, RoleName } from '../models';

/**
 * Opposite of authGuard: keeps an already-logged-in user away from
 * guest-only pages (login, sign-up, forgot-password). Without this, a
 * signed-in user who navigates back to /auth/login would see the login
 * form again instead of being bounced to their dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  const user = tokenStorage.getUser();
  if (!tokenStorage.hasSession() || !user) {
    return true;
  }

  const homeRoute = ROLE_HOME_ROUTE[user.role as RoleName] ?? '/dashboard';
  return router.createUrlTree([homeRoute]);
};
