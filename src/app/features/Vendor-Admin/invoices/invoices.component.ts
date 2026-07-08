import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  InvoicesService,
  VendorInvoice,
} from '../../../core/services/Vendor-Admin/invoices.service';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
})
export class InvoicesComponent implements OnInit {

  invoices: VendorInvoice[] = [];
  isLoading = true;
  error     = '';
  openMenuId: number | null = null;

  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    // GET /api/VendorInvoices
    this.invoicesService.getInvoices().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.invoices  = res?.data ?? [];
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load invoices. Please try again.';
      },
    });
  }

  toggleMenu(inv: VendorInvoice): void {
    this.openMenuId = this.openMenuId === inv.purchaseOrderId ? null : inv.purchaseOrderId;
  }

  closeMenus(): void { this.openMenuId = null; }

  isMenuOpen(inv: VendorInvoice): boolean {
    return this.openMenuId === inv.purchaseOrderId;
  }

  onViewPoDetails(inv: VendorInvoice): void {
    this.openMenuId = null;
    this.router.navigate(
      ['/vendor-admin/invoices/InvoicePoDetails', inv.purchaseOrderId, 'po-details'],
      { state: { invoice: inv } },
    );
  }
}
