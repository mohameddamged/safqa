import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { ResultPanel } from '../../../../shared/components/result-panel/result-panel';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';

/**
 * "Registration completed successfully" screen, shown after
 * POST Invitations/complete-registration succeeds. Unlike
 * signup-success.ts (which warns the account is Pending admin approval),
 * an invited teammate's account is created with IsVerified = true and is
 * immediately usable - so this screen sends straight to Login rather than
 * mentioning any review period.
 */
@Component({
  selector: 'app-invite-register-success',
  standalone: true,
  imports: [CommonModule, AuthShell, ResultPanel, PrimaryButton],
  templateUrl: './invite-register-success.html',
  styleUrl: './invite-register-success.css',
})
export class InviteRegisterSuccess {
  private readonly router = inject(Router);

  continue(): void {
    this.router.navigate(['/auth/login']);
  }
}
