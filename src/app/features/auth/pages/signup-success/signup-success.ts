import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { ResultPanel } from '../../../../shared/components/result-panel/result-panel';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { SignupFlowService } from '../../services/signup-flow.service';

/**
 * "You have signed up successfully!" screen, shown after the address step
 * (PUT Auth/company/address or PUT Auth/vendor/address) succeeds - the
 * last step of the wizard after account details -> OTP -> address. The
 * account remains in AccountStatus.Pending until a SystemAdmin approves it
 * (see CompaniesController/VendorsController) - the message reflects that
 * explicitly, matching the frame's copy about the 7 work day review window.
 *
 * No API call on this screen; it only clears SignupFlowService state and
 * routes to Login on "Ok".
 */
@Component({
  selector: 'app-signup-success',
  standalone: true,
  imports: [CommonModule, AuthShell, ResultPanel, PrimaryButton],
  templateUrl: './signup-success.html',
  styleUrl: './signup-success.css',
})
export class SignupSuccess {
  private readonly router = inject(Router);
  private readonly signupFlow = inject(SignupFlowService);

  continue(): void {
    this.signupFlow.reset();
    this.router.navigate(['/auth/login']);
  }
}
