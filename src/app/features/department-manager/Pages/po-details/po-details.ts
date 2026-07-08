import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  DepartmentManagerService,
  PurchaseOrderDetails,
} from '../../../../core/services/department-manager/allpos-service';

@Component({
  selector: 'app-po-details',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './po-details.html',
  styleUrl: './po-details.css',
})
export class PoDetails implements OnInit {

  po: PurchaseOrderDetails | null = null;
  isLoading  = true;
  error      = '';

  constructor(
    private readonly route:     ActivatedRoute,
    private readonly router:    Router,
    private readonly dmService: DepartmentManagerService,
  ) {}

  ngOnInit(): void {
    // Try router state first (passed from list — instant, no API call)
    const state = history.state?.po as PurchaseOrderDetails | undefined;
    if (state?.id) {
      this.po        = state;
      this.isLoading = false;
      this.fetchDetails(state.id);
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.fetchDetails(id);
    } else {
      this.error     = 'Purchase order not found.';
      this.isLoading = false;
    }
  }

  // GET /api/DepartmentManager/purchase-orders/{purchaseOrderId}
  private fetchDetails(id: number): void {
    this.dmService.getPurchaseOrderById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.po = res.data;
        } else if (!this.po) {
          this.error = res.message || 'Failed to load purchase order details.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (!this.po) {
          this.error = err?.status === 404
            ? 'Purchase order not found.'
            : 'Failed to load purchase order details.';
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/department-manager/delivered-pos']);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
  }
}