import { Component, OnInit, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VendorPoListItem, VendorPoService } from '../../../core/services/Vendor-Admin/vendor-po.service';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent implements OnInit {

  pos: VendorPoListItem[] = [];

  loading = false;
  errorMessage = '';

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  constructor(
    private poService: VendorPoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadPOs();
  }

  loadPOs(): void {
    this.loading = true;
    this.errorMessage = '';

    this.poService.getPOs(this.pageNumber, this.pageSize)
      .pipe(
        // Guarantees loading is always turned off (success, error, or
        // early teardown), and forces Angular to re-render even if the
        // response arrived outside the zone Angular is tracking
        // (3rd-party scripts/widgets on the page — e.g. the "Ask AI"
        // chat widget — can monkey-patch XHR/fetch after zone.js does
        // and silently break automatic change detection).
        finalize(() => {
          this.loading = false;
          this.zone.run(() => this.cdr.markForCheck());
        })
      )
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            try {
              this.pos = res?.data?.items ?? [];
              this.pageNumber = res?.data?.pageNumber ?? this.pageNumber;
              this.pageSize = res?.data?.pageSize ?? this.pageSize;
              this.totalCount = res?.data?.totalCount ?? 0;
              this.totalPages = res?.data?.totalPages ?? 0;
            } catch (e) {
              console.error('Failed to parse purchase orders response', e, res);
              this.errorMessage = 'حدث خطأ أثناء معالجة بيانات طلبات الشراء';
            }
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error('Failed to load purchase orders', err);
            this.errorMessage = err?.name === 'TimeoutError'
              ? 'السيرفر بياخد وقت طويل جدًا في الرد. حاول تاني بعد شوية.'
              : 'حدث خطأ أثناء تحميل طلبات الشراء';
            this.cdr.markForCheck();
          });
        }
      });
  }

  /* ── Display helpers ── */
  statusLabel(status: string): string {
    if (!status) return '-';
    return status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  statusClass(status: string): string {
    return 'po-badge-' + (status || '').toLowerCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr || dateStr.startsWith('0001-01-01')) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB');
  }

  /* ── Row 3-dots menu ── */
  onToggleMenu(po: VendorPoListItem, event: Event): void {
    event.stopPropagation();
    const wasOpen = po.menuOpen;
    this.closeAllMenus();
    if (!wasOpen) {
      const btn = (event.target as HTMLElement).closest('button') as HTMLElement;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        po.dropUp = spaceBelow < 120;
      }
      po.menuOpen = true;
    }
  }

  closeAllMenus(): void {
    this.pos.forEach(p => { p.menuOpen = false; p.dropUp = false; });
  }

  onViewPoDetails(po: VendorPoListItem): void {
    po.menuOpen = false;
    this.router.navigate(['/vendor-admin/purchase-orders/podetailsC', po.id]);
  }

  onPoTracking(po: VendorPoListItem): void {
    po.menuOpen = false;
    // "type" is passed for future use once tracking has its own backend
    // endpoint (e.g. to distinguish tracking flows per PO status).
    this.router.navigate(['/vendor-admin/purchase-orders/po-tracking', po.id, po.status || 'default']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllMenus();
  }

  /* ── Pagination ── */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageNumber || this.loading) return;
    this.pageNumber = page;
    this.loadPOs();
  }
}
