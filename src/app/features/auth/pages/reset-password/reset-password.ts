import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { PasswordInput } from '../../../../shared/components/password-input/password-input';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { StepIndicator } from '../../../../shared/components/step-indicator/step-indicator';
import { PasswordRules, PasswordRuleState } from '../../../../shared/components/password-rules/password-rules';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { fieldError, groupError } from '../../../../shared/utils/field-error.util';
import { passwordStrengthValidator, passwordsMatchValidator } from '../../../../shared/validators/auth-validators';
import { PasswordResetFlowService } from '../../services/password-reset-flow.service';
import { ApiResult } from '../../../../core/models';

/**
 * Step 3 of 3 - matches "Create new Password" frame: Create/Confirm
 * password fields with the live rules checklist, "Change Password" CTA.
 *
 * Consumes: POST /api/Auth/reset-password
 * (email + verificationCode carried over from PasswordResetFlowService;
 * the backend's ResetPasswordRequest has no separate confirm-password field).
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthShell,
    PasswordInput,
    PrimaryButton,
    StepIndicator,
    PasswordRules,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly resetFlow = inject(PasswordResetFlowService);

  readonly loading = signal(false);

  readonly form = this.fb.group(
    {
      newPassword: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordsMatchValidator('newPassword', 'confirmPassword')] },
  );

  readonly passwordRuleState = computed<PasswordRuleState>(() => {
    const errors = this.form.get('newPassword')?.errors;
    return (
      errors?.['passwordStrength'] ?? {
        minLength: true,
        maxLength: true,
        hasUppercase: true,
        hasLowercase: true,
        hasNumber: true,
        hasSymbol: true,
      }
    );
  });

  ngOnInit(): void {
    if (!this.resetFlow.email() || !this.resetFlow.verifiedCode()) {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  fieldError(name: string, label: string): string | null {
    return fieldError(this.form.get(name), label);
  }

  get confirmPasswordError(): string | null {
    if (this.form.get('confirmPassword')?.touched && this.form.errors?.['passwordsMismatch']) {
      return groupError(this.form);
    }
    return this.fieldError('confirmPassword', 'Confirm password');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const newPassword = this.form.getRawValue().newPassword!;

    this.authService
      .resetPassword({
        email: this.resetFlow.email()!,
        verificationCode: this.resetFlow.verifiedCode()!,
        newPassword,
      })
      .subscribe({
        next: (result: ApiResult) => {
          this.loading.set(false);

          if (!result.success) {
            this.toast.error(result.message || 'Could not reset password.');
            return;
          }

          this.resetFlow.reset();
          this.router.navigate(['/auth/forgot-password/success']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.toast.error(err.error?.message ?? 'Could not reset password.');
        },
      });
  }
}
