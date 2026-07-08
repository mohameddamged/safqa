import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PoService } from '../../../../core/services/inventory-officer/poservice';

@Component({
  selector: 'app-po-tracking',
  imports: [RouterLink, DatePipe],
  templateUrl: './po-tracking.html',
  styleUrl: './po-tracking.css',
})
export class PoTracking implements OnInit {
  purchaseOrderId!: string;

  poData = signal<any>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  isLocked = signal(false);

  complaints = signal<any[]>([]);
  isLoadingComplaints = signal(true);

  steps = ['Processing', 'On the way', 'Delivered'];
  currentStep = signal(0);

  private statusStepMap: Record<string, number> = {
    nodeliverystatus: 0,
    processing: 0,
    ontheway: 1,
    delivered: 2,
    fullydelivered: 2,
    partiallydelivered: 2,
  };

  calendarMonth = new Date();
  estimatedDeliveryDate = new Date();
  weeks: CalendarCell[][] = [];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  selectedDate = signal<Date>(new Date());

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private poService: PoService
  ) {}

  ngOnInit(): void {
    this.purchaseOrderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.purchaseOrderId) {
      this.loadTracking();
      this.loadComplaints();
    }
  }

  loadComplaints() {
    this.isLoadingComplaints.set(true);
    this.poService.getComplaints(this.purchaseOrderId).subscribe({
      next: (res) => {
        this.complaints.set(res?.data ?? []);
        this.isLoadingComplaints.set(false);
      },
      error: () => this.isLoadingComplaints.set(false),
    });
  }

  loadTracking() {
    this.isLoading.set(true);
    this.poService.getPoTracking(this.purchaseOrderId).subscribe({
      next: (res) => {
        const data = res?.data ?? null;
        this.poData.set(data);

        if (data?.deliveryStatus) {
          const status = data.deliveryStatus.toLowerCase();
          this.currentStep.set(this.statusStepMap[status] ?? 0);
          this.isLocked.set(status.includes('delivered'));
        }

        if (data?.deliveryDeadline) {
          this.estimatedDeliveryDate = new Date(data.deliveryDeadline);
          this.selectedDate.set(this.estimatedDeliveryDate);
          this.calendarMonth = new Date(this.estimatedDeliveryDate.getFullYear(), this.estimatedDeliveryDate.getMonth(), 1);
        }

        this.buildCalendar();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  markAsFullyDelivered() {
    if (this.isSubmitting() || this.isLocked()) return;
    this.isSubmitting.set(true);
    this.poService.markFullyDelivered(this.purchaseOrderId).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isLocked.set(true);
        this.router.navigateByUrl('/inventory-officer/upcoming-pos');
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  formatComplaintType(type: string): string {
    if (!type) return '—';
    return type.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  private buildCalendar(): void {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = firstDay.getDay();

    const cells: CalendarCell[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null, date: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, date: new Date(year, month, d) });
    while (cells.length % 7 !== 0) cells.push({ day: null, date: null });

    this.weeks = [];
    for (let i = 0; i < cells.length; i += 7) this.weeks.push(cells.slice(i, i + 7));
  }

  prevMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  selectDate(cell: CalendarCell): void {
    if (!cell.date) return;
    this.selectedDate.set(cell.date);
  }

  isSelected(cell: CalendarCell): boolean {
    return !!cell.date &&
      cell.date.getFullYear() === this.estimatedDeliveryDate.getFullYear() &&
      cell.date.getMonth() === this.estimatedDeliveryDate.getMonth() &&
      cell.date.getDate() === this.estimatedDeliveryDate.getDate();
  }

  currentMonthLabel(): string {
    return `${this.monthNames[this.calendarMonth.getMonth()]} ${this.calendarMonth.getFullYear()}`;
  }

  selectedDateLabel() {
    return this.selectedDate().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}

interface CalendarCell {
  day: number | null;
  date: Date | null;
}
