import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { TextInput } from '../../../../shared/components/text-input/text-input';
import { PasswordInput } from '../../../../shared/components/password-input/password-input';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { PasswordRules, PasswordRuleState } from '../../../../shared/components/password-rules/password-rules';
import { InvitationService } from '../../../../core/services/invitation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { fieldError, groupError } from '../../../../shared/utils/field-error.util';
import { applyServerErrors } from '../../../../shared/utils/server-error.util';
import {
  egyptianPhoneValidator,
  passwordStrengthValidator,
  passwordsMatchValidator,
} from '../../../../shared/validators/auth-validators';
import { ApiResult, InvitationDetailsDto } from '../../../../core/models';

type PageState = 'loading' | 'valid' | 'invalid';

/**
 * Public, unauthenticated landing page for an invited teammate. Reached via
 * the link in the invitation email: /invite-register?token=<guid>. Backend
 * generates this link in InvitationService.InviteUserAsync as
 * `{FrontendSettings.BaseUrl}/invite-register?token={token}` - the route
 * path segment here ("invite-register") must match that literally.
 *
 * Two-phase flow:
 *   1. On load, GET Auth/Invitations/validate?token=... to confirm the
 *      token is still pending and not expired/revoked/already used, and to
 *      display which company and role the person is being invited into
 *      (read-only - InvitationDetailsDto has no fields for these to be
 *      edited, only confirmed).
 *   2. On submit, POST Invitations/complete-registration with the same
 *      token plus the new account's FirstName/LastName/PhoneNumber/
 *      Password - the backend derives Email and Role from the invitation
 *      record itself, not from anything in this request.
 *
 * Consumes:
 *   GET  /api/Invitations/validate
 *   POST /api/Invitations/complete-registration
 */
@Component({
  selector: 'app-invite-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthShell,
    TextInput,
    PasswordInput,
    PrimaryButton,
    PasswordRules,
  ],
  templateUrl: './invite-register.html',
  styleUrl: './invite-register.css',
})
export class InviteRegister implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly invitationService = inject(InvitationService);
  private readonly toast = inject(ToastService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private token = '';

  readonly state = signal<PageState>('loading');
  readonly invalidMessage = signal('');
  readonly invitationDetails = signal<InvitationDetailsDto | null>(null);
  readonly loading = signal(false);

  readonly form = this.fb.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, egyptianPhoneValidator()]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordsMatchValidator('password', 'confirmPassword')] },
  );

  readonly passwordRuleState = signal<PasswordRuleState>(this.computeRuleState(''));

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.token) {
      this.state.set('invalid');
      this.invalidMessage.set('This invitation link is missing its token.');
      return;
    }

    this.form.get('password')!.valueChanges.subscribe((value) => {
      this.passwordRuleState.set(this.computeRuleState(value ?? ''));
    });

    this.invitationService.validateInvitation(this.token).subscribe({
      next: (result) => {
        if (!result.success || !result.data) {
          this.state.set('invalid');
          this.invalidMessage.set(result.message || 'This invitation link is no longer valid.');
          return;
        }
        this.invitationDetails.set(result.data);
        this.state.set('valid');
      },
      error: (err: HttpErrorResponse) => {
        this.state.set('invalid');
        this.invalidMessage.set(err.error?.message ?? 'This invitation link is no longer valid.');
      },
    });
  }

  private computeRuleState(value: string): PasswordRuleState {
    return {
      minLength: value.length >= 8,
      maxLength: value.length <= 128,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value),
      hasSymbol: /[^A-Za-z0-9]/.test(value),
    };
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
    const value = this.form.getRawValue();

    this.invitationService
      .completeInvitationRegistration({
        token: this.token,
        firstName: value.firstName!,
        lastName: value.lastName!,
        phoneNumber: value.phoneNumber!,
        password: value.password!,
      })
      .subscribe({
        next: (result: ApiResult) => {
          this.loading.set(false);

          if (!result.success) {
            applyServerErrors(this.form, result.errors);
            this.toast.error(result.message || 'Could not complete registration.');
            return;
          }

          this.router.navigate(['/invite-register/success']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const body = err.error as ApiResult | undefined;
          if (body?.errors) {
            applyServerErrors(this.form, body.errors);
          }
          this.toast.error(body?.message ?? 'Could not complete registration. Please try again.');
        },
      });
  }
}
