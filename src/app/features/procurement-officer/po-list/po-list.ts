import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './po-list.html',
  styleUrl: './po-list.css',
})
export class PoList implements OnInit {
  private readonly rfqService = inject(ProcurementService);
  private readonly cdr = inject(ChangeDetectorRef);

  pos: any[] = [];
  allPos: any[] = [];
  isLoading = true;
  error: string | null = null;
  showFilter = false;
  pendingFilter: string | null = null;
  activeFilter: string | null = null;

  ngOnInit(): void {
    this.rfqService.getPurchaseOrders().subscribe({
      next: (res: any) => {
        this.allPos = res?.data?.items ?? res?.data ?? res ?? [];
        this.pos = [...this.allPos];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load purchase orders.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    if (this.showFilter) this.pendingFilter = this.activeFilter;
  }

  selectFilter(status: string): void {
    this.pendingFilter = this.pendingFilter === status ? null : status;
  }

  applyFilter(): void {
    this.activeFilter = this.pendingFilter;
    this.pos = this.activeFilter
      ? this.allPos.filter(p => p.status?.toLowerCase().includes(this.activeFilter!.toLowerCase()))
      : [...this.allPos];
    this.showFilter = false;
    this.cdr.detectChanges();
  }

  resetFilter(): void {
    this.pendingFilter = null;
    this.activeFilter = null;
    this.pos = [...this.allPos];
    this.showFilter = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:click')
  closeFilter(): void { this.showFilter = false; }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  getStatusClass(status: string): string {
    if (!status) return 'badge-gray';
    const s = status.toLowerCase();
    if (s.includes('accept') || s.includes('vendor')) return 'badge-green';
    if (s.includes('reject') || s.includes('safqa')) return 'badge-red';
    if (s.includes('pending') || s.includes('finance')) return 'badge-yellow';
    return 'badge-gray';
  }
}