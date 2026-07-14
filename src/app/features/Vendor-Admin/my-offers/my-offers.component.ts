import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NegotiationStatus, OfferRecord, OffersService } from '../../../core/services/Vendor-Admin/offers.service';


@Component({
  selector: 'app-my-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-offers.component.html',
  styleUrls: ['./my-offers.component.css']
})
export class MyOffersComponent implements OnInit, OnDestroy {

  offers: OfferRecord[] = [];
  filteredOffers: OfferRecord[] = [];

  filterOpen = false;
  appliedFilter: NegotiationStatus | null = null;
  pendingFilter: NegotiationStatus | null = null;

  private sub!: Subscription;

  constructor(private offersService: OffersService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.offersService.getOffers().subscribe(list => {
      this.offers = list;
      this.applyFilterToList();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private applyFilterToList(): void {
    this.filteredOffers = this.appliedFilter
      ? this.offers.filter(o => o.negotiation === this.appliedFilter)
      : this.offers;
  }

  negotiationLabel(status: NegotiationStatus): string {
    if (status === 'negotiated') return 'Negotiated';
    if (status === 'requested') return 'Requested';
    return 'Not Negotiated';
  }

  /* ── Filter popover ── */
  toggleFilterPopover(event: Event): void {
    event.stopPropagation();
    this.pendingFilter = this.appliedFilter;
    this.filterOpen = !this.filterOpen;
  }

  applyFilter(): void {
    this.appliedFilter = this.pendingFilter;
    this.applyFilterToList();
    this.filterOpen = false;
  }

  resetFilter(): void {
    this.pendingFilter = null;
    this.appliedFilter = null;
    this.applyFilterToList();
    this.filterOpen = false;
  }

  /* ── Row 3-dots menu ── */
  onToggleMenu(offer: OfferRecord, event: Event): void {
    event.stopPropagation();
    const wasOpen = offer.menuOpen;
    this.closeAllMenus();
    if (!wasOpen) {
      const btn = (event.target as HTMLElement).closest('button') as HTMLElement;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        offer.dropUp = spaceBelow < 160;
      }
      offer.menuOpen = true;
    }
  }

  closeAllMenus(): void {
    this.offers.forEach(o => { o.menuOpen = false; o.dropUp = false; });
  }

  onViewRfqDetails(offer: OfferRecord): void {
    offer.menuOpen = false;
    this.router.navigate(['/vendor-admin/rfqs/rfq-details', offer.rfqId]);
  }

  onViewMyOffer(offer: OfferRecord): void {
    offer.menuOpen = false;
    this.router.navigate(['/vendor-admin/rfqs', offer.rfqId, 'apply-offer'], { queryParams: { offerId: offer.id } });
  }

  onViewNegotiationChat(offer: OfferRecord): void {
    if (offer.negotiation !== 'negotiated' && offer.negotiation !== 'requested') return;
    offer.menuOpen = false;
    // offer.id = rfqVendorOfferId (الـ id الحقيقي للـ offer المستخدم في Chat/AiChat APIs)
    this.router.navigate(['/vendor-admin/my-offers/NegotiationChat', offer.id], { state: { offer } });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllMenus();
    this.filterOpen = false;
  }
}
