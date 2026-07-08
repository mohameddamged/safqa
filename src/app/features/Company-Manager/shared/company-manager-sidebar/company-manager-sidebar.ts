import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-company-manager-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './company-manager-sidebar.html',
  styleUrl: './company-manager-sidebar.css',
})
export class CompanyManagerSidebar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  isVerificationOpen = false;

  isSettingsOpen = signal<boolean>(false);

  toggleSettings() {
    this.isSettingsOpen.update(value => !value);
  }

  
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
