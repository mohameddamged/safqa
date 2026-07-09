import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  DepartmentManagerService,
  PurchaseOrderDetails,
} from '../../../../core/services/department-manager/allpos-service';

@Component({
  selector: 'app-po-details',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './po-details.html',
  styleUrl: './po-details.css',
})
export class PoDetails implements OnInit {

  po: PurchaseOrderDetails | null = null;
  isLoading  = true;
  error      = '';

  constructor(
    private readonly route:     ActivatedRoute,
    private readonly router:    Router,
    private readonly dmService: DepartmentManagerService,
    private readonly cdr:       ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // ⚠️ ملحوظة: كنا بنستخدم history.state كـ "fast path" علشان نعرض بيانات فورية
    // من غير ما نستنى الـ API، بس الـ state اللي بييجي من صفحة الـ list شكله مختلف
    // تمامًا عن شكل تفاصيل الـ PO الكامل (مفيهوش itemName/categoryName/quantity/unit/
    // technicalSpecification/additionalNotes/rfqTitle أصلًا)، فكان بيسبب عرض بيانات
    // ناقصة/غلط. دلوقتي بنجيب تفاصيل الـ PO دايمًا من الـ API عشان نضمن صحة الداتا 100%.
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.fetchDetails(id);
    } else {
      this.error     = 'Purchase order not found.';
      this.isLoading = false;
    }
  }

  // GET /api/DepartmentManager/purchase-orders/{purchaseOrderId}
  private fetchDetails(id: number): void {
    this.isLoading = true;
    this.error = '';

    this.dmService.getPurchaseOrderById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.po = res.data;
        } else {
          this.error = res.message || 'Failed to load purchase order details.';
        }
        // ⚠️ الأب zoneless (Angular 21 default)، فمفيش zone.js يعمل tick تلقائي بعد
        // أي async response. من غير الـ detectChanges() اليدوي ده، الصفحة كانت
        // بتفضل واقفة على أول حالة (Loading) حتى لو الداتا رجعت صح من الباك اند فعلاً.
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.status === 404
          ? 'Purchase order not found.'
          : 'Failed to load purchase order details.';
        this.cdr.detectChanges();
      },
    });
  }

  retryLoad(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.fetchDetails(id);
  }

  goBack(): void {
    this.router.navigate(['/department-manager/delivered-pos']);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
  }

  getStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Delivered':
      case 'Completed':
      case 'VendorAccepted':
      case 'Paid':        return 'status-green';
      case 'Pending':
      case 'InProgress':  return 'status-yellow';
      case 'Cancelled':
      case 'Rejected':    return 'status-red';
      default:            return 'status-gray';
    }
  }
}
