import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-rfq-update',
  imports: [CommonModule, RouterModule, FormsModule, ErrorState],
  templateUrl: './rfq-update.html',
  styleUrl: './rfq-update.css',
})
export class RfqUpdate implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rfqService = inject(ProcurementService);
  private readonly cdr = inject(ChangeDetectorRef);

  rfq: any = null;
  rfqId!: number;
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
  submitError: string | null = null;
  closingDate: string = '';
  notesToVendor: string = '';

  ngOnInit(): void {
    this.rfqId = Number(this.route.snapshot.paramMap.get('id'));
    this.rfqService.getRFQById(this.rfqId).subscribe({
      next: (res: any) => {
        this.rfq = res?.data ?? res;
        this.closingDate = this.rfq?.closingDate
          ? new Date(this.rfq.closingDate).toISOString().split('T')[0]
          : '';
        this.notesToVendor = this.rfq?.notesToVendors ?? this.rfq?.notesToVendor ?? '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load RFQ details.';
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

  get isDraft(): boolean {
    return this.rfq?.status === 'Draft';
  }

  submit(): void {
    if (!this.closingDate) return;
    this.isSubmitting = true;
    this.submitError = null;
    this.rfqService.updateRFQ(this.rfqId, {
      closingDate: this.closingDate,
      notesToVendors: this.notesToVendor,
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
       
this.router.navigate(['/procurement-officer/rfq', this.rfqId, 'select-vendors']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message ?? 'Something went wrong. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}