import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VendorPoDetails, VendorPoService } from '../../../core/services/Vendor-Admin/vendor-po.service';

@Component({
  selector: 'app-po-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './po-details.component.html',
  styleUrls: ['./po-details.component.css']
})
export class PoDetailsComponent implements OnInit {

  po: VendorPoDetails | undefined;
  poId!: number;

  loading = false;
  errorMessage = '';

  actionLoading = false;
  actionError = '';
  actionTaken = false;

  showRejectConfirm = false;
  showAcceptedModal = false;
  showRejectedModal = false;
  rejectReason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private poService: VendorPoService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDetails();
  }

  loadDetails(): void {
    this.loading = true;
    this.errorMessage = '';

    this.poService.getPoDetails(this.poId)
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
              this.po = res?.data;
            } catch (e) {
              console.error('Failed to parse PO details response', e, res);
              this.errorMessage = 'تعذر تحميل بيانات طلب الشراء';
            }
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error('Failed to load PO details', err);
            this.errorMessage = err?.name === 'TimeoutError'
              ? 'السيرفر بياخد وقت طويل جدًا في الرد. حاول تاني بعد شوية.'
              : 'تعذر تحميل بيانات طلب الشراء';
            this.cdr.markForCheck();
          });
        }
      });
  }

  statusLabel(status: string | undefined): string {
    if (!status) return '-';
    return status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  /** Only POs still awaiting the vendor's decision can be accepted/rejected. */
  get canRespond(): boolean {
    const normalized = (this.po?.status ?? '').trim().toLowerCase();
    return normalized === 'pendingvendorresponse' || normalized === 'pending vendor response';
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr || dateStr.startsWith('0001-01-01')) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB');
  }

  goToAllPos(): void {
    this.router.navigate(['/vendor-admin/purchase-orders']);
  }

  /* ── Approve ── */
  onAcceptPo(): void {
    if (!this.po || this.actionLoading) return;
    this.actionError = '';
    this.actionLoading = true;

    this.poService.approvePo(this.poId).subscribe({
      next: () => {
        this.zone.run(() => {
          this.actionLoading = false;
          this.actionTaken = true;
          this.showAcceptedModal = true;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.actionLoading = false;
          this.actionError = 'حدث خطأ أثناء الموافقة على الطلب';
          this.cdr.markForCheck();
        });
      }
    });
  }

  onCloseAcceptedModal(): void {
    this.showAcceptedModal = false;
    this.goToAllPos();
  }

  /* ── Reject ── */
  onReject(): void {
    this.actionError = '';
    this.showRejectConfirm = true;
  }

  onCancelReject(): void {
    this.showRejectConfirm = false;
    this.rejectReason = '';
  }

  onConfirmReject(): void {
    if (!this.po || this.actionLoading) return;
    if (!this.rejectReason.trim()) {
      this.actionError = 'الرجاء إدخال سبب الرفض';
      return;
    }
    this.actionError = '';
    this.actionLoading = true;

    this.poService.rejectPo(this.poId, this.rejectReason.trim()).subscribe({
      next: () => {
        this.zone.run(() => {
          this.actionLoading = false;
          this.actionTaken = true;
          this.showRejectConfirm = false;
          this.showRejectedModal = true;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.actionLoading = false;
          this.actionError = 'حدث خطأ أثناء رفض الطلب';
          this.cdr.markForCheck();
        });
      }
    });
  }

  onCloseRejectedModal(): void {
    this.showRejectedModal = false;
    this.goToAllPos();
  }
}
