import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';
import { isJwtExpired } from '../utils/jwt.util';

/**
 * Protects routes that require an authenticated session.
 *
 * Checks both "is there a token" and "is it actually unexpired" - a stale
 * token left in storage after the access window passed (Jwt:ExpirationInMinutes
 * = 180, see appsettings.json) should not let someone past the guard only to
 * have every subsequent API call fail with 401. If the token is expired,
 * the ErrorInterceptor's refresh flow will still get a chance to run on the
 * first real API call made by the destination page, but we don't block
 * navigation here on a network round trip - that would make every guarded
 * route feel slow. We only hard-redirect when there is no session at all.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = tokenStorage.getAccessToken();

  if (!token) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (isJwtExpired(token) && !tokenStorage.getRefreshToken()) {
    authService.logout();
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return true;
};
