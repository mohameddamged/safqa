import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { TextInput } from '../../../../shared/components/text-input/text-input';
import { PasswordInput } from '../../../../shared/components/password-input/password-input';
import { FileInput } from '../../../../shared/components/file-input/file-input';
import { Checkbox } from '../../../../shared/components/checkbox/checkbox';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { StepIndicator } from '../../../../shared/components/step-indicator/step-indicator';
import { PasswordRules, PasswordRuleState } from '../../../../shared/components/password-rules/password-rules';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { fieldError, groupError } from '../../../../shared/utils/field-error.util';
import { applyServerErrors } from '../../../../shared/utils/server-error.util';
import {
  egyptianPhoneValidator,
  imageFileValidator,
  passwordStrengthValidator,
  passwordsMatchValidator,
  taxIdValidator,
} from '../../../../shared/validators/auth-validators';
import { SignupFlowService } from '../../services/signup-flow.service';
import { ApiResult } from '../../../../core/models';

/**
 * Step 1 of the Vendor sign-up flow - matches the "Seller sign up" frame
 * against RegisterVendorDto: FirstName, LastName, VendorName, TaxId, Email,
 * PhoneNumber, Password, TaxCardFrontImage, TaxCardBackImage.
 *
 * Differs from SignupCompany only in field name ("Vendor Name" vs
 * "Company Name"). Phone validation uses the SAME Egyptian-only rule as the
 * company flow (`^01[0125]\d{8}$`) - RegisterVendorDtoValidator.cs has an
 * international pattern in the source but it is commented out, so the rule
 * actually enforced server-side is identical to the company flow's.
 *
 * Consumes: POST /api/Auth/register-vendor (multipart/form-data)
 */
@Component({
  selector: 'app-signup-vendor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthShell,
    TextInput,
    PasswordInput,
    FileInput,
    Checkbox,
    PrimaryButton,
    StepIndicator,
    PasswordRules,
  ],
  templateUrl: './signup-vendor.html',
  styleUrl: './signup-vendor.css',
})
export class SignupVendor {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly signupFlow = inject(SignupFlowService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    vendorName: ['', [Validators.required]],
    taxId: ['', [Validators.required, taxIdValidator()]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, egyptianPhoneValidator()]],
    password: ['', [Validators.required, passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]],
    taxCardFrontImage: [null as File | null, [Validators.required, imageFileValidator()]],
    taxCardBackImage: [null as File | null, [Validators.required, imageFileValidator()]],
    agreeToTerms: [false, [Validators.requiredTrue]],
  }, {
    validators: [passwordsMatchValidator('password', 'confirmPassword')],
  });

  readonly passwordRuleState = computed<PasswordRuleState>(() => {
    const errors = this.form.get('password')?.errors;
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
    const value = this.form.getRawValue();

    this.authService
      .registerVendor({
        firstName: value.firstName!,
        lastName: value.lastName!,
        vendorName: value.vendorName!,
        taxId: value.taxId!,
        email: value.email!,
        phoneNumber: value.phoneNumber!,
        password: value.password!,
        taxCardFrontImage: value.taxCardFrontImage!,
        taxCardBackImage: value.taxCardBackImage!,
      })
      .subscribe({
        next: (result: ApiResult) => {
          this.loading.set(false);

          if (!result.success) {
            applyServerErrors(this.form, result.errors);
            this.toast.error(result.message || 'Sign up failed. Please check the form.');
            return;
          }

          this.signupFlow.start('vendor', value.email!, value.vendorName!);
          this.router.navigate(['/auth/signup/verify']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const body = err.error as ApiResult | undefined;
          if (body?.errors) {
            applyServerErrors(this.form, body.errors);
          }
          this.toast.error(body?.message ?? 'Sign up failed. Please try again.');
        },
      });
  }
}
