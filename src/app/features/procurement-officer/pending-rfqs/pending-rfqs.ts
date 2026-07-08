import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProcurementService } from '../services/procurement.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-rfqs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-rfqs.html',
  styleUrl: './pending-rfqs.css',
})
export class PendingRFQs implements OnInit {
  private readonly router = inject(Router);
  private readonly procService = inject(ProcurementService);
  private readonly cdr = inject(ChangeDetectorRef);

  goToDetails(pr: any): void {
  this.router.navigate(
    ['/procurement-officer/pr', pr.id, 'details'],
    { state: { pr } }
  );
}

  rfqs: any[] = [];
  isLoading = true;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.isLoading = true;
    this.procService.getPendingPRs(page,this.pageSize).subscribe({
      next: (res: any) => {
        this.rfqs = res?.data?.items ?? res?.data ?? [];
        this.totalPages = res?.data?.totalPages ?? 1;
        this.currentPage = page;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load purchase requests.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.loadPage(this.currentPage + 1);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.loadPage(this.currentPage - 1);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }
}