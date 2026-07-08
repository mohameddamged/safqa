import { Component, OnInit, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiRfqItem, RfqsService } from '../../../core/services/Vendor-Admin/rfqs.service';

export type RfqStatus = 'negotiated' | 'requested';

export interface RfqItem {
  id: string;
  title: string;
  company: string;
  deadlineDate: Date;
  status: RfqStatus;
  menuOpen: boolean;
  dropUp: boolean;
}

@Component({
  selector: 'app-rfqs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rfqs.component.html',
  styleUrls: ['./rfqs.component.css']
})
export class RfqsComponent implements OnInit {

  today = new Date();

  rfqs: RfqItem[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private el: ElementRef,
    private rfqsService: RfqsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchRfqs();
  }

  fetchRfqs(): void {
    this.loading = true;
    this.errorMessage = '';

    this.rfqsService.getMyRfqs().subscribe({
      next: (res) => {
        this.loading = false;

        const rawItems: ApiRfqItem[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res.data as any)?.items)
            ? (res.data as any).items
            : [];

        if (!res.success && rawItems.length === 0) {
          this.errorMessage = res.message || 'Failed to load RFQs.';
          this.rfqs = [];
          return;
        }

        this.rfqs = rawItems.map((item: ApiRfqItem) => ({
          id: String(item.rfqId),
          title: item.rfqTitle,
          company: item.companyName,
          deadlineDate: new Date(item.rfqDeadline),
          status: 'requested' as RfqStatus, // API doesn't return status yet
          menuOpen: false,
          dropUp: false
        }));

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.rfqs = [];
        this.errorMessage = err?.status === 401
          ? 'Your session has expired. Please log in again.'
          : 'Something went wrong while loading RFQs.';
      }
    });
  }

  formatDeadline(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  onToggleMenu(rfq: RfqItem, event: Event): void {
    event.stopPropagation();
    const wasOpen = rfq.menuOpen;
    this.closeAllMenus();
    if (!wasOpen) {
      const btn = (event.target as HTMLElement).closest('button') as HTMLElement;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        rfq.dropUp = spaceBelow < 120;
      }
      rfq.menuOpen = true;
    }
  }

  closeAllMenus(): void {
    this.rfqs.forEach(r => { r.menuOpen = false; r.dropUp = false; });
  }

  onViewRfqDetails(rfq: RfqItem): void {
    rfq.menuOpen = false;
    this.router.navigate(['/vendor-admin/rfqs/rfq-details', rfq.id]);
  }

  onViewNegotiationChat(rfq: RfqItem): void {
    rfq.menuOpen = false;
  }

  onJoinNegotiationChat(rfq: RfqItem): void {
    rfq.menuOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllMenus();
  }
}
