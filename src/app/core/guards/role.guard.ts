import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { RoleName } from '../models';

/**
 * Factory producing a CanActivateFn scoped to specific roles, for use on
 * routes nested under an already authGuard-protected parent, e.g.:
 *
 *   {
 *     path: 'admin',
 *     canActivate: [authGuard, roleGuard([Role.SystemAdmin])],
 *     loadChildren: () => ...
 *   }
 *
 * Returns a UrlTree redirect to '/unauthorized' rather than throwing, so it
 * composes cleanly with authGuard in the same canActivate array - Angular
 * evaluates guards in order and short-circuits on the first non-true result.
 */
export function roleGuard(allowedRoles: RoleName[]): CanActivateFn {
  return () => {
    const tokenStorage = inject(TokenStorageService);
    const router = inject(Router);

    const user = tokenStorage.getUser();
    if (!user) {
      return router.createUrlTree(['/auth/login']);
    }

    if (!allowedRoles.includes(user.role as RoleName)) {
      return router.createUrlTree(['/unauthorized']);
    }

    return true;
  };
}
