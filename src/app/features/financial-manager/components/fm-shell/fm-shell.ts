import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../../../shared/components/icon/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { Role } from '../../../../core/models';
import { ProcurementOfficerNavbar } from '../../../procurement-officer/Shared/procurement-officer-navbar/procurement-officer-navbar';

@Component({
  selector: 'app-fm-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Icon, ProcurementOfficerNavbar],
  templateUrl: './fm-shell.html',
  styleUrl: './fm-shell.css',
})
export class FmShell {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  readonly user = this.authService.currentUser;

  get isFinanceManager(): boolean {
    return this.authService.role() === Role.FinanceManager;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
