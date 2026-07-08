import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DepartmentService } from '../../../../core/services/department-manager/services/department';

// الحالات الجديدة لل Internal Approval زي ما هي في الصورة بالظبط
export type InternalApprovalStatus =
  | 'PendingCompanyAdminApproval'
  | 'RejectedByCompanyAdmin'
  | 'PendingFinanceApproval'
  | 'RejectedByFinance'
  | 'PendingProcurementReview'
  | 'ConvertedToRFQ'
  | 'Cancelled';

interface PurchaseRequest {
  id: string;
  title: string;
  internalApproval: InternalApprovalStatus;
  rejectedBy?: 'Vendor' | 'Financial Manager' | 'Company Manager' | 'Company Admin'; // دعم الأنواع المختلفة للرفض المتغيرة
  rejectionReason?: string;
}

// شكل عنصر الـ PR كما يرجع فعليًا من GET /api/DepartmentManager/purchase-requests
interface PurchaseRequestApiItem {
  id: number;
  prTitle: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  currency: string;
  status: InternalApprovalStatus;
  requiredDeliveryDate: string;
  createdAt: string;
}

interface PurchaseRequestsApiResponse {
  data: {
    items: PurchaseRequestApiItem[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-my-prs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-prs.component.html',
  styleUrls: ['./my-prs.component.scss']
})
export class MyPrsComponent implements OnInit {
  prs: PurchaseRequest[] = [];

  // ---- pagination state ----
  pageIndex = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;

  // ---- loading / error state ----
  isLoading = false;
  loadError = '';

  activeMenuIndex: number | null = null;
  isSubmenuOpen = false; // متغير للتحكم في فتح الـ Submenu
  showRejectionModal = false;
  selectedPR: PurchaseRequest | null = null;
  isLoadingRejection = false;
  rejectionLoadError = '';

  // ---- cancel confirmation state ----
  showCancelModal = false;
  prToCancel: PurchaseRequest | null = null;
  isCancelling = false;
  cancelError = '';

  constructor(
    private router: Router,
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPurchaseRequests();
  }

  loadPurchaseRequests(): void {
    this.isLoading = true;
    this.loadError = '';

    this.departmentService.getPurchaseRequests(this.pageIndex, this.pageSize).subscribe({
      next: (res: PurchaseRequestsApiResponse) => {
        this.isLoading = false;

        if (!res.success) {
          this.loadError = res.message || 'Failed to load your purchase requests.';
          this.cdr.detectChanges();
          return;
        }

        this.prs = res.data.items.map((item) => ({
          id: item.id.toString(),
          title: item.prTitle,
          internalApproval: item.status,
          // ⚠️ الـ list endpoint مش راجع فيه سبب الرفض ولا مين رافض؛
          // لسه محتاجين endpoint تفاصيل PR واحدة عشان نملى الحقلين دول وقت "View Rejection Reason"
        }));

        this.pageIndex = res.data.pageNumber;
        this.pageSize = res.data.pageSize;
        this.totalPages = res.data.totalPages;
        this.totalCount = res.data.totalCount;
        // من غير كده الجدول مش بيتحدث إلا بعد ضغطة تانية على أي حاجة تانية في الصفحة
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Failed to load your purchase requests. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageIndex) return;
    this.pageIndex = page;
    this.loadPurchaseRequests();
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    if (this.activeMenuIndex === index) {
      this.activeMenuIndex = null;
      this.isSubmenuOpen = false;
    } else {
      this.activeMenuIndex = index;
      this.isSubmenuOpen = false; // تغلق الـ Submenu القديمة تلقائياً وتنتظر الضغط الجديد
    }
  }

  toggleSubmenu(event: Event): void {
    event.stopPropagation();
    this.isSubmenuOpen = !this.isSubmenuOpen;
  }

  // إغلاق كل القوائم المفتوحة تلقائياً عند الضغط في أي مكان خارجي بالشاشة
  @HostListener('document:click', [])
  closeDropdowns(): void {
    this.activeMenuIndex = null;
    this.isSubmenuOpen = false;
  }

  // يحول اسم ال status زي ما هو (PascalCase) لكلاس CSS بصيغة kebab-case
  getStatusClass(status: string): string {
    return status.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // الـ Edit Purchase Request تكون شغالة بس لو الحالة PendingCompanyAdminApproval
  canEditPR(pr: PurchaseRequest): boolean {
    return pr.internalApproval === 'PendingCompanyAdminApproval';
  }

  // الـ Cancel بترتبط بنفس منطق ال Edit (نفس الحالة القابلة للتعديل)
  canCancelPR(pr: PurchaseRequest): boolean {
    return pr.internalApproval === 'PendingCompanyAdminApproval';
  }

  // الـ View Rejection Reason تشتغل بس لو الحالة Rejected (من الشركة أو من المالية)
  canViewRejectionReason(pr: PurchaseRequest): boolean {
    return pr.internalApproval === 'RejectedByCompanyAdmin' || pr.internalApproval === 'RejectedByFinance';
  }

  // بيرجع اسم الشخص/الجهة اللي رفضت الـ PR حسب الـ status:
  // RejectedByCompanyAdmin -> Company Admin
  // RejectedByFinance      -> Financial Manager
  private getRejectedByLabel(status: InternalApprovalStatus): 'Company Admin' | 'Financial Manager' | undefined {
    if (status === 'RejectedByCompanyAdmin') return 'Company Admin';
    if (status === 'RejectedByFinance') return 'Financial Manager';
    return undefined;
  }

  onViewRejectionReason(pr: PurchaseRequest): void {
    if (!this.canViewRejectionReason(pr)) return;

    this.activeMenuIndex = null;
    this.isSubmenuOpen = false;

    // نحدد فورًا مين اللي رفض حسب حالة الـ PR (Company Admin أو Financial Manager)
    // زي الاتنين حالات الرفض في التصميم، وبعدين نجيب سبب الرفض من endpoint التفاصيل
    this.selectedPR = { ...pr, rejectedBy: this.getRejectedByLabel(pr.internalApproval) };
    this.showRejectionModal = true;
    this.isLoadingRejection = true;
    this.rejectionLoadError = '';

    this.departmentService.getPurchaseRequestById(pr.id).subscribe({
      next: (res) => {
        this.isLoadingRejection = false;
        if (res.success && this.selectedPR) {
          this.selectedPR = {
            ...this.selectedPR,
            rejectionReason: res.data.rejectionReason || 'No reason provided.',
            rejectedBy: (res.data.rejectedBy as any) || this.selectedPR.rejectedBy,
          };
        } else {
          this.rejectionLoadError = res.message || 'Failed to load rejection reason.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingRejection = false;
        this.rejectionLoadError = 'Failed to load rejection reason. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  onResubmitWithAI(pr: PurchaseRequest): void {
    console.log('AI Resubmit logic triggered for:', pr);
    this.activeMenuIndex = null;
    this.isSubmenuOpen = false;
  }

  onEditPR(pr: PurchaseRequest): void {
    if (this.canEditPR(pr)) {
      this.activeMenuIndex = null;
      this.isSubmenuOpen = false;
      this.router.navigate(['/department-manager/my-prs/edit-details', pr.id]);
    }
  }

  onCancelPR(pr: PurchaseRequest): void {
    if (!this.canCancelPR(pr)) return;
    this.activeMenuIndex = null;
    this.isSubmenuOpen = false;
    this.prToCancel = pr;
    this.showCancelModal = true;
    this.cancelError = '';
  }

  closeCancelModal(): void {
    if (this.isCancelling) return; // منمنعش قفل المودال وهو لسه بيبعت الريكوست
    this.showCancelModal = false;
    this.prToCancel = null;
    this.cancelError = '';
  }

confirmCancelPR(): void {
  if (!this.prToCancel) return;
  this.isCancelling = true;
  this.cancelError = '';

  this.departmentService.cancelPurchaseRequest(this.prToCancel.id).subscribe({
    next: () => {
      this.closeModalAfterSuccess();
    },
    error: (err) => {
      // 💡 لو السيرفر رجع 200 نجاح بس الأنجولر افتكرها غلطة بسبب الـ Parsing، اعتبرها نجاح واقفل برضه!
      if (err?.status === 200) {
        this.closeModalAfterSuccess();
      } else {
        this.isCancelling = false;
        const statusPrefix = err?.status ? `(${err.status}) ` : '';
        this.cancelError = `${statusPrefix}${err?.error?.message || 'Failed to cancel the purchase request.'}`;
      }
      this.cdr.detectChanges();
    }
  });
}

// دالة مساعدة مجمعة عشان نضمن الإغلاق والتحديث في مكان واحد
private closeModalAfterSuccess(): void {
  const cancelledId = this.prToCancel!.id;
  this.prs = this.prs.map(p =>
    p.id === cancelledId ? { ...p, internalApproval: 'Cancelled' } : p
  );
  this.showCancelModal = false;
  this.isCancelling = false;
  this.prToCancel = null;
  this.cdr.detectChanges();
  this.loadPurchaseRequests(); // تحديث القائمة فوراً
}

  closeModal(): void {
    this.showRejectionModal = false;
    this.selectedPR = null;
    this.isLoadingRejection = false;
    this.rejectionLoadError = '';
  }
}
