import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  DepartmentManagerService,
  PurchaseOrder,
} from '../../../../core/services/department-manager/allpos-service';

@Component({
  selector: 'app-delivered-pos',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './delivered-pos.html',
  styleUrl: './delivered-pos.css',
})
export class DeliveredPos implements OnInit {
  deliveredPOs: PurchaseOrder[] = [];

  pageNumber  = 1;
  pageSize    = 10;
  totalCount  = 0;
  totalPages  = 0;

  isLoading    = false;
  errorMessage = '';

  constructor(
    private readonly router:    Router,
    private readonly dmService: DepartmentManagerService,
  ) {}

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  // GET /api/DepartmentManager/company/purchase-orders
  loadPurchaseOrders(): void {
    this.isLoading    = true;
    this.errorMessage = '';

    this.dmService.getPurchaseOrders(this.pageNumber, this.pageSize)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.deliveredPOs = res.data.items;
            this.totalCount   = res.data.totalCount;
            this.totalPages   = res.data.totalPages;
          }
        },
        error: (err) => {
          this.errorMessage = err.status === 404
            ? 'Company not found.'
            : 'Failed to load purchase orders.';
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadPurchaseOrders();
  }

  viewDetails(po: PurchaseOrder): void {
    this.router.navigate(
      ['/department-manager/delivered-pos', po.id],
      { state: { po } },
    );
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB');
  }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase() ?? '';
    if (s.includes('delivered')) return 'status-delivered';
    if (s.includes('pending'))   return 'status-pending';
    if (s.includes('cancel'))    return 'status-cancelled';
    return 'status-default';
  }
}
