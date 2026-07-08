import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FmShell } from '../../components/fm-shell/fm-shell';
import { Icon } from '../../../../shared/components/icon/icon';
import { FinancialManagerService } from '../../services/financial-manager.service';
import { ToastService } from '../../../../core/services/toast.service';
import {FmPrListItem} from '../../models';

const PAGE_SIZE = 10;

/**
 * Consumes the REAL backend: FinancialManagerService.getPendingPrs()
 * -> GET api/Finance?pageIndex=&pageSize= (FinanceController,
 * [Authorize(Roles = "FinanceManager")]).
 */
@Component({
  selector: 'app-fm-pending-prs',
  standalone: true,
  imports: [CommonModule, FmShell, Icon],
  templateUrl: './pending-pr.html',
  styleUrl: './pending-pr.css',
})
export class PendingPrs implements OnInit {
  private readonly fmService = inject(FinancialManagerService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly errored = signal(false);
  readonly prs = signal<FmPrListItem[]>([]);
  readonly pageNumber = signal(1);
  readonly totalCount = signal(0);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)));

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.errored.set(false);
    this.fmService.getPendingPrs(page, PAGE_SIZE).subscribe({
      next: (result) => {
        this.loading.set(false);

        if (!result.success || !result.data) {
          this.errored.set(true);
          this.toast.error(result.message || 'Could not load pending PRs. Please try again.');
          return;
        }

        this.prs.set(result.data.items);
        this.pageNumber.set(result.data.pageNumber);
        this.totalCount.set(result.data.totalCount);
      },
      error: (err) => {
        this.loading.set(false);
        this.errored.set(true);
        this.toast.error(err?.error?.message ?? 'Could not load pending PRs. Please try again.');
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

  viewDetails(pr: FmPrListItem): void {
    this.router.navigate(['/financial-manager/pending-prs', pr.id]);
  }
}