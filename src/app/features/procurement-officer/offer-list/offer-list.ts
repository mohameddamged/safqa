import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './offer-list.html',
  styleUrl: './offer-list.css',
})
export class OfferList implements OnInit {
  private readonly route       = inject(ActivatedRoute);
  private readonly procService = inject(ProcurementService);
  private readonly cdr         = inject(ChangeDetectorRef);

  rfqId    = 0;
  rfqTitle = '';
  offers: any[] = [];
  isLoading    = true;
  error: string | null = null;
  openMenuId: number | null = null;

  // ── AI Offer Comparison ───────────────────────────────────────
  comparison: any   = null;
  isComparing       = false;
  showComparison    = false;
  comparisonError: string | null = null;

  toggleMenu(id: number): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuId = null;
  }

  ngOnInit(): void {
    this.rfqId = Number(this.route.snapshot.paramMap.get('rfqId'));
    this.loadOffers();
  }

  loadOffers(): void {
    this.procService.getOffersByRFQ(this.rfqId).subscribe({
      next: (res: any) => {
        this.rfqTitle = res?.data?.rfqTitle ?? '';
        this.offers   = res?.data?.items ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error     = 'Failed to load offers.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── AI Compare Offers ─────────────────────────────────────────
  // OfferComparisonDto: { recommendedVendorId, recommendedVendorName, summary, vendors[] }
  // OfferComparisonItemDto: { vendorId, vendorName, procurementScore, matchingScore, topRating, pros[], cons[] }
  compareOffers(): void {
    if (this.isComparing) return;
    this.isComparing      = true;
    this.comparisonError  = null;
    this.showComparison   = false;

    this.procService.getOfferComparison(this.rfqId).subscribe({
      next: (res: any) => {
        this.comparison    = res?.data ?? null;
        this.isComparing   = false;
        this.showComparison = !!this.comparison;
        this.cdr.detectChanges();
      },
      error: () => {
        this.comparisonError = 'Failed to load AI comparison.';
        this.isComparing     = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeComparison(): void {
    this.showComparison = false;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  // RFQVendorOfferStatus: Draft | Submitted | Accepted | Rejected
  getStatusClass(status: string): string {
    switch (status) {
      case 'Accepted':  return 'badge-green';
      case 'Submitted': return 'badge-yellow';
      case 'Rejected':  return 'badge-red';
      case 'Draft':     return 'badge-gray';
      default:          return 'badge-gray';
    }
  }

  isRecommended(vendorId: number): boolean {
    return this.comparison?.recommendedVendorId === vendorId;
  }
}
