import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { ResultPanel } from '../../../../shared/components/result-panel/result-panel';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';

/**
 * "Password updated" success screen, shown after a successful
 * POST /api/Auth/reset-password. No API call here - just routes to Login.
 */
@Component({
  selector: 'app-reset-success',
  standalone: true,
  imports: [CommonModule, AuthShell, ResultPanel, PrimaryButton],
  templateUrl: './reset-success.html',
  styleUrl: './reset-success.css',
})
export class ResetSuccess {
  private readonly router = inject(Router);

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
