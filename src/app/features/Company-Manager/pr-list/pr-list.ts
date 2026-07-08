import { Component, inject, OnInit, signal } from '@angular/core';
import { PrService } from '../../../core/services/Company-Manager/pr-service';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pr-list',
  imports: [RouterLink,DatePipe],
  templateUrl: './pr-list.html',
  styleUrl: './pr-list.css',
})
export class PrList implements OnInit { 
  private companyService = inject(PrService);
  
  prList = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1); 
  totalPages = signal<number>(1);  

  ngOnInit() {
    this.loadPendingPRs(1);
  }

  loadPendingPRs(page: number) {
    this.isLoading.set(true);
    this.companyService.getPendingPRs(page).subscribe({
      next: (res) => {
        if (res.success) {
          this.prList.set(res.data.items);
          this.totalPages.set(res.data.totalPages); 
          this.currentPage.set(page);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching PRs', err);
        this.isLoading.set(false);
      }
    });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.loadPendingPRs(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.loadPendingPRs(this.currentPage() - 1);
    }
  }
}