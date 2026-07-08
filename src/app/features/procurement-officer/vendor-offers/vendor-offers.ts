import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-vendor-offers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vendor-offers.html',
  styleUrl: './vendor-offers.css',
})
export class VendorOffers implements OnInit {
  private readonly procService = inject(ProcurementService);
  private readonly cdr         = inject(ChangeDetectorRef);

  offers: any[] = [];
  isLoading     = true;
  error: string | null = null;
  currentPage   = 1;
  totalPages    = 1;

  ngOnInit(): void { this.loadPage(1); }

  loadPage(page: number): void {
    this.isLoading = true;
    this.procService.getRFQsWithOffers(page, 10).subscribe({
      next: (res: any) => {
        this.offers      = res?.data?.items ?? res?.data ?? [];
        this.totalPages  = res?.data?.totalPages ?? 1;
        this.currentPage = page;
        this.isLoading   = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error     = 'Failed to load vendor offers.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  getStatusClass(negotiation: string): string {
    switch (negotiation) {
      case 'Negotiated':    return 'badge-green';
      case 'Requested':     return 'badge-yellow';
      case 'NotNegotiated': return 'badge-gray';
      default:              return 'badge-gray';
    }
  }

  nextPage(): void { if (this.currentPage < this.totalPages) this.loadPage(this.currentPage + 1); }
  prevPage(): void { if (this.currentPage > 1) this.loadPage(this.currentPage - 1); }
}