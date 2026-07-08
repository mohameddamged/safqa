import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgStyle } from '@angular/common';
import { EscrowService } from '../../../../core/services/System-Admin/escrow-service/escrow-service';

@Component({
  selector: 'app-escrow-companies',
  imports: [RouterLink, NgStyle, DatePipe],
  templateUrl: './escrow-companies.html',
  styleUrl: './escrow-companies.css',
})
export class EscrowCompanies implements OnInit {
  items = signal<any[]>([]);
  isLoading = signal(true);

  currentStatus = signal<string>('');
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  selectedStatus = '';
  isFilterOpen = false;

  constructor(private escrowService: EscrowService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.escrowService
      .getEscrowList({
        status: this.currentStatus() || undefined,
        page: this.currentPage(),
        pageSize: 10,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.data.items);
          this.totalPages.set(res.data.totalPages || 1);
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

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadData();
    }
  }

  applyFilter() {
    this.isFilterOpen = false;
    this.currentStatus.set(this.selectedStatus);
    this.currentPage.set(1);
    this.loadData();
  }

  resetFilter() {
    this.selectedStatus = '';
    this.currentStatus.set('');
    this.isFilterOpen = false;
    this.currentPage.set(1);
    this.loadData();
  }
}
