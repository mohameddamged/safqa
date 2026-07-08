import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models';

/**
 * Placeholder landing page after a successful login - this module's scope
 * is the Authentication flow only, so the real dashboard is out of scope.
 * Exists so authGuard / role-based redirects after login have somewhere
 * real to land, and so reviewers can see the authenticated user's data
 * (from the JWT-derived UserData) rendering correctly end-to-end.
 *
 * "Manage Invitations" is shown only for CompanyAdmin, mirroring the
 * backend's [Authorize(Roles = Roles.CompanyAdmin)] on every
 * InvitationsController action except validate/complete-registration -
 * this button is the only entry point into /company/invitations from the
 * UI, since no design frame for it exists outside this placeholder.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly isCompanyAdmin = () => this.user()?.role === Role.CompanyAdmin;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  goToChangePassword(): void {
    this.router.navigate(['/account/change-password']);
  }

  goToInvitations(): void {
    this.router.navigate(['/company/invitations']);
  }
}
