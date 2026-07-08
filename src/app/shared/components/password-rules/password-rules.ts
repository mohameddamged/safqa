import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Icon } from '../icon/icon';

export interface PasswordRuleState {
  minLength: boolean;
  maxLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

const ALL_RULES_SATISFIED: PasswordRuleState = {
  minLength: false,
  maxLength: false,
  hasUppercase: false,
  hasLowercase: false,
  hasNumber: false,
  hasSymbol: false,
};

/**
 * Two-column live checklist rendered under the password fields on the
 * Create Password / Sign-up / Change Password frames. Takes the
 * `passwordStrength` error object produced by passwordStrengthValidator()
 * directly - pass `control.errors?.['passwordStrength']` from the parent
 * form, no separate state to keep in sync.
 */
@Component({
  selector: 'app-password-rules',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './password-rules.html',
  styleUrl: './password-rules.css',
})
export class PasswordRules {
  @Input() rules: PasswordRuleState = ALL_RULES_SATISFIED;

  readonly leftColumn: { key: keyof PasswordRuleState; label: string }[] = [
    { key: 'minLength', label: 'Minimum 8 characters' },
    { key: 'hasUppercase', label: 'At least one uppercase' },
    { key: 'hasLowercase', label: 'At least one lowercase' },
  ];

  readonly rightColumn: { key: keyof PasswordRuleState; label: string }[] = [
    { key: 'hasNumber', label: 'At least one number' },
    { key: 'hasSymbol', label: 'At least one symbol (@-/._$)' },
    { key: 'maxLength', label: 'Maximum 128 characters' },
  ];
}
