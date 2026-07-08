import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-vendor-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './vendor-sidebar.html',
  styleUrl: './vendor-sidebar.css',
})
export class VendorSidebar {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  myOffersOpen = signal<boolean>(false);

  toggleMyOffers(): void {
    this.myOffersOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
