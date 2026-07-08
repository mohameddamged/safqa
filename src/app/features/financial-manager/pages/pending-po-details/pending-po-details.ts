import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FmShell } from '../../components/fm-shell/fm-shell';
import { PrimaryButton } from '../../../../shared/components/primary-button/primary-button';
import { FinancialManagerService } from '../../services/financial-manager.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FmPendingPoDetails, FmPaymentSummary } from '../../models';

@Component({
  selector: 'app-fm-pending-po-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FmShell, PrimaryButton],
  templateUrl: './pending-po-details.html',
  styleUrl: './pending-po-details.css',
})
export class PendingPoDetails implements OnInit {
  private readonly fmService = inject(FinancialManagerService);
  private readonly toast     = inject(ToastService);
  private readonly route     = inject(ActivatedRoute);
  private readonly router    = inject(Router);

  private poId = 0;

  readonly loadingDetails = signal(true);
  readonly loadingBank    = signal(true);
  readonly errored        = signal(false);
  readonly paying         = signal(false);

  get isLoading(): boolean {
    return this.loadingDetails() || this.loadingBank();
  }

  // GET /api/Finance/pending-po-invoices/{id}
  readonly po   = signal<FmPendingPoDetails | null>(null);
  // GET /api/Finance/{id}/payment-summary
  readonly bank = signal<FmPaymentSummary | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/financial-manager/pending-po-invoices']);
      return;
    }
    this.poId = Number(idParam);

    // Load PO details
    this.fmService.getPendingPoInvoiceDetails(this.poId).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.po.set(result.data);
        } else {
          this.errored.set(true);
          this.toast.error(result.message || 'Could not load PO details.');
        }
        this.loadingDetails.set(false);
      },
      error: (err) => {
        this.loadingDetails.set(false);
        this.errored.set(true);
        this.toast.error(err?.error?.message ?? 'Could not load PO details.');
      },
    });

    // Load Safqa bank account info
    this.fmService.getPaymentSummary(this.poId).subscribe({
      next: (result: any) => {
        const d = result?.data ?? result;
        if (d) this.bank.set(d);
        this.loadingBank.set(false);
      },
      error: () => { this.loadingBank.set(false); },
    });
  }

  // POST /api/Finance/purchase-orders/{id}/pay
  // Response: { data: { paymentUrl, merchantOrderId }, success, message }
  pay(): void {
    if (this.paying()) return;
    this.paying.set(true);

    this.fmService.initiatePayment(this.poId).subscribe({
      next: (result: any) => {
        this.paying.set(false);
        const paymentUrl = result?.data?.paymentUrl;
        if (paymentUrl) {
          // Open Paymob checkout in a new tab
          window.open(paymentUrl, '_blank', 'noopener,noreferrer');
        } else {
          this.toast.error('Payment URL not received. Please try again.');
        }
      },
      error: (err) => {
        this.paying.set(false);
        this.toast.error(err?.error?.message ?? 'Could not initiate payment. Please try again.');
      },
    });
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB');
  }
}
