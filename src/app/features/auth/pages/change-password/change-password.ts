import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { PasswordInput } from '../../../../shared/components/password-input/password-input';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { PasswordRules, PasswordRuleState } from '../../../../shared/components/password-rules/password-rules';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { fieldError, groupError } from '../../../../shared/utils/field-error.util';
import { passwordStrengthValidator, passwordsMatchValidator } from '../../../../shared/validators/auth-validators';
import { ApiResult } from '../../../../core/models';

/**
 * "Change Password" frame - for an already-authenticated user changing
 * their own password (distinct from the forgot-password flow, which is for
 * a signed-out user). Subtitle shows the signed-in user's email, per the
 * "Enter new Password for your account example@email.com" frame text.
 *
 * Consumes: POST /api/Auth/ChangePassword (requires Authorization header,
 * attached automatically by AuthInterceptor since this route isn't in the
 * public-endpoints allowlist).
 */
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuthShell, PasswordInput, PrimaryButton, PasswordRules],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly currentEmail = computed(() => this.authService.currentUser()?.email ?? '');

  readonly form = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
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
    const { currentPassword, newPassword } = this.form.getRawValue();

    this.authService.changePassword({ currentPassword: currentPassword!, newPassword: newPassword! }).subscribe({
      next: (result) => {
        this.loading.set(false);

        if (result.success === false) {
          this.toast.error(result.message || 'Could not change password. Check your current password.');
          return;
        }

        this.router.navigate(['/auth/change-password/success']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const body = err.error as ApiResult | undefined;
        this.toast.error(body?.message ?? 'Could not change password. Check your current password.');
      },
    });
  }
}
