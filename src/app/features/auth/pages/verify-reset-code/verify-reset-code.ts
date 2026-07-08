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
import { PasswordResetFlowService } from '../../services/password-reset-flow.service';
import { ApiResult } from '../../../../core/models';

const RESEND_COOLDOWN_SECONDS = 56;

/**
 * Step 2 of 3 - same "Check your e-mail" OTP layout as account
 * verification, but wired to the password-reset-specific endpoints.
 *
 * Consumes:
 *   POST /api/Auth/verify-reset-code
 *   POST /api/Auth/resend-otp-password-reset
 */
@Component({
  selector: 'app-verify-reset-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuthShell, OtpInput, PrimaryButton, StepIndicator],
  templateUrl: './verify-reset-code.html',
  styleUrl: './verify-reset-code.css',
})
export class VerifyResetCode implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly resetFlow = inject(PasswordResetFlowService);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly loading = signal(false);
  readonly resending = signal(false);
  readonly secondsRemaining = signal(RESEND_COOLDOWN_SECONDS);

  readonly form = this.fb.group({
    code: ['', [otpCodeValidator()]],
  });

  get email(): string {
    return this.resetFlow.email() ?? '';
  }

  ngOnInit(): void {
    if (!this.email) {
      this.router.navigate(['/auth/forgot-password']);
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

    this.authService.verifyResetCode({ email: this.email, code }).subscribe({
      next: (result: ApiResult) => {
        this.loading.set(false);

        if (!result.success) {
          this.toast.error(result.message || 'Invalid or expired code.');
          return;
        }

        this.resetFlow.setVerifiedCode(code);
        this.router.navigate(['/auth/forgot-password/reset']);
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
    this.authService.resendPasswordResetOtp({ email: this.email }).subscribe({
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
