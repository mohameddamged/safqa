import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-system-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './system-admin-sidebar.html',
  styleUrl: './system-admin-sidebar.css',
})
export class SystemAdminSidebar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isVerificationOpen = false;
  isEscrowOpen = false;

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}