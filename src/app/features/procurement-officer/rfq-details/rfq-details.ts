import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-rfq-details',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rfq-details.html',
  styleUrl: './rfq-details.css',
})
export class RFQDetails implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly rfqService = inject(ProcurementService);
  private readonly cdr        = inject(ChangeDetectorRef);

  rfq: any = null;
  isLoading = true;
  error: string | null = null;

  // ── Convert-to-RFQ modal ─────────────────────────────────────────
  showModal     = false;
  closingDate   = '';
  notesToVendors = '';
  isSubmitting  = false;
  submitError: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Try router state first (instant — no API call)
    const statePr = history.state?.pr;
    if (statePr && statePr.id === id) {
      this.rfq = statePr;
      this.isLoading = false;
      return;
    }

    // Fallback: fetch from API (on page refresh)
    this.rfqService.getPRById(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.rfq = res?.data ?? res;
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Failed to load PR details.';
      },
    });
  }

  // ── Modal helpers ────────────────────────────────────────────────
  openModal(): void {
    this.closingDate    = '';
    this.notesToVendors = '';
    this.submitError    = null;
    this.showModal      = true;
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.showModal = false;
  }

  submitConvert(): void {
    if (!this.closingDate || this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitError  = null;

    const body = {
      closingDate:    new Date(this.closingDate).toISOString(),
      notesToVendors: this.notesToVendors || '',
    };

    this.rfqService.convertToRFQ(this.rfq.id, body).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showModal    = false;
        this.router.navigate(['/procurement-officer/all-rfqs']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.submitError  = err?.error?.message ?? 'Failed to convert to RFQ. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }
}
