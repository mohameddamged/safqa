import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgStyle } from '@angular/common';
import { EscrowService } from '../../../../core/services/System-Admin/escrow-service/escrow-service';
import { ToastService } from '../../../../core/services/toast.service';

// الصور اللي جاية باسم ملف بس (زي complaintPhotoUrls و productPhotoUrls) لازم تتحول
// لرابط كامل باستخدام نفس الدومين اللي بيرجع بيه receiptUrl الجاهز من الباك إند.
const IMAGES_BASE_URL = 'https://safka.runasp.net/images/';

type ViewState = 'loading' | 'paid' | 'damaged' | 'notCompleted' | 'fullyDelivered' | 'unknown';

@Component({
  selector: 'app-vendor-transaction-details',
  imports: [RouterLink, NgStyle],
  templateUrl: './vendor-transaction-details.html',
  styleUrl: './vendor-transaction-details.css',
})
export class VendorTransactionDetails implements OnInit {
  poId!: number;

  data = signal<any>(null);
  isLoading = signal(true);
  isMarkingPaid = signal(false);

  // ملف الإيصال اللي المستخدم هيختاره قبل الضغط على Mark As Paid
  selectedReceiptFile: File | null = null;
  selectedReceiptPreview = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private escrowService: EscrowService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.poId = +this.route.snapshot.params['id'];
    this.loadDetails();
  }

  loadDetails() {
    this.isLoading.set(true);
    this.escrowService.getVendorTransactionDetails(this.poId).subscribe({
      next: (res) => {
        if (res?.success) {
          this.data.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  get viewState(): ViewState {
    const d = this.data();
    if (this.isLoading() || !d) return 'loading';

    if (d.transactionStatus === 'Paid') return 'paid';

    if (d.transactionStatus === 'Pending') {
      if (d.deliveryStatus === 'Damaged') return 'damaged';
      if (d.deliveryStatus === 'NotCompleted') return 'notCompleted';
      if (d.deliveryStatus === 'FullyDelivered') return 'fullyDelivered';
    }

    return 'unknown';
  }

  get isPending(): boolean {
    return this.data()?.transactionStatus === 'Pending';
  }

  // نص وستايل الشارة (Badge) اللي بتظهر فوق يمين الصفحة
  get badgeLabel(): string {
    switch (this.viewState) {
      case 'paid':
        return 'Transferred';
      case 'damaged':
        return 'Delivered with Damages';
      case 'notCompleted':
        return 'Partially Delivered';
      case 'fullyDelivered':
        return 'Fully Delivered';
      default:
        return this.data()?.transactionStatus ?? '—';
    }
  }

  get badgeStyle() {
    switch (this.viewState) {
      case 'paid':
      case 'fullyDelivered':
        return { 'background-color': '#DBFFDD', color: '#00B209' };
      case 'damaged':
        return { 'background-color': '#FCE4FF', color: '#B026C9' };
      case 'notCompleted':
        return { 'background-color': '#FFF6C9', color: '#A87C00' };
      default:
        return { 'background-color': '#E5E7EB', color: '#6B7280' };
    }
  }

  // بيحول اسم الملف الراجع من الـ API لرابط صورة كامل قابل للعرض
  resolveImageUrl(filename: string): string {
    if (!filename) return '';
    return /^https?:\/\//i.test(filename) ? filename : `${IMAGES_BASE_URL}${filename}`;
  }

  // اختيار صورة الإيصال (Upload Receipt)
  onReceiptSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedReceiptFile = file;

    const reader = new FileReader();
    reader.onload = () => this.selectedReceiptPreview.set(reader.result as string);
    reader.readAsDataURL(file);

    input.value = '';
  }

  get canMarkAsPaid(): boolean {
    return !!this.selectedReceiptFile;
  }

  markAsPaid() {
    if (this.isMarkingPaid()) return;

    // الباك إند بيرفض الطلب لو مفيش صورة إيصال، فبنمنع الطلب من الأساس ونوضح للأدمن
    if (!this.selectedReceiptFile) {
      this.toast.error('Please upload a receipt image before marking as paid.');
      return;
    }

    this.isMarkingPaid.set(true);
    this.escrowService.markVendorTransactionAsPaid(this.poId, this.selectedReceiptFile).subscribe({
      next: (res) => {
        this.isMarkingPaid.set(false);
        if (res?.success !== false) {
          this.toast.success('Transaction marked as paid successfully.');
          this.loadDetails();
        } else {
          this.toast.error(res?.message || 'Something went wrong.');
        }
      },
      error: (err) => {
        this.isMarkingPaid.set(false);
        this.toast.error(this.extractErrorMessage(err));
      },
    });
  }

  // بيقرأ رسالة الخطأ من شكل الـ ProblemDetails/validation errors اللي بيرجعه الباك إند
  // (زي { errors: { receiptImage: ["The receiptImage field is required."] } })
  private extractErrorMessage(err: any): string {
    const body = err?.error;
    const errorsDict = body?.errors as Record<string, string[]> | undefined;

    if (errorsDict && Object.keys(errorsDict).length > 0) {
      const messages = Object.values(errorsDict).flat().filter(Boolean);
      if (messages.length) return messages.join(' ');
    }

    return body?.title || body?.message || 'Failed to mark transaction as paid.';
  }
}
