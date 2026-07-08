import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProcurementService } from '../../procurement-officer/services/procurement.service';


@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './offer-details.html',
  styleUrl: './offer-details.css',
})
export class OfferDetails implements OnInit {
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly procService = inject(ProcurementService);
  private readonly cdr         = inject(ChangeDetectorRef);

  rfqId   = 0;
  offerId = 0;
  offer: any = null;
  isLoading   = true;
  error: string | null = null;

  isAccepting  = false;
  isRejecting  = false;
  actionError: string | null = null;
  actionSuccess: string | null = null;

  vendorPerf: any = null;
  isPerfLoading  = false;
  showPerfPanel  = false;

  ngOnInit(): void {
    this.offerId = Number(this.route.snapshot.paramMap.get('offerId'));
    this.rfqId   = Number(this.route.snapshot.paramMap.get('rfqId') ?? 0);
    this.loadOffer();
  }

  loadOffer(): void {
    // لو عندنا rfqId استخدم endpoint العادي
    // لو مفيش rfqId (جاي من vendor-offers list) — نجيب offer بـ offerId فقط
    // في الحالتين الـ response بيرجع rfqId في الـ data
    if (this.rfqId) {
      this.procService.getOfferById(this.rfqId, this.offerId).subscribe({
        next: (res: any) => this.handleOfferResponse(res),
        error: () => this.handleOfferError()
      });
    } else {
      // نجيب الـ offer list عشان نلاقي الـ rfqId
      // بنستخدم GET /api/Procurement وبنفلتر بـ offerId
      this.procService.getRFQsWithOffers(1, 100).subscribe({
        next: (res: any) => {
          const items = res?.data?.items ?? [];
          const found = items.find((o: any) => o.offerId === this.offerId);
          if (found?.rfqId) {
            this.rfqId = found.rfqId;
            this.procService.getOfferById(this.rfqId, this.offerId).subscribe({
              next: (r: any) => this.handleOfferResponse(r),
              error: () => this.handleOfferError()
            });
          } else {
            this.handleOfferError();
          }
        },
        error: () => this.handleOfferError()
      });
    }
  }

  private handleOfferResponse(res: any): void {
    this.offer = res?.data ?? res;
    // الـ response بيرجع rfqId — نحفظه
    if (this.offer?.rfqId) this.rfqId = this.offer.rfqId;
    this.isLoading = false;
    this.cdr.detectChanges();
    if (this.offer?.vendorId) this.loadVendorPerformance(this.offer.vendorId);
  }

  private handleOfferError(): void {
    this.error     = 'Failed to load offer details.';
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  loadVendorPerformance(vendorId: number): void {
    this.isPerfLoading = true;
    this.procService.getVendorPerformance(vendorId).subscribe({
      next: (res: any) => {
        this.vendorPerf    = res?.data ?? null;
        this.isPerfLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isPerfLoading = false; this.cdr.detectChanges(); }
    });
  }

  togglePerfPanel(): void { this.showPerfPanel = !this.showPerfPanel; }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  get canAct(): boolean { return this.offer?.status === 'Submitted'; }

  get isUnderNegotiation(): boolean {
    const n = this.offer?.negotiation ?? 'NotNegotiated';
    return n !== 'NotNegotiated' && n !== '' && n !== null;
  }

  accept(): void {
    if (this.isAccepting) return;
    this.isAccepting = true;
    this.actionError = null;
    this.procService.acceptOffer(this.offerId).subscribe({
      next: () => {
        this.isAccepting   = false;
        this.actionSuccess = 'Offer accepted! A Purchase Order has been created.';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/procurement-officer/po-list']), 2000);
      },
      error: (err: any) => {
        this.isAccepting = false;
        this.actionError = err?.error?.message ?? 'Failed to accept offer.';
        this.cdr.detectChanges();
      }
    });
  }

  reject(): void {
    if (this.isRejecting) return;
    this.isRejecting = true;
    this.actionError = null;
    this.procService.rejectOffer(this.offerId).subscribe({
      next: () => {
        this.isRejecting   = false;
        this.actionSuccess = 'Offer rejected.';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/procurement-officer/vendor-offers']), 2000);
      },
      error: (err: any) => {
        this.isRejecting = false;
        this.actionError = err?.error?.message ?? 'Failed to reject offer.';
        this.cdr.detectChanges();
      }
    });
  }

  goToNegotiate(): void {
    if (this.rfqId) {
      this.router.navigate([
        '/procurement-officer/vendor-offers', this.rfqId, 'offers', this.offerId, 'negotiate'
      ]);
    } else {
      this.router.navigate([
        '/procurement-officer/vendor-offers/offer', this.offerId, 'negotiate'
      ]);
    }
  }
}