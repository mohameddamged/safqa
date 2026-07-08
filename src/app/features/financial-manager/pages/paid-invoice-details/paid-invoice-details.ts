import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FmShell } from '../../components/fm-shell/fm-shell';
import { FinancialManagerService } from '../../services/financial-manager.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FmPaymentSummary } from '../../models';

@Component({
  selector: 'app-fm-paid-invoice-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FmShell],
  templateUrl: './paid-invoice-details.html',
  styleUrl: './paid-invoice-details.css',
})
export class PaidInvoiceDetails implements OnInit {
  private readonly fmService = inject(FinancialManagerService);
  private readonly toast     = inject(ToastService);
  private readonly route     = inject(ActivatedRoute);
  private readonly router    = inject(Router);

  readonly loading = signal(true);
  readonly errored = signal(false);
  readonly details = signal<FmPaymentSummary | null>(null);
  readonly poTitle = signal('');

  ngOnInit(): void {
    const poId = this.route.snapshot.paramMap.get('id');
    if (!poId) {
      this.router.navigate(['/financial-manager/paid-invoices']);
      return;
    }

    // Using getPaymentSummary (replaces removed getPoPaymentDetails)
    // GET /api/Finance/{purchaseOrderId}/payment-summary
    this.fmService.getPaymentSummary(Number(poId)).subscribe({
      next: (result: any) => {
        const d = result?.data ?? result;
        if (d) {
          this.details.set(d);
          this.poTitle.set(d.vendorName ?? `PO #${poId}`);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errored.set(true);
        this.toast.error(err?.error?.message ?? 'Could not load this invoice.');
      },
    });
  }
}
