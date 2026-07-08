import { Component, OnInit, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-select-vendors',
  imports: [CommonModule, RouterModule, ErrorState],
  templateUrl: './select-vendors.html',
  styleUrl: './select-vendors.css',
})
export class SelectVendors implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rfqService = inject(ProcurementService);
  private readonly cdr = inject(ChangeDetectorRef);

  rfqId: string = '';
  vendors: any[] = [];
  allVendors: any[] = [];
  isLoadingVendors = true;
  vendorsError: string | null = null;
  selectedVendors: Set<number> = new Set();
  isSending = false;
  sendError: string | null = null;
  showSuccess = false;
  showSort = false;
  pendingSort: string | null = null;
  activeSort: string | null = null;

  ngOnInit(): void {
    this.rfqId = this.route.snapshot.paramMap.get('id') ?? '';
    this.rfqService.getEligibleVendors(Number(this.rfqId)).subscribe({
      next: (res: any) => {
        const raw = res?.data?.items ?? res?.data ?? res ?? [];
        this.vendors = (raw as any[]).map(v => ({
          id: v.id ?? v.vendorId,
          name: v.name ?? v.companyName ?? v.vendorName ?? 'Unnamed Vendor',
          fastDelivery: v.fastDelivery ?? v.fastDeliveryRating ?? 0,
          responsive: v.responsive ?? v.responsiveRating ?? 0,
          overallRating: v.overallRating ?? (v.overallRatingPercentage != null ? `${v.overallRatingPercentage}%` : '—'),
        }));
        this.allVendors = [...this.vendors];
        this.isLoadingVendors = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.vendorsError = err?.error?.message ?? 'Failed to load vendors.';
        this.isLoadingVendors = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleVendor(id: number): void { this.selectedVendors.has(id) ? this.selectedVendors.delete(id) : this.selectedVendors.add(id); }
  isSelected(id: number): boolean { return this.selectedVendors.has(id); }
  getStars(count: number): number[] { return Array(5).fill(0).map((_, i) => i < count ? 1 : 0); }

  sendToVendors(): void {
    if (this.selectedVendors.size === 0 || !this.rfqId) return;
    this.isSending = true;
    this.sendError = null;
    this.rfqService.sendRFQToVendors(Number(this.rfqId), Array.from(this.selectedVendors)).subscribe({
      next: () => { this.isSending = false; this.showSuccess = true; this.cdr.detectChanges(); },
      error: (err: any) => {
        this.isSending = false;
        this.sendError = err?.error?.message ?? 'Failed to send RFQ to vendors.';
        this.cdr.detectChanges();
      }
    });
  }

  goToAllRFQs(): void { this.router.navigate(['/procurement-officer/all-rfqs']); }

  toggleSort(): void { this.showSort = !this.showSort; if (this.showSort) this.pendingSort = this.activeSort; }
  selectSort(key: string): void { this.pendingSort = this.pendingSort === key ? null : key; }

  applySort(): void {
    this.activeSort = this.pendingSort;
    if (this.activeSort === 'fastDelivery') this.vendors = [...this.allVendors].sort((a, b) => b.fastDelivery - a.fastDelivery);
    else if (this.activeSort === 'responsive') this.vendors = [...this.allVendors].sort((a, b) => b.responsive - a.responsive);
    else this.vendors = [...this.allVendors];
    this.showSort = false; this.cdr.detectChanges();
  }

  resetSort(): void { this.pendingSort = null; this.activeSort = null; this.vendors = [...this.allVendors]; this.showSort = false; this.cdr.detectChanges(); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event): void { if (!(e.target as HTMLElement).closest('.sort-wrapper')) this.showSort = false; }
}