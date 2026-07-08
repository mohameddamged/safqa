import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NegotiationStatus, OfferRecord, OffersService } from '../../../core/services/Vendor-Admin/offers.service';


@Component({
  selector: 'app-drafts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drafts.component.html',
  styleUrls: ['./drafts.component.css']
})
export class DraftsComponent implements OnInit, OnDestroy {

  drafts: OfferRecord[] = [];
  filteredDrafts: OfferRecord[] = [];

  filterOpen = false;
  appliedFilter: NegotiationStatus | null = null;
  pendingFilter: NegotiationStatus | null = null;

  private sub!: Subscription;

  constructor(private offersService: OffersService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.offersService.getDrafts().subscribe(list => {
      this.drafts = list;
      this.applyFilterToList();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private applyFilterToList(): void {
    this.filteredDrafts = this.appliedFilter
      ? this.drafts.filter(d => d.negotiation === this.appliedFilter)
      : this.drafts;
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
  onToggleMenu(draft: OfferRecord, event: Event): void {
    event.stopPropagation();
    const wasOpen = draft.menuOpen;
    this.closeAllMenus();
    if (!wasOpen) {
      const btn = (event.target as HTMLElement).closest('button') as HTMLElement;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        draft.dropUp = spaceBelow < 160;
      }
      draft.menuOpen = true;
    }
  }

  closeAllMenus(): void {
    this.drafts.forEach(d => { d.menuOpen = false; d.dropUp = false; });
  }

  onViewRfqDetails(draft: OfferRecord): void {
    draft.menuOpen = false;
    this.router.navigate(['/vendor-admin/rfqs/rfq-details', draft.rfqId]);
  }

  onEditDraft(draft: OfferRecord): void {
    draft.menuOpen = false;
    const navDraft = {
      ...draft,
      status: 'Draft',
      form: draft.form ?? {
        productId: draft.productId ?? 0,
        itemName: draft.productName ?? '',
        category: draft.categoryName ?? '',
        quantity: draft.quantity != null ? String(draft.quantity) : '',
        unit: draft.unit ?? '',
        technicalSpecs: draft.technicalSpecs ?? '',
        additionalNotes: draft.additionalNotes ?? '',
        cost: draft.cost != null ? String(draft.cost) : '',
        currency: draft.currency ?? '',
        offerDeadline: draft.offerDeadline ?? '',
        deliveryDeadline: draft.deliveryDeadline ?? '',
      }
    } as OfferRecord;

    this.router.navigate(['/vendor-admin/rfqs', draft.rfqId, 'apply-offer'], {
      queryParams: { draftId: draft.id },
      state: { draft: navDraft }
    });
  }

  onDeleteDraft(draft: OfferRecord): void {
    draft.menuOpen = false;
    this.offersService.removeDraft(draft);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllMenus();
    this.filterOpen = false;
  }
}
