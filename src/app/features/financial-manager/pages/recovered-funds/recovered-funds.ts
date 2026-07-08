import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FmShell } from '../../components/fm-shell/fm-shell';
import { Icon } from '../../../../shared/components/icon/icon';
import { FinancialManagerService } from '../../services/financial-manager.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FmRecoveredFundListItem } from '../../models';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-fm-recovered-funds',
  standalone: true,
  imports: [CommonModule, FmShell, Icon],
  templateUrl: './recovered-funds.html',
  styleUrl: './recovered-funds.css',
})
export class RecoveredFunds implements OnInit {
  private readonly fmService = inject(FinancialManagerService);
  private readonly toast     = inject(ToastService);
  private readonly router    = inject(Router);

  readonly loading     = signal(true);
  readonly errored     = signal(false);
  readonly funds       = signal<FmRecoveredFundListItem[]>([]);
  readonly pageNumber  = signal(1);
  readonly totalCount  = signal(0);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)),
  );

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.errored.set(false);

    // GET /api/Finance/recovered-funds?pageNumber=&pageSize=
    this.fmService.getRecoveredFunds(page, PAGE_SIZE).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (result.success && result.data) {
          this.funds.set(result.data.items);
          this.pageNumber.set(result.data.pageNumber);
          this.totalCount.set(result.data.totalCount);
        } else {
          this.errored.set(true);
          this.toast.error(result.message || 'Could not load recovered funds.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errored.set(true);
        this.toast.error(err?.error?.message ?? 'Could not load recovered funds. Please try again.');
      },
    });
  }

  previousPage(): void {
    if (this.pageNumber() > 1) this.loadPage(this.pageNumber() - 1);
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) this.loadPage(this.pageNumber() + 1);
  }

  // Navigate using purchaseOrderId (the real id from backend)
  viewDetails(fund: FmRecoveredFundListItem): void {
    this.router.navigate(['/financial-manager/recovered-funds', fund.purchaseOrderId]);
  }
}
