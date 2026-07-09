import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgStyle, NgClass } from '@angular/common';
import { EscrowService } from '../../../../core/services/System-Admin/escrow-service/escrow-service';

@Component({
  selector: 'app-escrow-payment-details',
  imports: [RouterLink, DatePipe, NgStyle, NgClass],
  templateUrl: './escrow-payment-details.html',
  styleUrl: './escrow-payment-details.css',
})
export class EscrowPaymentDetails implements OnInit {
  poId!: number;

  // بيانات القائمة (List) اللي جاية من صفحة الـ Companies عن طريق router state
  listItem = signal<any>(null);

  // بيانات التفاصيل (Details) اللي جاية من GET /api/SystemAdmin/{poId}/details
  data = signal<any>(null);

  isLoading = signal(true);

  // Confirm modal
  showConfirmModal = signal(false);
  confirmType = signal<'approve' | 'reject' | null>(null);
  rejectionReason = '';
  isSubmitting = signal(false);

  // Result popup (toast)
  showResultPopup = signal(false);
  resultMessage = signal('');
  resultType = signal<'success' | 'error'>('success');

  // Action taken — يمنع إعادة الضغط
  actionTaken = signal(false);
  actionMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private escrowService: EscrowService
  ) {}

  ngOnInit() {
    this.poId = +this.route.snapshot.params['id'];

    const stateData = history.state;
    this.listItem.set(stateData && stateData.status ? stateData : null);

    this.loadDetails();
  }

  loadDetails() {
    this.isLoading.set(true);
    this.escrowService.getDetails(this.poId).subscribe({
      next: (res) => {
        if (res.success) {
          this.data.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  get status(): string {
    return this.listItem()?.status ?? this.data()?.transactionStatus ?? '';
  }

  get isPending(): boolean {
    return this.status?.toLowerCase() === 'pending';
  }

  get statusStyle() {
    const s = this.status;
    return {
      'background-color':
        s === 'Approved' ? '#DBFFDD' : s === 'Pending' ? '#FCF1ED' : s === 'Rejected' ? '#FEDCDD' : '#E5E7EB',
      color: s === 'Approved' ? '#00B209' : s === 'Pending' ? '#E47C55' : s === 'Rejected' ? '#FC161A' : '#6B7280',
    };
  }

  // ── Approve ──────────────────────────────────────────
  openApproveConfirm() {
    if (this.actionTaken()) return;
    this.confirmType.set('approve');
    this.showConfirmModal.set(true);
  }

  // ── Reject ───────────────────────────────────────────
  openRejectConfirm() {
    if (this.actionTaken()) return;
    this.rejectionReason = '';
    this.confirmType.set('reject');
    this.showConfirmModal.set(true);
  }

  closeModal() {
    this.showConfirmModal.set(false);
    this.confirmType.set(null);
    this.rejectionReason = '';
  }

  onRejectionReasonInput(event: Event) {
    this.rejectionReason = (event.target as HTMLTextAreaElement).value;
  }

  confirmAction() {
    if (this.confirmType() === 'approve') {
      this.doApprove();
    } else if (this.confirmType() === 'reject') {
      this.doReject();
    }
  }

  private doApprove() {
    this.isSubmitting.set(true);
    this.escrowService.approvePayment(this.poId).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showConfirmModal.set(false);
        this.actionTaken.set(true);
        this.actionMessage.set('This payment has been approved. No further actions can be taken.');
        this.showToast('success', 'Payment approved successfully!');
      },
      error: () => {
        this.isSubmitting.set(false);
        this.showConfirmModal.set(false);
        this.showToast('error', 'Failed to approve payment. Please try again.');
      },
    });
  }

  private doReject() {
    if (!this.rejectionReason.trim()) return;
    this.isSubmitting.set(true);
    this.escrowService.rejectPayment(this.poId, this.rejectionReason).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showConfirmModal.set(false);
        this.actionTaken.set(true);
        this.actionMessage.set('This payment has been rejected. No further actions can be taken.');
        this.showToast('success', 'Payment rejected successfully.');
      },
      error: () => {
        this.isSubmitting.set(false);
        this.showConfirmModal.set(false);
        this.showToast('error', 'Failed to reject payment. Please try again.');
      },
    });
  }

  private showToast(type: 'success' | 'error', message: string) {
    this.resultType.set(type);
    this.resultMessage.set(message);
    this.showResultPopup.set(true);
    setTimeout(() => this.showResultPopup.set(false), 4000);
  }

  closeResultPopup() {
    this.showResultPopup.set(false);
  }
}
