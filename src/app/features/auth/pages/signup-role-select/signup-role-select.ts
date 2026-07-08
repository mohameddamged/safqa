import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthShell } from '../../../../shared/components/auth-shell/auth-shell';

interface RoleOption {
  role: 'company' | 'vendor';
  title: string;
  bullets: string[];
  accentClass: string;
}

/**
 * Entry point of the sign-up flow - lets the visitor choose which kind of
 * account to create. Maps directly to the two registration endpoints:
 *   Company -> POST /api/Auth/register-company
 *   Vendor  -> POST /api/Auth/register-vendor
 * The choice only determines which route/form loads next; no API call
 * happens on this screen itself.
 */
@Component({
  selector: 'app-signup-role-select',
  standalone: true,
  imports: [CommonModule, RouterLink, AuthShell],
  templateUrl: './signup-role-select.html',
  styleUrl: './signup-role-select.css',
})
export class SignupRoleSelect {
  readonly options: RoleOption[] = [
    {
      role: 'company',
      title: 'Company',
      bullets: ['Searching for vendors', 'Create Tenders & choose best price', "Send RFQs & receive vendors' offers"],
      accentClass: 'card--company',
    },
    {
      role: 'vendor',
      title: 'Vendor',
      bullets: ['Show your products', 'Win Tenders & increase your sales', 'Increase your customer network'],
      accentClass: 'card--vendor',
    },
  ];

  constructor(private readonly router: Router) {}

  select(role: 'company' | 'vendor'): void {
    this.router.navigate(['/auth/signup', role]);
  }
}
