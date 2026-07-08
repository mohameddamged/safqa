import { Component, OnInit, signal } from '@angular/core';
import { AdminService } from '../../../../core/services/admin-service';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-vendor-list',
  imports: [RouterLink, NgStyle, DatePipe],
  templateUrl: './vendor-list.html',
  styleUrl: './vendor-list.css',
})
export class VendorList implements OnInit {
  items = signal<any[]>([]);
  isLoading = signal(true);
  currentStatus = signal<string>('');
  currentSearch = signal<string>('');
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  selectedStatus = '';
  isFilterOpen = false;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    const params = {
      status: this.currentStatus() || undefined,
      searchTerm: this.currentSearch() || undefined,
      page: this.currentPage(),
      pageSize: 10
    };

    this.adminService.getList('vendors', params).subscribe({
      next: (res) => {
        this.items.set(res.data.items);
        this.totalPages.set(res.data.totalPages || 1);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
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
