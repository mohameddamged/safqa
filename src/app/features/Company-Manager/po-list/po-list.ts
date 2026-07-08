import { Component, HostListener, inject, OnInit, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PoService } from '../../../core/services/Company-Manager/PoService/po-service';

@Component({
  selector: 'app-po-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './po-list.html',
  styleUrl: './po-list.css',
})
export class PoList implements OnInit {
  private poService = inject(PoService);

  poList = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  
  currentStatus = ''; 
  activeMenuId = signal<number | null>(null);

  ngOnInit() {
    this.loadPurchaseOrders(1);
  }

  loadPurchaseOrders(page: number) {
    this.isLoading.set(true);
    this.poService.getAllPurchaseOrders(page, 10, this.currentStatus).subscribe({
      next: (res) => {
        if (res.success || res.data) { 
          this.poList.set(res.data.items);
          this.totalPages.set(res.data.totalPages);
          this.currentPage.set(page);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching POs', err);
        this.isLoading.set(false);
      }
    });
  }

  toggleMenu(id: number, event: Event) {
  event.stopPropagation(); 
  this.activeMenuId.set(this.activeMenuId() === id ? null : id);
}

@HostListener('document:click')
closeMenu() {
  this.activeMenuId.set(null);
}
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.loadPurchaseOrders(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.loadPurchaseOrders(this.currentPage() - 1);
    }
  }
}