import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { TextInput } from '../../../../shared/components/text-input/text-input';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { StepIndicator } from '../../../../shared/components/step-indicator/step-indicator';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { fieldError } from '../../../../shared/utils/field-error.util';
import { PasswordResetFlowService } from '../../services/password-reset-flow.service';
import { ApiResult } from '../../../../core/models';

/**
 * Step 1 of 3 - matches the "Forgot Password" frame exactly: email field,
 * "Send Code" button with mail icon, step indicator at 1/3.
 *
 * Consumes: POST /api/Auth/forget-password
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuthShell, TextInput, PrimaryButton, StepIndicator],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly resetFlow = inject(PasswordResetFlowService);

  readonly mailIcon = 'mail' as const;
  readonly loading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  fieldError(name: string, label: string): string | null {
    return fieldError(this.form.get(name), label);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const email = this.form.getRawValue().email!;

    this.authService.forgetPassword({ email }).subscribe({
      next: (result: ApiResult) => {
        this.loading.set(false);

        if (!result.success) {
          this.toast.error(result.message || 'Could not find an account with that email.');
          return;
        }

        this.resetFlow.setEmail(email);
        this.router.navigate(['/auth/forgot-password/verify']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.toast.error(err.error?.message ?? 'Could not find an account with that email.');
      },
    });
  }
}
