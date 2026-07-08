import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-procurement-officer-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './procurement-officer-sidebar.html',
  styleUrl: './procurement-officer-sidebar.css',
})
export class ProcurementOfficerSidebar {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isVerificationOpen = false;
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}