import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FmShell } from '../../components/fm-shell/fm-shell';
import { Icon } from '../../../../shared/components/icon/icon';
import { FinancialManagerService } from '../../services/financial-manager.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FmPendingPoListItem } from '../../models';

const PAGE_SIZE = 10;

/*
 * Consumes (mocked for now)
 * TODO: Replace with GET /api/financial-manager/pos/pending-invoices?pageNumber=&pageSize=
 */
@Component({
  selector: 'app-fm-pending-po-invoices',
  standalone: true,
  imports: [CommonModule, FmShell, Icon],
  templateUrl: './pending-po-invoices.html',
  styleUrl: './pending-po-invoices.css',
})
export class PendingPoInvoices implements OnInit {
  private readonly fmService = inject(FinancialManagerService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly errored = signal(false);
  readonly pos = signal<FmPendingPoListItem[]>([]);
  readonly pageNumber = signal(1);
  readonly totalCount = signal(0);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)));

  ngOnInit(): void {
    this.loadPage(1);
  }

loadPage(page: number): void {
  this.loading.set(true);
  this.errored.set(false);
  this.fmService.getPendingPoInvoices(page).subscribe({
    next: (result) => {
      this.loading.set(false);
      if (result.success && result.data) {
        this.pos.set(result.data.items);
        this.pageNumber.set(result.data.pageNumber);
        this.totalCount.set(result.data.totalCount);
      }
    },
    error: () => {
      this.loading.set(false);
      this.errored.set(true);
      this.toast.error('Could not load pending PO invoices. Please try again.');
    },
  });
}
  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.loadPage(this.pageNumber() - 1);
    }
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.loadPage(this.pageNumber() + 1);
    }
  }

  viewDetails(po: FmPendingPoListItem): void {
    this.router.navigate(['/financial-manager/pending-po-invoices', po.id]);
  }
}
