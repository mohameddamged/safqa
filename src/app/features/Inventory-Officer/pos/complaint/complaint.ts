import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PoService } from '../../../../core/services/inventory-officer/poservice';

interface FieldError {
  code: string;
  message: string;
}

interface OtpResult {
  otpCode: string;
  expiresAt: string;
}

@Component({
  selector: 'app-complaint',
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './complaint.html',
  styleUrl: './complaint.css',
})
export class Complaint implements OnInit {
  purchaseOrderId!: string;

  activeTab = signal<'damages' | 'incomplete'>('damages');

  reason = '';
  receivedQuantity: number | null = null;
  damagedQuantity: number | null = null;
  dismissedQuantity: number | null = null;

  poQuantity = signal<number | null>(null);
  isLoadingPo = signal(true);

  selectedImages: File[] = [];
  imagePreviews = signal<string[]>([]);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  fieldErrors = signal<string[]>([]);
  otpResult = signal<OtpResult | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private poService: PoService
  ) {}

  ngOnInit(): void {
    this.purchaseOrderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.purchaseOrderId) {
      this.loadPoQuantity();
    }
  }

  loadPoQuantity() {
    this.isLoadingPo.set(true);
    this.poService.getPoById(this.purchaseOrderId).subscribe({
      next: (res) => {
        this.poQuantity.set(res?.data?.quantity ?? null);
        this.isLoadingPo.set(false);
      },
      error: () => this.isLoadingPo.set(false),
    });
  }

  setTab(tab: 'damages' | 'incomplete') {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.fieldErrors.set([]);
  }

  onImagesSelected(event: any) {
    const files: File[] = Array.from(event.target.files);
    const remaining = 10 - this.selectedImages.length;

    files.slice(0, remaining).forEach(file => {
      this.selectedImages.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.update(images => [...images, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.update(images => images.filter((_, i) => i !== index));
  }

  // مجموع الكميات اللي المستخدم داخلها دلوقتي (بيتغير حسب التاب المفتوح)
  currentTotal(): number {
    const received = this.receivedQuantity ?? 0;
    const second = this.activeTab() === 'damages' ? (this.damagedQuantity ?? 0) : (this.dismissedQuantity ?? 0);
    return received + second;
  }

  quantityMismatch(): boolean {
    const poQty = this.poQuantity();
    if (poQty === null) return false;
    return this.currentTotal() !== poQty;
  }

  submitComplaint() {
    if (this.isSubmitting() || !this.purchaseOrderId) return;

    this.errorMessage.set(null);
    this.fieldErrors.set([]);

    const poQty = this.poQuantity();
    if (poQty !== null && this.quantityMismatch()) {
      this.errorMessage.set(
        `Received quantity plus ${this.activeTab() === 'damages' ? 'damaged' : 'dismissed'} quantity must equal the purchase order quantity (${poQty}). Current total: ${this.currentTotal()}.`
      );
      return;
    }

    this.isSubmitting.set(true);

    const formData = new FormData();
    formData.append('purchaseOrderId', this.purchaseOrderId);
    formData.append('type', this.activeTab() === 'damages' ? 'DamagedItems' : 'IncompleteItems');
    formData.append('reason', this.reason || '');
    formData.append('receivedQuantity', String(this.receivedQuantity ?? 0));

    if (this.activeTab() === 'damages') {
      formData.append('damagedQuantity', String(this.damagedQuantity ?? 0));
      this.selectedImages.forEach(file => formData.append('photos', file));
    } else {
      formData.append('dismissedQuantity', String(this.dismissedQuantity ?? 0));
    }

    this.poService.submitComplaint(formData).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.otpResult.set(res?.data ?? null);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.handleSubmitError(err);
      },
    });
  }

  private handleSubmitError(err: HttpErrorResponse) {
    const body = err?.error;
    const errorsDict: Record<string, FieldError[]> | undefined = body?.errors;

    if (errorsDict && Object.keys(errorsDict).length > 0) {
      const messages = Object.values(errorsDict)
        .flat()
        .map((e) => e.message)
        .filter(Boolean);
      this.fieldErrors.set(messages);
    }

    this.errorMessage.set(
      body?.message || 'Something went wrong while submitting the complaint. Please try again.'
    );
  }

  goToTracking() {
    this.router.navigateByUrl(`/inventory-officer/upcoming-pos/po-tracking/${this.purchaseOrderId}`);
  }
}
