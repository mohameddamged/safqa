import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-procurement-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './procurement-officer-dashboard.html',
  styleUrl: './procurement-officer-dashboard.css',
})
export class ProcurementOfficerDashboard implements OnInit {
  private readonly rfqService = inject(ProcurementService);
  private readonly cdr = inject(ChangeDetectorRef);

  pendingPrsCount = 0;
  pendingOffersCount = 0;
  activeRfqsCount = 0;
  negotiationSavings = 0;
  isLoading = true;

  topVendors: { name: string; color: string; percentage: number }[] = [];

  readonly COLORS = ['#EFA063', '#25B6AB', '#E779F1'];

  readonly DUMMY_VENDORS = [
    { name: 'Vendor 1', color: '#EFA063', percentage: 45 },
    { name: 'Vendor 2', color: '#25B6AB', percentage: 35 },
    { name: 'Vendor 3', color: '#E779F1', percentage: 20 },
  ];

  ngOnInit(): void {
    // Set dummy vendors immediately so chart shows
    this.topVendors = [...this.DUMMY_VENDORS];

    this.rfqService.getPendingPRs().subscribe({
      next: (res: any) => {
        this.pendingPrsCount = res?.data?.totalCount ?? res?.data?.length ?? 0;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.rfqService.getRFQsWithOffers().subscribe({
      next: (res: any) => {
        this.pendingOffersCount = res?.data?.totalCount ?? res?.data?.items?.length ?? 0;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.rfqService.getRFQs().subscribe({
      next: (res: any) => {
        this.activeRfqsCount = res?.data?.totalCount ?? res?.data?.items?.length ?? 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

this.rfqService.getPurchaseOrders().subscribe({
  next: (res: any) => {
    const items: any[] = res?.data?.items ?? [];
    const vendorMap = new Map<string, number>();
    items.forEach(po => {
      const name = po.vendorName;
      if (name && name.trim() !== '') {
        vendorMap.set(name, (vendorMap.get(name) ?? 0) + 1);
      }
    });
    if (vendorMap.size > 0) {
      const sorted = [...vendorMap.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 3);
      const total = sorted.reduce((s, [, c]) => s + c, 0) || 1;
      this.topVendors = sorted.map(([name, count], i) => ({
        name,
        color: this.COLORS[i],
        percentage: Math.round((count / total) * 100),
      }));
    }
    // else: keep dummy vendors
    this.cdr.detectChanges();
  },
  error: () => {}
});
  }

  getSegmentOffset(index: number): number {
    const circumference = 439.82;
    const prior = this.topVendors
      .slice(0, index)
      .reduce((sum, v) => sum + v.percentage, 0);
    return circumference * 0.25 - (prior / 100) * circumference;
  }
}