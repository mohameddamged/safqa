import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FmShell } from '../../components/fm-shell/fm-shell';
import { FinancialManagerService } from '../../services/financial-manager.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FmRecoveredFundDetails } from '../../models';

@Component({
  selector: 'app-fm-recovered-fund-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FmShell],
  templateUrl: './recovered-fund-details.html',
  styleUrl: './recovered-fund-details.css',
})
export class RecoveredFundDetails implements OnInit {
  private readonly fmService = inject(FinancialManagerService);
  private readonly toast     = inject(ToastService);
  private readonly route     = inject(ActivatedRoute);
  private readonly router    = inject(Router);

  readonly loading = signal(true);
  readonly errored = signal(false);
  readonly details = signal<FmRecoveredFundDetails | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/financial-manager/recovered-funds']);
      return;
    }
    const id = Number(idParam);

    // GET /api/Finance/recovered-funds/{purchaseOrderId}
    // Returns: CompanyRecoveredFundDetailsDto
    this.fmService.getRecoveredFundDetails(id).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (result.success && result.data) {
          this.details.set(result.data);
        } else {
          this.errored.set(true);
          this.toast.error(result.message || 'Could not load recovered fund details.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errored.set(true);
        this.toast.error(err?.error?.message ?? 'Could not load this record.');
      },
    });
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB');
  }
}