import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DepartmentOption, DepartmentService } from '../../../../core/services/department-manager/services/department';

interface CalendarCell {
  day: number | null;
  isToday?: boolean;
  isSelected?: boolean;
  isPast?: boolean;
}

@Component({
  selector: 'app-pr-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './pr-details.html',
  styleUrl: './pr-details.css',
})
export class PrDetails implements OnInit {
  // ---- form fields ----
  itemName = '';
  category = '';
  quantity: number | null = null;
  unitOfMeasurement = '';
  technicalSpecs = '';
  needReason = '';
  additionalNotes = '';
  estimatedPrice: number | null = null;
  currency = '';

  // ---- selected ids/values اللي فعليًا بيتبعتوا للباك اند ----
  // categoryId: رقم فعلي (id)
  // unit / currency: بيتبعتوا كاسم نصي (enum name) مش id، حسب الـ Swagger
  selectedCategoryId: number | null = null;

  // ---- category dropdown (بتتحمل من الـ API) ----
  categoryOptions: DepartmentOption[] = [];
  isCategoryOpen = false;

  // ---- unit of measurement dropdown (بتتحمل من الـ API) ----
  unitOptions: DepartmentOption[] = [];
  isUnitOpen = false;

  // ---- currency dropdown (بتتحمل من الـ API) ----
  currencyOptions: DepartmentOption[] = [];
  isCurrencyOpen = false;

  // ---- loading / error state for the dropdown data itself ----
  isLoadingOptions = false;
  optionsLoadError = '';

  // ---- submit state ----
  isSubmitting = false;
  submitError = '';

  // ---- cancel confirmation modal ----
  isCancelModalOpen = false;

  // ---- success modal ----
  isSuccessModalOpen = false;

  // ---- date picker state ----
  readonly weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  today = new Date();
  selectedDate: Date | null = null;
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth();

  get selectedDateLabel(): string {
    if (!this.selectedDate) return 'No date selected';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = dayNames[this.selectedDate.getDay()];
    const month = this.monthNames[this.selectedDate.getMonth()].slice(0, 3);
    return `${day}, ${month} ${this.selectedDate.getDate()}`;
  }

  // النص اللي بيظهر في حقل "RFQ Deadline" تحت — مرتبط مباشرة بالتقويم عشان
  // مايبقاش فيه قيمتين مختلفتين (نص حر + تاريخ مختار) لنفس المعلومة
  get rfqDeadlineDisplay(): string {
    return this.selectedDate ? this.selectedDateLabel : '';
  }

  get viewMonthLabel(): string {
    return `${this.monthNames[this.viewMonth]} ${this.viewYear}`;
  }

  get calendarCells(): CalendarCell[] {
    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();

    const cells: CalendarCell[] = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(this.viewYear, this.viewMonth, d);
      cells.push({
        day: d,
        isToday: this.isSameDate(d, this.today),
        isSelected: this.selectedDate ? this.isSameDate(d, this.selectedDate) : false,
        isPast: this.isPastDate(cellDate),
      });
    }
    return cells;
  }

  private isSameDate(day: number, ref: Date): boolean {
    return (
      day === ref.getDate() &&
      this.viewMonth === ref.getMonth() &&
      this.viewYear === ref.getFullYear()
    );
  }

  prevMonth() {
    this.viewMonth--;
    if (this.viewMonth < 0) {
      this.viewMonth = 11;
      this.viewYear--;
    }
  }

  nextMonth() {
    this.viewMonth++;
    if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear++;
    }
  }

  pickDay(day: number | null) {
    if (day == null) return;
    const picked = new Date(this.viewYear, this.viewMonth, day);
    if (this.isPastDate(picked)) return; // can't pick a deadline before today
    this.selectedDate = picked;
  }

  private isPastDate(date: Date): boolean {
    const todayStart = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    return date.getTime() < todayStart.getTime();
  }

  clearDate() {
    this.selectedDate = null;
    this.viewYear = this.today.getFullYear();
    this.viewMonth = this.today.getMonth();
  }

  cancelDate() {
    // Embedded calendar (not a popover) — Cancel simply discards an in-progress pick
    // and returns the visible month back to whatever is currently selected (or today).
    const ref = this.selectedDate ?? this.today;
    this.viewYear = ref.getFullYear();
    this.viewMonth = ref.getMonth();
  }

  confirmDate() {
    // Selection is already applied live via pickDay(); nothing further to do here.
  }

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.isLoadingOptions = true;
    this.optionsLoadError = '';

    this.departmentService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categoryOptions = res.data;
        } else {
          this.optionsLoadError = res.message || 'Failed to load categories.';
        }
      },
      error: () => {
        this.optionsLoadError = 'Failed to load categories. Please refresh the page.';
      }
    });

    this.departmentService.getUnits().subscribe({
      next: (res) => {
        if (res.success) {
          this.unitOptions = res.data;
        } else {
          this.optionsLoadError = res.message || 'Failed to load units.';
        }
      },
      error: () => {
        this.optionsLoadError = 'Failed to load units. Please refresh the page.';
      }
    });

    this.departmentService.getCurrencies().subscribe({
      next: (res) => {
        if (res.success) {
          this.currencyOptions = res.data;
        } else {
          this.optionsLoadError = res.message || 'Failed to load currencies.';
        }
        this.isLoadingOptions = false;
      },
      error: () => {
        this.optionsLoadError = 'Failed to load currencies. Please refresh the page.';
        this.isLoadingOptions = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isCategoryOpen && !this.isUnitOpen && !this.isCurrencyOpen) return;
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target) || !target.closest('.dropdown-anchor')) {
      this.isCategoryOpen = false;
      this.isUnitOpen = false;
      this.isCurrencyOpen = false;
    }
  }

  // ---- category dropdown ----
  openCategoryDropdown() {
    this.isUnitOpen = false;
    this.isCurrencyOpen = false;
    this.isCategoryOpen = true;
  }

  selectCategory(option: DepartmentOption) {
    this.category = option.name;
    this.selectedCategoryId = option.id;
    this.isCategoryOpen = false;
  }

  // ---- unit of measurement dropdown ----
  openUnitDropdown() {
    this.isCategoryOpen = false;
    this.isCurrencyOpen = false;
    this.isUnitOpen = true;
  }

  selectUnit(option: DepartmentOption) {
    this.unitOfMeasurement = option.name;
    this.isUnitOpen = false;
  }

  // ---- currency dropdown ----
  openCurrencyDropdown() {
    this.isCategoryOpen = false;
    this.isUnitOpen = false;
    this.isCurrencyOpen = true;
  }

  selectCurrency(option: DepartmentOption) {
    this.currency = option.name;
    this.isCurrencyOpen = false;
  }

  // ---- submit / cancel flows ----
  private validateForm(): boolean {
    if (
      !this.itemName.trim() ||
      !this.selectedCategoryId ||
      !this.quantity ||
      !this.unitOfMeasurement ||
      !this.estimatedPrice ||
      !this.currency ||
      !this.selectedDate
    ) {
      this.submitError = 'Please fill in all required fields marked with *.';
      return false;
    }
    return true;
  }

  uploadToManagement() {
    this.submitError = '';

    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const payload = {
      itemName: this.itemName.trim(),
      categoryId: this.selectedCategoryId!,
      quantity: this.quantity!,
      unit: this.unitOfMeasurement,
      estimatedPrice: this.estimatedPrice!,
      currency: this.currency,
      requiredDeliveryDate: this.selectedDate!.toISOString(),
      technicalSpecifications: this.technicalSpecs,
      reason: this.needReason,
      additionalNotes: this.additionalNotes,
    };

    this.departmentService.createPurchaseRequest(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.isSuccessModalOpen = true;
        } else {
          this.submitError = res.message || 'Failed to submit the purchase requisition. Please try again.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Something went wrong while submitting. Please try again.';
      }
    });
  }

  closeSuccessModal() {
    this.isSuccessModalOpen = false;
    this.router.navigate(['/department-manager/upload-pr']);
  }

  cancelForm() {
    this.isCancelModalOpen = true;
  }

  continueMakingRfq() {
    this.isCancelModalOpen = false;
  }

  confirmCancelRfq() {
    this.isCancelModalOpen = false;
    this.router.navigate(['/department-manager/upload-pr']);
  }
}
