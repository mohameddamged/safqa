import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProcurementService } from '../services/procurement.service';

@Component({
  selector: 'app-additional-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './additional-details.html',
  styleUrl: './additional-details.css',
})
export class AdditionalDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly procService = inject(ProcurementService);
  private readonly cdr = inject(ChangeDetectorRef);

  rfqId!: number;
  rfq: any = null;
  rfqTitle = '';
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
   submitError: string | null = null;

  closingDate = '';
  notesToVendors = '';
  deliveryDeadline = '';
  paymentMethod = '';
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.rfqId = Number(this.route.snapshot.paramMap.get('id'));
    this.procService.getRFQById(this.rfqId).subscribe({
      next: (res: any) => {
        this.rfq = res?.data ?? res;
        this.rfqTitle = this.rfq?.title ?? this.rfq?.itemName ?? '';
        this.closingDate = this.rfq?.closingDate
          ? new Date(this.rfq.closingDate).toISOString().split('T')[0] : '';
        this.notesToVendors = this.rfq?.notesToVendors ?? '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load RFQ.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  triggerFileUpload(): void {
    document.getElementById('fileInput')?.click();
  }

submit(): void {
  if (!this.closingDate) return;
  this.isSubmitting = true;
  this.submitError = null;

  this.procService.convertToRFQ(this.rfqId, {
    closingDate: this.closingDate,
    notesToVendors: this.notesToVendors,
  }).subscribe({
    next: () => {
      this.isSubmitting = false;
      this.router.navigate(['/procurement-officer/rfq', this.rfqId, 'select-vendors']);
    },
    error: (err: any) => {
      this.isSubmitting = false;
      this.submitError = err?.error?.message ?? 'Failed to convert to RFQ.';
      this.cdr.detectChanges();
    }
  });

  }
}