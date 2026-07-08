import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgStyle } from '@angular/common';
import { EscrowService } from '../../../../core/services/System-Admin/escrow-service/escrow-service';

@Component({
  selector: 'app-safqa-payments',
  imports: [RouterLink, NgStyle],
  templateUrl: './safqa-payments.html',
  styleUrl: './safqa-payments.css',
})
export class SafqaPayments implements OnInit {
  items = signal<any[]>([]);
  isLoading = signal(true);

  currentStatus = signal<string>('');
  selectedStatus = '';
  isFilterOpen = false;

  constructor(private escrowService: EscrowService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.escrowService
      .getSafqaPayments({
        status: this.currentStatus() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res?.data ?? []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() > 1;
  }

  // بيرجع التاريخ بس من غير الوقت، مثال: 2026-07-06
  formatDate(dateStr: string): string {
    if (!this.isValidDate(dateStr)) return '—';
    return dateStr.split('T')[0];
  }

  applyFilter() {
    this.isFilterOpen = false;
    this.currentStatus.set(this.selectedStatus);
    this.loadData();
  }

  resetFilter() {
    this.selectedStatus = '';
    this.currentStatus.set('');
    this.isFilterOpen = false;
    this.loadData();
  }

  statusStyle(status: string) {
    const isPaid = status === 'Paid' || status === 'Transferred';
    return {
      'background-color': isPaid ? '#DBFFDD' : status === 'Pending' ? '#FCF1ED' : status === 'Rejected' ? '#FEDCDD' : '#E5E7EB',
      color: isPaid ? '#00B209' : status === 'Pending' ? '#E47C55' : status === 'Rejected' ? '#FC161A' : '#6B7280',
    };
  }
}
