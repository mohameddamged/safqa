import { AbstractControl } from '@angular/forms';

/**
 * Resolves a single human-readable message for whatever error is currently
 * set on a control, checking the server-provided message first (set by
 * applyServerErrors) before falling back to client-side validator messages.
 * Returns null when the control has no errors or hasn't been touched yet,
 * so templates can do `[errorMessage]="fieldError(form, 'email')"` and
 * pass the result straight into TextInput/PasswordInput's `errorMessage` input.
 */
export function fieldError(control: AbstractControl | null, label: string): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) {
    return null;
  }

  const errors = control.errors;

  if (errors['server']) return errors['server'];
  if (errors['required']) return `${label} is required.`;
  if (errors['email']) return 'Enter a valid email address.';
  if (errors['minlength']) {
    return `${label} must be at least ${errors['minlength'].requiredLength} characters.`;
  }
  if (errors['maxlength']) {
    return `${label} must be at most ${errors['maxlength'].requiredLength} characters.`;
  }
  if (errors['passwordStrength']) return 'Password does not meet the requirements below.';
  if (errors['invalidOtp']) return 'Enter the full 6-digit code.';
  if (errors['invalidEgyptianPhone']) return 'Enter a valid Egyptian mobile number (e.g. 01012345678).';
  if (errors['invalidInternationalPhone']) return 'Enter a valid international number (e.g. +201012345678).';
  if (errors['taxIdNotNumeric']) return 'Tax ID must contain numbers only.';
  if (errors['taxIdLength']) return 'Tax ID must be between 9 and 15 digits.';
  if (errors['taxIdRepeated']) return 'Invalid Tax ID.';
  if (errors['invalidImageType']) return 'Only JPG, PNG, or WEBP images are allowed.';

  return `${label} is invalid.`;
}

/** Group-level variant for cross-field errors like passwordsMismatch, set on the FormGroup itself. */
export function groupError(group: AbstractControl | null): string | null {
  if (!group || !group.errors) return null;
  if (group.errors['passwordsMismatch']) return 'Passwords do not match.';
  return null;
}
