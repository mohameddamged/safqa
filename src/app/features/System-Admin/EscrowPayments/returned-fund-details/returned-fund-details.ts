import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgStyle } from '@angular/common';
import { EscrowService } from '../../../../core/services/System-Admin/escrow-service/escrow-service';
import { CompanyReturnedFundDto } from '../returned-funds/returned-funds';

export interface RejectedPurchaseOrderDetailsDto {
  purchaseOrderId:      number;
  cost:                 number;
  currency:             string | null;
  companyLegalName:     string | null;
  iban:                 string | null;
  bankName:             string | null;
  accountNumber:        string | null;
  transactionStatus:    string | null;
  returnReceiptImageUrl: string | null;
}

@Component({
  selector:    'app-returned-fund-details',
  standalone:  true,
  imports:     [RouterLink, DatePipe, NgStyle],
  templateUrl: './returned-fund-details.html',
  styleUrl:    './returned-fund-details.css',
})
export class ReturnedFundDetails implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  poId!: number;

  // List data passed via router state
  listItem = signal<CompanyReturnedFundDto | null>(null);

  // Details from GET /api/SystemAdmin/returned-funds/{purchaseOrderId}
  data      = signal<RejectedPurchaseOrderDetailsDto | null>(null);
  isLoading = signal(true);

  // Receipt upload state
  selectedFile:    File | null = null;
  previewUrl:      string | null = null;
  isUploading      = signal(false);
  uploadSuccess    = signal(false);
  uploadError      = signal('');

  constructor(
    private readonly route:        ActivatedRoute,
    private readonly escrowService: EscrowService,
  ) {}

  ngOnInit(): void {
    this.poId = +this.route.snapshot.params['id'];

    // Read list item from router state (passed from list page)
    const state = history.state;
    if (state?.purchaseOrderId) {
      this.listItem.set(state as CompanyReturnedFundDto);
    }

    this.loadDetails();
  }

  // GET /api/SystemAdmin/returned-funds/{purchaseOrderId}
  loadDetails(): void {
    this.isLoading.set(true);
    this.escrowService.getReturnedFundDetails(this.poId).subscribe({
      next: (res) => {
        if (res.success) this.data.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  get status(): string {
    return this.listItem()?.transactionStatus ?? this.data()?.transactionStatus ?? '';
  }

  get isPending(): boolean {
    return this.status?.toLowerCase() === 'pending';
  }

  get statusStyle() {
    const s = this.status;
    return {
      'background-color':
        s === 'Transferred' ? '#DBFFDD' :
        s === 'Pending'     ? '#FCF1ED' :
        s === 'Rejected'    ? '#FEDCDD' : '#E5E7EB',
      color:
        s === 'Transferred' ? '#00B209' :
        s === 'Pending'     ? '#E47C55' :
        s === 'Rejected'    ? '#FC161A' : '#6B7280',
    };
  }

  // File selection
  onChooseFile(): void {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.uploadError.set('');
    this.uploadSuccess.set(false);
    const reader = new FileReader();
    reader.onload = (e) => { this.previewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  // PUT /api/SystemAdmin/returned-funds/{purchaseOrderId}/receipt
  onUploadReceipt(): void {
    if (!this.selectedFile || this.isUploading()) return;
    this.isUploading.set(true);
    this.uploadError.set('');
    this.uploadSuccess.set(false);

    this.escrowService.uploadReturnedFundReceipt(this.poId, this.selectedFile).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        if (res.success) {
          this.uploadSuccess.set(true);
          this.selectedFile = null;
          // Reload details to get updated status
          this.loadDetails();
        } else {
          this.uploadError.set(res.message || 'Upload failed. Please try again.');
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        this.uploadError.set(err?.error?.message || 'Upload failed. Please try again.');
      },
    });
  }
}
