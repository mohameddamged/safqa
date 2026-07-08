import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { ApiResult } from '../models';

/**
 * Endpoints excluded from the 401-refresh dance: hitting 401 on the login
 * screen itself, or on the refresh call, must surface as a normal error
 * instead of triggering an infinite refresh loop.
 */
const REFRESH_EXEMPT_PATHS = ['Auth/login', 'Auth/refreshToken'];

// Module-level (singleton-equivalent) state so concurrent 401s from several
// simultaneous requests all wait on the *same* in-flight refresh call
// instead of each firing their own.
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

/**
 * Centralizes HTTP error handling for every request in the app:
 *  - 401 on a protected endpoint -> attempt a silent refresh, then retry the
 *    original request once with the new token. If the refresh itself fails,
 *    the session is cleared and the user is redirected to /auth/login.
 *  - Network-level errors (status 0) and 5xx -> generic toast, since the
 *    ExceptionHandlingMiddleware on the backend already returns a GeneralResult
 *    body for unhandled exceptions, but a true network drop returns nothing.
 *  - Everything else is passed through unchanged so the calling component's
 *    own subscribe/catchError can read the typed ApiResult body (field
 *    errors, validation messages, etc.) and render them inline.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      // Network failure: no response reached the server at all.
      if (error.status === 0) {
        toast.error('Unable to reach the server. Check your connection and try again.');
        return throwError(() => error);
      }

      const isRefreshExempt = REFRESH_EXEMPT_PATHS.some((path) => req.url.includes(path));

      if (error.status === 401 && !isRefreshExempt) {
        return handleUnauthorized(req, next, authService, router);
      }

      if (error.status >= 500) {
        const body = error.error as ApiResult | undefined;
        toast.error(body?.message ?? 'Something went wrong. Please try again later.');
      }

      return throwError(() => error);
    }),
  );
};

function handleUnauthorized(
  req: Parameters<HttpInterceptorFn>[0],
  next: Parameters<HttpInterceptorFn>[1],
  authService: AuthService,
  router: Router,
) {
  const refreshToken = authService.getRefreshToken();

  if (!refreshToken) {
    authService.logout();
    router.navigate(['/auth/login']);
    return throwError(() => new Error('Session expired.'));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshedToken$.next(null);

    return authService.refreshToken(refreshToken).pipe(
      switchMap((result) => {
        isRefreshing = false;
        const newToken = result.data?.accessToken ?? null;
        refreshedToken$.next(newToken);

        if (!newToken) {
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => new Error('Session refresh failed.'));
        }

        return next(cloneWithToken(req, newToken));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/auth/login']);
        return throwError(() => refreshError);
      }),
    );
  }

  // A refresh triggered by another request is already in flight - wait for
  // it to complete, then retry this request with whatever token it produced.
  return refreshedToken$.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => next(cloneWithToken(req, token as string))),
  );
}

function cloneWithToken(req: Parameters<HttpInterceptorFn>[0], token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
