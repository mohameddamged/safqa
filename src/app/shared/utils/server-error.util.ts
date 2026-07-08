import { FormGroup } from '@angular/forms';
import { ApiErrorDictionary } from '../../core/models';

/**
 * Backend validation failures arrive as GeneralResult.Errors, a
 * Dictionary<string, List<Error>> keyed by the C# property name
 * (PascalCase, e.g. "Email", "TaxId", "PhoneNumber"). Reactive form
 * control names in this app are camelCase (e.g. "email", "taxId").
 * This walks the dictionary, lowercases the first letter of each key,
 * and calls setErrors({ server: message }) on the matching control so
 * the field renders the exact server message - the same one FluentValidation
 * produced - instead of a generic "invalid" state.
 *
 * Controls not present in `errors` are left untouched (their own
 * client-side validators still apply).
 */
export function applyServerErrors(form: FormGroup, errors: ApiErrorDictionary | null | undefined): void {
  if (!errors) return;

  for (const [field, fieldErrors] of Object.entries(errors)) {
    const controlName = field.charAt(0).toLowerCase() + field.slice(1);
    const control = form.get(controlName);
    const message = fieldErrors[0]?.message ?? 'Invalid value.';

    if (control) {
      control.setErrors({ ...control.errors, server: message });
      control.markAsTouched();
    }
  }
}

/** Pulls the first message out of an error dictionary, for non-field-specific banner display. */
export function firstServerErrorMessage(errors: ApiErrorDictionary | null | undefined): string | null {
  if (!errors) return null;
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return null;
  return errors[firstKey][0]?.message ?? null;
}
