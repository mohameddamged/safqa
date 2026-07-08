import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../core/models';

/**
 * Public routes for the invited-teammate registration flow, reached from
 * the link in the invitation e-mail (no session required - mirrors the
 * controller's [AllowAnonymous] actions). Mounted at the app root in
 * app.routes.ts as '/invite-register', matching the path segment the
 * backend hardcodes into the email link
 * (`{FrontendSettings.BaseUrl}/invite-register?token={token}` in
 * InvitationService.InviteUserAsync) - this must stay in sync with that
 * literal string if either side changes it.
 */
export const INVITE_REGISTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/invite-register/invite-register').then((m) => m.InviteRegister),
    title: 'Join Your Team | Safqa',
  },
  {
    path: 'success',
    loadComponent: () =>
      import('./pages/invite-register-success/invite-register-success').then(
        (m) => m.InviteRegisterSuccess,
      ),
    title: 'Welcome to Safqa',
  },
];

/**
 * CompanyAdmin-only routes for managing a company's outgoing invitations.
 * Mounted under '/company/invitations' in app.routes.ts, guarded by both
 * authGuard (must be logged in at all) and roleGuard([Role.CompanyAdmin])
 * (must specifically be a CompanyAdmin) - mirrors
 * [Authorize(Roles = Roles.CompanyAdmin)] on InvitationsController for
 * every action except validate/complete-registration.
 */
export const INVITATIONS_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/invitations-list/invitations-list').then((m) => m.InvitationsList),
    canActivate: [roleGuard([Role.CompanyAdmin])],
    title: 'Team Invitations | Safqa',
  },
];
