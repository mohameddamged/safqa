import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VendorPoService, VendorPoTracking } from '../../../core/services/Vendor-Admin/vendor-po.service';

// Files referenced by `complaintPhotoUrls` come back as bare filenames (not
// full URLs) — this is where they get resolved. Adjust if the backend
// switches to returning absolute URLs directly.
import { environment } from '../../../../environments/environment';
const COMPLAINT_PHOTOS_BASE_URL = environment.apiUrl.replace('/api', '') + '/uploads/';

@Component({
  selector: 'app-po-tracking-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './po-tracking-result.component.html',
  styleUrls: ['./po-tracking-result.component.css']
})
export class PoTrackingResultComponent implements OnInit {

  poId!: number;
  tracking: VendorPoTracking | undefined;

  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private poService: VendorPoService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
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
              console.error('Failed to parse PO tracking result response', e, res);
              this.errorMessage = 'تعذر تحميل حالة الطلب';
            }
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error('Failed to load PO tracking result', err);
            this.errorMessage = err?.name === 'TimeoutError'
              ? 'السيرفر بياخد وقت طويل جدًا في الرد. حاول تاني بعد شوية.'
              : 'تعذر تحميل حالة الطلب';
            this.cdr.markForCheck();
          });
        }
      });
  }

  goToAllPos(): void {
    this.router.navigate(['/vendor-admin/purchase-orders']);
  }

  get deliveryStatus(): string {
    return this.tracking?.deliveryStatus || '';
  }

  isStillOnTheWay(): boolean {
    return this.deliveryStatus === 'OnTheWay';
  }

  isDeliveredSuccessfully(): boolean {
    return this.deliveryStatus === 'FullyDelivered';
  }

  isPartiallyDelivered(): boolean {
    return this.deliveryStatus === 'NotCompleted';
  }

  isDeliveredWithDamages(): boolean {
    return this.deliveryStatus === 'Damaged';
  }

  hasComplaint(): boolean {
    return (this.isPartiallyDelivered() || this.isDeliveredWithDamages()) && !!this.tracking?.complaintDetails;
  }

  isPendingPayment(): boolean {
    return (this.tracking?.paymentStatus || '').toLowerCase() === 'pending';
  }

  isSuccessfulPayment(): boolean {
    const status = (this.tracking?.paymentStatus || '').toLowerCase();
    return !!status && status !== 'pending';
  }

  formatAcceptedDate(): string {
    const d = this.tracking?.acceptedAt;
    if (!d || d.startsWith('0001-01-01')) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB');
  }

  photoUrl(filename: string): string {
    if (!filename) return '';
    return /^https?:\/\//i.test(filename) ? filename : `${COMPLAINT_PHOTOS_BASE_URL}${filename}`;
  }
}
