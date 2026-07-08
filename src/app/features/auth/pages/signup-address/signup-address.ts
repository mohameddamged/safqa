import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { TextInput } from '../../../../shared/components/text-input/text-input';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { StepIndicator } from '../../../../shared/components/step-indicator/step-indicator';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { fieldError } from '../../../../shared/utils/field-error.util';
import { SignupFlowService } from '../../services/signup-flow.service';
import { ApiResult } from '../../../../core/models';

/**
 * Step 3 of 3 of the sign-up wizard - matches the "Sign up" address frame
 * (Country / State-Region / City / Street / Full Address / Continue) shown
 * after OTP verification in both Buyer signup 3.pdf and seller signup
 * 3.pdf. Field-for-field this matches
 * UpdateCompanyAddressForRegistrationDto / UpdateVendorAddressForRegistrationDto
 * exactly: Country, StateRegion, City, StreetNumber (optional), FullAddress.
 *
 * Which endpoint is called - PUT Auth/company/address or
 * PUT Auth/vendor/address - depends on the role chosen on the sign-up
 * role-select screen (SignupFlowService.role), since the backend exposes
 * two distinct address endpoints rather than one shared one.
 *
 * registrationToken comes from the GeneralResult<RegistrationSessionResponse>
 * returned by POST Auth/verify-account in the previous step. If it's
 * missing (e.g. a direct deep link, or the in-memory flow state was lost
 * on a refresh), the user is sent back to the start of sign-up rather than
 * letting a request with an empty token reach the backend.
 *
 * Consumes: PUT /api/Auth/company/address or PUT /api/Auth/vendor/address
 */
@Component({
  selector: 'app-signup-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuthShell, TextInput, PrimaryButton, StepIndicator],
  templateUrl: './signup-address.html',
  styleUrl: './signup-address.css',
})
export class SignupAddress implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly signupFlow = inject(SignupFlowService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    country: ['', [Validators.required]],
    stateRegion: ['', [Validators.required]],
    city: ['', [Validators.required]],
    streetNumber: [''],
    fullAddress: ['', [Validators.required]],
  });

  get registrationToken(): string | null {
    return this.signupFlow.registrationToken();
  }

  get role(): 'company' | 'vendor' | null {
    return this.signupFlow.role();
  }

  ngOnInit(): void {
    // Arrived here without a registration token (direct link, refresh that
    // cleared the in-memory SignupFlowService, or skipped verify-account
    // entirely) - there is nothing valid to submit, so restart sign-up.
    if (!this.registrationToken || !this.role) {
      this.router.navigate(['/auth/signup']);
    }
  }

  fieldError(name: string, label: string): string | null {
    return fieldError(this.form.get(name), label);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.registrationToken || !this.role) {
      this.router.navigate(['/auth/signup']);
      return;
    }

    this.loading.set(true);
    const value = this.form.getRawValue();

    const payload = {
      registrationToken: this.registrationToken,
      country: value.country!,
      stateRegion: value.stateRegion!,
      city: value.city!,
      streetNumber: value.streetNumber || null,
      fullAddress: value.fullAddress!,
    };

    const request$ =
      this.role === 'company'
        ? this.authService.updateCompanyAddress(payload)
        : this.authService.updateVendorAddress(payload);

    request$.subscribe({
      next: (result: ApiResult) => {
        this.loading.set(false);

        if (!result.success) {
          this.toast.error(result.message || 'Could not save address. Please try again.');
          return;
        }

        this.signupFlow.reset();
        this.router.navigate(['/auth/signup/success']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const body = err.error as ApiResult | undefined;
        this.toast.error(body?.message ?? 'Could not save address. Please try again.');
      },
    });
  }
}
