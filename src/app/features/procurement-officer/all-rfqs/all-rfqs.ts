import { Component, OnInit, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-all-rfqs',
  imports: [CommonModule, RouterModule, ErrorState],
  templateUrl: './all-rfqs.html',
  styleUrl: './all-rfqs.css',
})
export class AllRFQs implements OnInit {
  private readonly rfqService = inject(ProcurementService);
  private readonly cdr = inject(ChangeDetectorRef);

  allRfqs: any[] = [];
  rfqs: any[] = [];
  isLoading = true;
  error: string | null = null;
  showFilter = false;
  pendingFilter: string | null = null;
  activeFilter: string | null = null;

  private statusLabels: { [key: string]: string } = {
    'Draft': 'Draft',
    'SentToVendors': 'Sent to vendors',
    'TurnedToPO': 'Turned to a PO',
  };

  ngOnInit(): void {
    this.rfqService.getRFQs().subscribe({
      next: (res: any) => {
        this.allRfqs = res?.data?.items ?? res?.data ?? res ?? [];
        this.rfqs = [...this.allRfqs];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load RFQs.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleFilter(): void { this.showFilter = !this.showFilter; if (this.showFilter) this.pendingFilter = this.activeFilter; }
  selectFilter(status: string): void { this.pendingFilter = this.pendingFilter === status ? null : status; }

  applyFilter(): void {
    this.activeFilter = this.pendingFilter;
    this.rfqs = this.activeFilter ? this.allRfqs.filter(r => r.status === this.activeFilter) : [...this.allRfqs];
    this.showFilter = false;
    this.cdr.detectChanges();
  }

  resetFilter(): void {
    this.pendingFilter = null; this.activeFilter = null;
    this.rfqs = [...this.allRfqs]; this.showFilter = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('.filter-wrapper')) this.showFilter = false;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  formatStatus(status: string): string { return this.statusLabels[status] ?? status; }
}