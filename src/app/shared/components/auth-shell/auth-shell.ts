import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../icon/icon';

/**
 * Shared page chrome for every auth screen: optional "Back" link, the Safqa
 * logo, a title, and an optional subtitle - exactly the layout repeated
 * across Login, Forgot Password, Sign-up, Change Password, etc. Page
 * content (form, OTP boxes, success icon...) is projected via <ng-content>.
 *
 * `showBack` defaults to true because most frames have it; the two
 * "success" style screens and the alternate no-back Login variant pass
 * `[showBack]="false"`.
 */
@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.css',
})
export class AuthShell {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showBack = true;

  /**
   * Optional fixed destination for the Back button. When set, Back always
   * navigates here instead of using browser history — used by the Login
   * page so Back reliably returns to the landing page regardless of how
   * the user arrived (deep link, redirect after logout, etc.) rather than
   * potentially bouncing them through unrelated pages in their history.
   */
  @Input() backTo?: string;

  constructor(private readonly router: Router) {}

  /**
   * Uses browser history when available (the common case: arriving from
   * another step in the same flow), falling back to the auth landing page
   * when this is the first entry in the session (e.g. a deep link).
   */
  goBack(): void {
    if (this.backTo) {
      this.router.navigateByUrl(this.backTo);
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    this.router.navigate(['/auth/login']);
  }
}
