import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-inventory-officer-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './inventory-officer-sidebar.html',
  styleUrl: './inventory-officer-sidebar.css',
})
export class InventoryOfficerSidebar {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  isVerificationOpen = false;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}