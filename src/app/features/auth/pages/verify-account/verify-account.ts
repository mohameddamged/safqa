import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { OtpInput } from '../../../../shared/components/otp-input/otp-input';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { StepIndicator } from '../../../../shared/components/step-indicator/step-indicator';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { otpCodeValidator } from '../../../../shared/validators/auth-validators';
import { SignupFlowService } from '../../services/signup-flow.service';
import { ApiResult, ApiResultData, VerifyAccountResponseData } from '../../../../core/models';

const RESEND_COOLDOWN_SECONDS = 56;

/**
 * "Check your e-mail" screen, reused identically (per the UI frames) for
 * the sign-up flow's account verification step. Resend countdown matches
 * the "Resend Code In 56 Seconds" text from the frame.
 *
 * On success, stores the registrationToken (from
 * GeneralResult<RegistrationSessionResponse>) in SignupFlowService and
 * advances to the address step (/auth/signup/address) rather than
 * straight to the success screen - PUT Auth/company/address or
 * PUT Auth/vendor/address still needs to run first.
 *
 * Consumes:
 *   POST /api/Auth/verify-account
 *   POST /api/Auth/resend-otp-registration
 */
@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuthShell, OtpInput, PrimaryButton, StepIndicator],
  templateUrl: './verify-account.html',
  styleUrl: './verify-account.css',
})
export class VerifyAccount implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly signupFlow = inject(SignupFlowService);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly loading = signal(false);
  readonly resending = signal(false);
  readonly secondsRemaining = signal(RESEND_COOLDOWN_SECONDS);

  readonly form = this.fb.group({
    code: ['', [otpCodeValidator()]],
  });

  get email(): string {
    return this.signupFlow.pendingEmail() ?? '';
  }

  ngOnInit(): void {
    if (!this.email) {
      // Arrived here directly without completing step 1 - send them back.
      this.router.navigate(['/auth/signup']);
      return;
    }
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private startCountdown(): void {
    this.secondsRemaining.set(RESEND_COOLDOWN_SECONDS);
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      this.secondsRemaining.update((value) => {
        if (value <= 1 && this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const code = this.form.getRawValue().code!;

    this.authService.verifyAccount({ email: this.email, code }).subscribe({
      next: (result: ApiResultData<VerifyAccountResponseData>) => {
        this.loading.set(false);

        if (!result.success || !result.data) {
          this.toast.error(result.message || 'Invalid or expired code.');
          return;
        }

        this.signupFlow.setRegistrationToken(result.data.registrationToken);
        this.router.navigate(['/auth/signup/address']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.toast.error(err.error?.message ?? 'Invalid or expired code.');
      },
    });
  }

  resend(): void {
    if (this.secondsRemaining() > 0 || this.resending()) return;

    this.resending.set(true);
    this.authService.resendRegistrationOtp({ email: this.email }).subscribe({
      next: (result: ApiResult) => {
        this.resending.set(false);
        if (result.success) {
          this.toast.success('A new code has been sent to your e-mail.');
          this.startCountdown();
        } else {
          this.toast.error(result.message || 'Could not resend code.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.resending.set(false);
        this.toast.error(err.error?.message ?? 'Could not resend code.');
      },
    });
  }
}
