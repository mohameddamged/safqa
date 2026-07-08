import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';
import { TextInput } from '../../../../shared/components/text-input/text-input';
import { PasswordInput } from '../../../../shared/components/password-input/password-input';
import { Checkbox } from '../../../../shared/components/checkbox/checkbox';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { fieldError } from '../../../../shared/utils/field-error.util';
import { ApiResultData, LoginResponseData, ROLE_HOME_ROUTE, RoleName } from '../../../../core/models';

/**
 * Login screen - mirrors the "Login page" frame exactly:
 * logo, "Login" title, "welcome back!" subtitle, email/password pair,
 * Remember Me + Forgot Password row, gradient Login button, Sign Up footer.
 *
 * Consumes: POST /api/Auth/login (AuthService.login)
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthShell,
    TextInput,
    PasswordInput,
    Checkbox,
    PrimaryButton,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loginIcon = 'log-in' as const;
  readonly loading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
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
    const { email, password, rememberMe } = this.form.getRawValue();

    this.authService
      .login({ email: email!, password: password! }, !!rememberMe)
      .subscribe({
        next: (result: ApiResultData<LoginResponseData>) => {
          this.loading.set(false);

          if (!result.success || !result.data) {
            this.toast.error(result.message || 'Email or password is incorrect.');
            return;
          }

          this.toast.success(result.message || 'Successful login.');

          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const role = result.data.userData.role as RoleName;
          const destination = returnUrl || ROLE_HOME_ROUTE[role] || '/dashboard';

          this.router.navigateByUrl(destination);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const message = err.error?.message ?? 'Email or password is incorrect.';
          this.toast.error(message);
        },
      });
  }
}
