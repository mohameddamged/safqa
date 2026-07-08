import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VendorPoService, VendorPoTracking } from '../../../core/services/Vendor-Admin/vendor-po.service';
import { ToastService } from '../../../core/services/Vendor-Admin/toast.service';

@Component({
  selector: 'app-po-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './po-tracking.component.html',
  styleUrls: ['./po-tracking.component.css']
})
export class PoTrackingComponent implements OnInit {

  poId!: number;
  tracking: VendorPoTracking | undefined;

  loading = false;
  errorMessage = '';

  confirmationDigits: string[] = ['', '', '', '', '', ''];
  otpError = '';
  otpVerifying = false;
  otpVerified = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private poService: VendorPoService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTracking();
  }

  loadTracking(): void {
    this.loading = true;
    this.errorMessage = '';

    this.poService.getTracking(this.poId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.zone.run(() => this.cdr.markForCheck());
        })
      )
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            try {
              this.tracking = res?.data;
            } catch (e) {
              console.error('Failed to parse PO tracking response', e, res);
              this.errorMessage = 'تعذر تحميل بيانات تتبع الطلب';
            }
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error('Failed to load PO tracking', err);
            this.errorMessage = err?.name === 'TimeoutError'
              ? 'السيرفر بياخد وقت طويل جدًا في الرد. حاول تاني بعد شوية.'
              : 'تعذر تحميل بيانات تتبع الطلب';
            this.cdr.markForCheck();
          });
        }
      });
  }

  goToAllPos(): void {
    this.router.navigate(['/vendor-admin/purchase-orders']);
  }

  /* ── Delivery status → OTP gate ── */
  private readonly otpAllowedStatuses = ['FullyDelivered', 'Damaged', 'NotCompleted'];

  get canEnterOtp(): boolean {
    return !!this.tracking && this.otpAllowedStatuses.includes(this.tracking.deliveryStatus);
  }

  /* ── Delivery confirmation code (OTP) ── */
  onDigitInput(index: number, event: Event): void {
    if (!this.canEnterOtp) return;
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').slice(-1);
    this.confirmationDigits[index] = value;
    this.otpError = '';

    if (value && index < this.confirmationDigits.length - 1) {
      const next = input.parentElement?.querySelectorAll('input')[index + 1] as HTMLInputElement;
      next?.focus();
    }
  }

  onDigitKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.confirmationDigits[index] && index > 0) {
      const prevInput = (event.target as HTMLElement).parentElement?.querySelectorAll('input')[index - 1] as HTMLInputElement;
      prevInput?.focus();
    }
  }

  get isOtpComplete(): boolean {
    return this.confirmationDigits.every(d => d !== '');
  }

  trackByIndex(index: number): number {
    return index;
  }

  onVerifyOtp(): void {
    if (!this.canEnterOtp || !this.isOtpComplete || this.otpVerifying || this.otpVerified) return;

    const code = this.confirmationDigits.join('');
    this.otpError = '';
    this.otpVerifying = true;

    this.poService.verifyOtp(this.poId, code)
      .pipe(
        finalize(() => {
          this.otpVerifying = false;
          this.zone.run(() => this.cdr.markForCheck());
        })
      )
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.otpVerified = true;
            this.toast.success('تم التحقق من كود التسليم بنجاح');
            this.cdr.markForCheck();
            // Small delay so the person can see the success message before
            // we move them to the result page.
            setTimeout(() => {
              this.router.navigate(['/vendor-admin/purchase-orders/po-tracking', this.poId, 'result']);
            }, 900);
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error('Failed to verify OTP', err);
            this.otpError = 'الكود المدخل غير صحيح، حاول تاني';
            this.cdr.markForCheck();
          });
        }
      });
  }

  formatAcceptedDate(): string {
    const d = this.tracking?.acceptedAt;
    if (!d || d.startsWith('0001-01-01')) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB');
  }
}
