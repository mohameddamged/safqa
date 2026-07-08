import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProcurementOfficerNavbar } from '../../features/procurement-officer/Shared/procurement-officer-navbar/procurement-officer-navbar';

@Component({
  selector:    'app-department-manager-layout',
  standalone:  true,
  imports:     [RouterOutlet, RouterLink, RouterLinkActive, ProcurementOfficerNavbar],
  templateUrl: './department-manager-layout.html',
  styleUrl:    './department-manager-layout.css',
})
export class DepartmentManagerLayout {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
