import { Injectable, signal } from '@angular/core';

/**
 * Holds transient state across the three-step Forgot Password flow
 * (email -> OTP -> new password), mirroring SignupFlowService's role for
 * the sign-up wizard. The verified code is kept here (not re-typed on the
 * final step) because ResetPasswordRequest needs both email AND
 * verificationCode in the same call - the backend re-validates the code at
 * that point too (see AuthService.ResetPasswordAsync).
 */
@Injectable({ providedIn: 'root' })
export class PasswordResetFlowService {
  readonly email = signal<string | null>(null);
  readonly verifiedCode = signal<string | null>(null);

  setEmail(email: string): void {
    this.email.set(email);
  }

  setVerifiedCode(code: string): void {
    this.verifiedCode.set(code);
  }

  reset(): void {
    this.email.set(null);
    this.verifiedCode.set(null);
  }
}
