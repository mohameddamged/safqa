import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FmShell } from '../../components/fm-shell/fm-shell';
import { FinancialManagerService } from '../../services/financial-manager.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FmCompanyInfo } from '../../models';

const ROLE_TITLES: Record<string, string> = {
  FinanceManager: 'Financial Manager',
  ProcurementOfficer: 'Procurement Officer',
  InventoryOfficer: 'Inventory Officer',
  Manager: 'Department Manager',
  CompanyAdmin: 'Company Admin',
};

@Component({
  selector: 'app-fm-profile',
  standalone: true,
  imports: [CommonModule, FmShell],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly fmService = inject(FinancialManagerService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly user = this.authService.currentUser;
  readonly loading = signal(true);
  readonly companyInfo = signal<FmCompanyInfo | null>(null);

  readonly positionTitle = computed(() => {
    const role = this.user()?.role;
    if (!role) return '';
    return ROLE_TITLES[role] ?? role;
  });

  ngOnInit(): void {
    this.fmService.getCompanyInfo().subscribe({
      next: (info) => {
        this.companyInfo.set(info);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err?.message ?? 'Could not load company info. Please try again.');
      },
    });
  }
}