import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

/**
 * Gradient pill button used for every primary call-to-action across the
 * auth flow: "Login", "Sign Up", "Continue", "Send Code", "Change Password".
 * Shows a spinner and disables itself while `loading` is true, so callers
 * don't need to duplicate that disabled-state logic in every page.
 *
 * For `type="submit"` usage inside a <form>, the native form submit event
 * is what triggers the page's `(ngSubmit)` - `clicked` is not needed there.
 * For `type="button"` usage (e.g. the "Ok" button on success screens that
 * isn't submitting any form), bind `(clicked)` to run an action.
 */
@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './primary-button.html',
  styleUrl: './primary-button.css',
})
export class PrimaryButton {
  @Input() type: 'button' | 'submit' = 'submit';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon: IconName | null = null;
  @Input() fullWidth = true;

  @Output() clicked = new EventEmitter<void>();

  handleClick(): void {
    if (this.type === 'button') {
      this.clicked.emit();
    }
  }
}
