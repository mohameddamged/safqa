import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil, timeout, tap } from 'rxjs/operators';
import {
  CreatePurchaseRequestPayload,
  DepartmentOption,
  DepartmentService,
  PurchaseRequestDetail
} from '../../../../core/services/department-manager/services/department';

// السيرفر بيتاعنا (runasp.net free hosting) بيبقى بطيء جدًا لما يكون "نايم" (cold start)،
// فبنستنى مدة معقولة قبل ما نعتبرها استغرقت وقت كتير ونعرض زرار Retry بدل ما تفضل معلقة للأبد
const REQUEST_TIMEOUT_MS = 20000;

@Component({
  selector: 'app-pr-edit-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pr-edit-details.html',
  styleUrls: ['./pr-edit-details.css']
})
export class PrEditDetailsComponent implements OnInit, OnDestroy {
  prId: string | null = null;
  private destroy$ = new Subject<void>();

  // بيانات الـ PR الأصلية (زي ما رجعت من GET /purchase-requests/{id}) - مستخدمة للحقول اللي مش بتتعدل
  pr: PurchaseRequestDetail | null = null;

  // ---- loading state (بتاعة تحميل تفاصيل الـ PR) ----
  isLoading = false;
  loadError = '';
  hasTimedOut = false; // السيرفر ماردش خلال REQUEST_TIMEOUT_MS

  // ---- editable form fields (دي اللي بتتبعت في الـ Upload Revision) ----
  itemName = '';
  categoryId: number | null = null;
  quantity: number | null = null;
  unit = '';
  estimatedPrice: number | null = null;
  currency = '';
  requiredDeliveryDate = ''; // yyyy-MM-dd عشان تتربط بـ <input type="date">
  private originalRequiredDeliveryDate = ''; // القيمة الأصلية الكاملة (مع الوقت) زي ما رجعت من الـ API بالظبط
  technicalSpecifications = '';
  reason = '';
  additionalNotes = '';

  // ---- dropdown options (category / unit / currency) محمّلة من نفس الـ API المستخدم في upload-pr ----
  categoryOptions: DepartmentOption[] = [];
  unitOptions: DepartmentOption[] = [];
  currencyOptions: DepartmentOption[] = [];

  // ---- submit state ----
  isSubmitting = false;
  submitError = '';
  isSuccessModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('[DEBUG] ngOnInit called');

    // بنستخدم subscribe على paramMap مش snapshot لوحده، عشان لو الـ component اتعاد استخدامه
    // (Angular route reuse) لـ PR تاني بنفس الـ route config، الداتا تتحمل تاني صح
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      console.log('[DEBUG] paramMap fired, id =', id, ' current prId =', this.prId);
      if (id && id !== this.prId) {
        this.prId = id;
        this.loadPurchaseRequest(id);
      }
    });

    this.loadDropdownOptions();
  }

  ngOnDestroy(): void {
    console.log('[DEBUG] ngOnDestroy called');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDropdownOptions(): void {
    this.departmentService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { if (res.success) this.categoryOptions = res.data; },
      error: (e) => console.error('Failed to load categories:', e)
    });
    this.departmentService.getUnits().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { if (res.success) this.unitOptions = res.data; },
      error: (e) => console.error('Failed to load units:', e)
    });
    this.departmentService.getCurrencies().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { if (res.success) this.currencyOptions = res.data; },
      error: (e) => console.error('Failed to load currencies:', e)
    });
  }

  loadPurchaseRequest(id: string): void {
    console.log('[DEBUG][1] loadPurchaseRequest called with id:', id);
    this.isLoading = true;
    this.loadError = '';
    this.hasTimedOut = false;

    this.departmentService.getPurchaseRequestById(id).pipe(
      tap({
        next: (res) => console.log('[DEBUG][2] raw response received from HTTP:', res),
        error: (err) => console.log('[DEBUG][2-ERR] raw HTTP error before catchError:', err),
        subscribe: () => console.log('[DEBUG][0] observable subscribed (HTTP call started)')
      }),
      timeout(REQUEST_TIMEOUT_MS),
      takeUntil(this.destroy$),
      catchError((err) => {
        console.log('[DEBUG][3] catchError triggered:', err);
        // الأب zoneless (Angular 21 default)، فمفيش zone.js يعمل tick تلقائي.
        // بنعمل markForCheck يدويًا عشان نضمن إن Angular هيعمل render فورًا
        if (err?.name === 'TimeoutError') {
          this.hasTimedOut = true;
        } else {
          const statusPrefix = err?.status ? `(${err.status}) ` : '';
          this.loadError = `${statusPrefix}${err?.error?.message || 'Failed to load purchase request details. Please try again.'}`;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
        return of(null);
      })
    ).subscribe((res) => {
      console.log('[DEBUG][4] subscribe next fired with:', res);
      if (!res) return; // اتعالج جوه catchError فوق

      // الأب zoneless (Angular 21 default)، فبنعمل markForCheck يدويًا بعد أي تحديث state
      // عشان نضمن إن Angular هيلاحظ التغيير ويعمل render (ده كان سبب مشكلة الصفحة اللي بتفضل واقفة على Loading)
      try {
        this.isLoading = false;

        if (res.success) {
          this.pr = res.data;
          this.populateFormFromPr(res.data);
          console.log('[DEBUG][5] pr populated successfully:', this.pr);
        } else {
          this.loadError = res.message || 'Failed to load purchase request details.';
        }
      } catch (e) {
        // أي خطأ غير متوقع وقت تعبئة الفورم منمنعوش من إننا نطلع من حالة Loading
        console.error('[DEBUG][ERR] Failed to populate PR edit form:', e);
        this.isLoading = false;
        this.loadError = 'Something went wrong while displaying this purchase request.';
      } finally {
        this.cdr.markForCheck();
      }
    });
  }

  // بيملى حقول الفورم القابلة للتعديل من الداتا الراجعة من الـ API
  private populateFormFromPr(pr: PurchaseRequestDetail): void {
    this.itemName = pr.itemName ?? '';
    this.categoryId = pr.categoryId ?? null;
    this.quantity = pr.quantity ?? null;
    this.unit = pr.unit ?? '';
    this.estimatedPrice = pr.estimatedPrice ?? null;
    this.currency = pr.currency ?? '';
    this.technicalSpecifications = pr.technicalSpecifications ?? '';
    this.reason = pr.reason ?? '';
    this.additionalNotes = pr.additionalNotes ?? '';

    // بنقص الجزء بتاع التاريخ من الـ string مباشرة (من غير ما نمر بـ Date object)
    // عشان مفيش أي احتمال لتحويل التوقيت (timezone) يغيّر اليوم بالغلط.
    // ولو الحقل رجع فاضي/null من الـ API، منكسرش الصفحة - بنسيبه فاضي بس
    this.originalRequiredDeliveryDate = pr.requiredDeliveryDate ?? '';
    this.requiredDeliveryDate = this.originalRequiredDeliveryDate.split('T')[0] || '';
  }

  retryLoad(): void {
    if (this.prId) this.loadPurchaseRequest(this.prId);
  }

  // لو المستخدم مغيرش تاريخ الـ deadline، بنبعت نفس الـ string الأصلي زي ما هو من غير أي تعديل.
  // لو غيّره فعلاً، بنركّب تاريخ جديد ونحافظ على جزء الوقت (time-of-day) الأصلي بدل ما نصفّره
  // أو نمر بـ Date/toISOString ونخاطر بإزاحة اليوم بسبب فرق التوقيت (timezone).
  private buildRequiredDeliveryDatePayload(): string {
    const originalDateOnly = this.originalRequiredDeliveryDate.split('T')[0];
    if (this.requiredDeliveryDate === originalDateOnly) {
      return this.originalRequiredDeliveryDate;
    }
    const originalTime = this.originalRequiredDeliveryDate.split('T')[1] || '00:00:00';
    return `${this.requiredDeliveryDate}T${originalTime}`;
  }

  private validateForm(): boolean {
    if (
      !this.itemName.trim() ||
      !this.categoryId ||
      !this.quantity ||
      !this.unit ||
      !this.estimatedPrice ||
      !this.currency ||
      !this.requiredDeliveryDate
    ) {
      this.submitError = 'Please fill in all required fields.';
      return false;
    }
    return true;
  }

  onUploadRevision(): void {
    this.submitError = '';
    if (!this.pr || !this.prId) return;
    if (!this.validateForm()) return;

    this.isSubmitting = true;

    const payload: CreatePurchaseRequestPayload = {
      itemName: this.itemName.trim(),
      categoryId: this.categoryId ?? this.pr.categoryId,
      quantity: this.quantity!,
      unit: this.unit,
      estimatedPrice: this.estimatedPrice!,
      currency: this.currency,
      requiredDeliveryDate: this.buildRequiredDeliveryDatePayload(),
      technicalSpecifications: this.technicalSpecifications,
      reason: this.reason,
      additionalNotes: this.additionalNotes,
    };

    this.departmentService.updatePurchaseRequest(this.prId, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.isSuccessModalOpen = true;
        } else {
          this.submitError = res.message || 'Failed to upload the revision. Please try again.';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSubmitting = false;
        const statusPrefix = err?.status ? `(${err.status}) ` : '';
        this.submitError = `${statusPrefix}${err?.error?.message || 'Something went wrong while uploading the revision. Please try again.'}`;
        this.cdr.markForCheck();
      }
    });
  }

  closeSuccessModal(): void {
    this.isSuccessModalOpen = false;
    this.router.navigate(['/department-manager/my-prs']);
  }

  onCancel(): void {
    this.router.navigate(['/department-manager/my-prs']);
  }
}
