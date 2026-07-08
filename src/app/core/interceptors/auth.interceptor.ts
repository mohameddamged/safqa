import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * Endpoint fragments that must NOT receive an Authorization header, even if
 * a token happens to exist in storage from a previous session. These are
 * exactly the AuthController and InvitationsController actions decorated
 * with [AllowAnonymous] rather than [Authorize].
 */
const PUBLIC_AUTH_PATHS = [
  'Auth/register-company',
  'Auth/register-vendor',
  'Auth/verify-account',
  'Auth/company/address',
  'Auth/vendor/address',
  'Auth/login',
  'Auth/forget-password',
  'Auth/verify-reset-code',
  'Auth/reset-password',
  'Auth/resend-otp-registration',
  'Auth/resend-otp-password-reset',
  'Invitations/validate',
  'Invitations/complete-registration',
];

/**
 * Attaches `Authorization: Bearer <token>` to every outgoing request except
 * the public auth endpoints above. This deliberately includes
 * `Auth/refreshToken` and `Auth/ChangePassword` and `Auth/DeleteUser`,
 * which are decorated with [Authorize] on the backend and require the
 * header even when the access token has just expired (the refresh
 * endpoint reads claims out of the expired token itself).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);

  const isPublicAuthEndpoint = PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path));
  if (isPublicAuthEndpoint) {
    return next(req);
  }

  const token = tokenStorage.getAccessToken();
  if (!token) {
    return next(req);
  }

  const authorizedReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authorizedReq);
};
