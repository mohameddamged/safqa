import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { ResultPanel } from '../../../../shared/components/result-panel/result-panel';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * "Password Changed" success screen. The frame's CTA says "Login", which
 * implies the backend invalidates the session on password change - to be
 * safe (and since there's no server-side session invalidation visible in
 * AuthService.ChangePasswordAsync), this explicitly logs the user out
 * locally before sending them back to the login screen, matching the
 * frame's intent rather than leaving a stale token active.
 */
@Component({
  selector: 'app-change-password-success',
  standalone: true,
  imports: [CommonModule, AuthShell, ResultPanel, PrimaryButton],
  templateUrl: './change-password-success.html',
  styleUrl: './change-password-success.css',
})
export class ChangePasswordSuccess {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  goToLogin(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
