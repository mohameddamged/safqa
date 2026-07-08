import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {
  InvoicesService,
  VendorInvoice,
  VendorInvoiceDetails,
} from '../../../core/services/Vendor-Admin/invoices.service';

@Component({
  selector: 'app-invoice-po-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-po-details.component.html',
  styleUrls: ['./invoice-po-details.component.css'],
})
export class InvoicePoDetailsComponent implements OnInit {

  // From list (via router state) — shown immediately
  listInvoice: VendorInvoice | null = null;

  // From GET /api/VendorInvoices/invoices/{purchaseOrderId} — bank + receipt
  details:     VendorInvoiceDetails | null = null;
  isLoading    = false;
  error        = '';

  constructor(
    private readonly route:           ActivatedRoute,
    private readonly router:          Router,
    private readonly invoicesService: InvoicesService,
    private readonly cdr:             ChangeDetectorRef,
    private readonly zone:            NgZone,
  ) {}

  ngOnInit(): void {
    this.listInvoice = history.state?.invoice ?? null;

    const id = this.listInvoice?.purchaseOrderId
      ?? Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Invoice not found.';
      return;
    }

    // GET /api/VendorInvoices/invoices/{purchaseOrderId}
    this.isLoading = true;

    this.invoicesService.getInvoiceDetails(id)
      .pipe(
        // الأب zoneless (Angular 21 default)، فمفيش zone.js يعمل tick تلقائي
        // بعد استجابة الـ HTTP — لازم نستدعي markForCheck() يدويًا وإلا
        // الداتا بتوصل فعلاً بس الشاشة مش بتتحدّث (ده كان سبب الباج).
        finalize(() => {
          this.isLoading = false;
          this.zone.run(() => this.cdr.markForCheck());
        }),
      )
      .subscribe({
        next: (res) => {
          if (res?.success && res?.data) {
            this.details = res.data;
          } else {
            console.warn('[InvoicePoDetails] Unexpected response shape:', res);
          }
        },
        error: (err) => {
          console.error('[InvoicePoDetails] Failed to load invoice details:', err);
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/vendor-admin/Invoices']);
  }
}
