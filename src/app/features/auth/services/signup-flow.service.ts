import { Injectable, signal } from '@angular/core';

export type SignupRole = 'company' | 'vendor';

/**
 * Holds short-lived state shared between the steps of the sign-up flow
 * (role-select -> form -> OTP verify -> address -> success), since each
 * step is its own routed page/component rather than one giant component
 * with local state. This is intentionally in-memory only (no storage
 * persistence) - refreshing mid-signup restarts the flow, which is
 * acceptable for a registration wizard and avoids leaving a half-completed
 * signup's email/password sitting in localStorage.
 *
 * `registrationToken` is populated only after verify-account succeeds
 * (AuthService.verifyAccount -> GeneralResult<RegistrationSessionResponse>)
 * and is required by the address step (PUT Auth/company/address or
 * PUT Auth/vendor/address) that follows OTP verification.
 */
@Injectable({ providedIn: 'root' })
export class SignupFlowService {
  readonly role = signal<SignupRole | null>(null);
  readonly pendingEmail = signal<string | null>(null);
  readonly organizationName = signal<string | null>(null);
  readonly registrationToken = signal<string | null>(null);

  start(role: SignupRole, email: string, organizationName: string): void {
    this.role.set(role);
    this.pendingEmail.set(email);
    this.organizationName.set(organizationName);
  }

  setRegistrationToken(token: string): void {
    this.registrationToken.set(token);
  }

  reset(): void {
    this.role.set(null);
    this.pendingEmail.set(null);
    this.organizationName.set(null);
    this.registrationToken.set(null);
  }
}
