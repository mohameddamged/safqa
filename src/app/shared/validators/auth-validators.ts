import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Every validator here exists to mirror a rule enforced server-side, so a
 * user sees the same complaint instantly instead of round-tripping to the
 * API just to learn their password is missing a digit. The backend remains
 * the source of truth - these are a UX shortcut, not a replacement for
 * server-side validation errors, which are still rendered when returned.
 */

/**
 * Mirrors Program.cs Identity password options AND the regex repeated in
 * ChangePasswordDto / RegisterCompanyDtoValidator / RegisterVendorDtoValidator:
 *   - RequireDigit, RequireUppercase, RequireLowercase, RequireNonAlphanumeric
 *   - RequiredLength = 8
 * Returns one error object with a per-rule boolean map so the template can
 * drive a live checklist (as shown in the "Create a Password" / "Change
 * Password" UI frames) rather than a single opaque "invalid" flag.
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';

    const rules = {
      minLength: value.length >= 8,
      maxLength: value.length <= 128,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value),
      hasSymbol: /[^A-Za-z0-9]/.test(value),
    };

    const isValid = Object.values(rules).every(Boolean);
    return isValid ? null : { passwordStrength: rules };
  };
}

/**
 * Cross-field validator for a (password, confirmPassword) pair. Applied at
 * the FormGroup level, not the individual control, since it needs to read
 * two sibling controls. Backend has no ConfirmPassword field anywhere -
 * this check is purely client-side UX and the confirm value is never sent.
 */
export function passwordsMatchValidator(
  passwordControlName: string,
  confirmControlName: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordControlName)?.value;
    const confirm = group.get(confirmControlName)?.value;

    if (!confirm) return null;
    return password === confirm ? null : { passwordsMismatch: true };
  };
}

/**
 * Mirrors RegisterCompanyDtoValidator's Egyptian mobile number rule:
 *   .Matches(@"^01[0125]\d{8}$")
 * Used on the Company sign-up flow specifically.
 */
export function egyptianPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    return /^01[0125]\d{8}$/.test(value) ? null : { invalidEgyptianPhone: true };
  };
}

/**
 * NOTE: RegisterVendorDtoValidator.cs has an international phone rule
 * (`^\+[1-9]\d{7,14}$`) written in the source, but it is commented out.
 * The rule FluentValidation actually enforces for vendors is identical to
 * the company flow's Egypt-only rule:
 *   .Matches(@"^01[0125]\d{8}$")
 * This validator is kept as a thin alias of egyptianPhoneValidator() (not
 * deleted outright) so any other code still importing
 * `internationalPhoneValidator` keeps compiling, but it now enforces the
 * rule the backend actually runs rather than the commented-out one.
 */
export function internationalPhoneValidator(): ValidatorFn {
  return egyptianPhoneValidator();
}

/**
 * Mirrors the Tax ID rule shared by both RegisterCompanyDtoValidator and
 * RegisterVendorDtoValidator:
 *   .Matches(@"^\d+$") + .Length(9, 15) + .Must(taxId => taxId.Distinct().Count() > 1)
 * The "Distinct().Count() > 1" rule rejects strings of a single repeated
 * digit (e.g. "111111111"), which is what "Invalid Tax ID" refers to.
 */
export function taxIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;

    if (!/^\d+$/.test(value)) return { taxIdNotNumeric: true };
    if (value.length < 9 || value.length > 15) return { taxIdLength: true };
    if (new Set(value.split('')).size <= 1) return { taxIdRepeated: true };

    return null;
  };
}

/** Exactly six digits - used by the shared OTP input across verify-account and reset-password flows. */
export function otpCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    return /^\d{6}$/.test(value) ? null : { invalidOtp: true };
  };
}

/** Simple, permissive file-type check for the Tax ID image uploads (.jpg/.jpeg/.png/.webp per BeValidImage). */
export function imageFileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file: File | null = control.value ?? null;
    if (!file) return null;

    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const name = file.name.toLowerCase();
    const isAllowed = allowed.some((ext) => name.endsWith(ext));

    return isAllowed ? null : { invalidImageType: true };
  };
}
