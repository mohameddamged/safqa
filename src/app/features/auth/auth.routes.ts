import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

/**
 * Routes for the entire Authentication module, mounted under '/auth' in
 * app.routes.ts. Every leaf is a standalone component, lazy-loaded via
 * loadComponent so none of this bundle ships until the user actually
 * navigates into the auth flow.
 *
 * guestGuard is applied to every screen that only makes sense for a
 * signed-out visitor (login, sign-up, forgot-password) - an already
 * authenticated user hitting any of these is redirected to their role's
 * home route instead. change-password is intentionally NOT guest-guarded
 * (it requires authGuard instead, applied where this module is mounted).
 */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    canActivate: [guestGuard],
    title: 'Login | Safqa',
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup-role-select/signup-role-select').then((m) => m.SignupRoleSelect),
    canActivate: [guestGuard],
    title: 'Sign Up | Safqa',
  },
  {
    path: 'signup/company',
    loadComponent: () => import('./pages/signup-company/signup-company').then((m) => m.SignupCompany),
    canActivate: [guestGuard],
    title: 'Sign Up as Company | Safqa',
  },
  {
    path: 'signup/vendor',
    loadComponent: () => import('./pages/signup-vendor/signup-vendor').then((m) => m.SignupVendor),
    canActivate: [guestGuard],
    title: 'Sign Up as Vendor | Safqa',
  },
  {
    path: 'signup/verify',
    loadComponent: () => import('./pages/verify-account/verify-account').then((m) => m.VerifyAccount),
    canActivate: [guestGuard],
    title: 'Verify Account | Safqa',
  },
  {
    path: 'signup/address',
    loadComponent: () => import('./pages/signup-address/signup-address').then((m) => m.SignupAddress),
    canActivate: [guestGuard],
    title: 'Address | Safqa',
  },
  {
    path: 'signup/success',
    loadComponent: () => import('./pages/signup-success/signup-success').then((m) => m.SignupSuccess),
    canActivate: [guestGuard],
    title: 'Welcome to Safqa',
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
    canActivate: [guestGuard],
    title: 'Forgot Password | Safqa',
  },
  {
    path: 'forgot-password/verify',
    loadComponent: () =>
      import('./pages/verify-reset-code/verify-reset-code').then((m) => m.VerifyResetCode),
    canActivate: [guestGuard],
    title: 'Verify Code | Safqa',
  },
  {
    path: 'forgot-password/reset',
    loadComponent: () => import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
    canActivate: [guestGuard],
    title: 'Reset Password | Safqa',
  },
  {
    path: 'forgot-password/success',
    loadComponent: () => import('./pages/reset-success/reset-success').then((m) => m.ResetSuccess),
    canActivate: [guestGuard],
    title: 'Password Updated | Safqa',
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

/**
 * Separate route list for screens that require an authenticated session
 * rather than a guest one. Mounted under a *different* parent path
 * (e.g. '/account') guarded by authGuard in app.routes.ts, since mixing
 * guestGuard and authGuard children under the same '/auth' parent would
 * require per-route guard overrides that are easy to misconfigure.
 */
export const ACCOUNT_ROUTES: Routes = [
  {
    path: 'change-password',
    loadComponent: () => import('./pages/change-password/change-password').then((m) => m.ChangePassword),
    title: 'Change Password | Safqa',
  },
  {
    path: 'change-password/success',
    loadComponent: () =>
      import('./pages/change-password-success/change-password-success').then(
        (m) => m.ChangePasswordSuccess,
      ),
    title: 'Password Changed | Safqa',
  },
];
