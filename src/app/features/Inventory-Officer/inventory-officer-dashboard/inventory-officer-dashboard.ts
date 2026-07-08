import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PoService } from '../../../core/services/inventory-officer/poservice';

interface CalendarCell {
  day: number | null;
  date: Date | null;
}

@Component({
  selector: 'app-inventory-officer-dashboard',
  imports: [RouterLink],
  templateUrl: './inventory-officer-dashboard.html',
  styleUrl: './inventory-officer-dashboard.css',
})
export class InventoryOfficerDashboard implements OnInit {
  isLoading = signal(true);

  expectedTodayCount = signal<number | null>(null);
  overdueCount       = signal<number | null>(null);
  activeOrdersCount  = signal<number | null>(null);

  pos = signal<any[]>([]);

  calendarMonth   = new Date();
  today           = new Date();
  selectedDate    = signal<Date>(new Date());
  weeks: CalendarCell[][] = [];

  monthNames    = ['January','February','March','April','May','June',
                   'July','August','September','October','November','December'];
  weekdayLabels = ['S','M','T','W','T','F','S'];

  constructor(private poService: PoService) {}

  ngOnInit(): void {
    this.buildCalendar();
    this.loadDashboardStats();
    this.loadPOs();
  }

  // GET /api/InventoryOfficer/dashboard-stats
  loadDashboardStats(): void {
    this.isLoading.set(true);
    this.poService.getDashboardStats().subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res?.success && res.data) {
          this.expectedTodayCount.set(res.data.expectedToday      ?? 0);
          this.overdueCount.set(res.data.overdueDeliveries        ?? 0);
          this.activeOrdersCount.set(res.data.activeOrders        ?? 0);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  // GET /api/InventoryOfficer/purchase-orders
  loadPOs(): void {
    this.poService.getPOs(1, 100).subscribe({
      next: (res: any) => { this.pos.set(res?.data?.items ?? []); },
      error: () => {},
    });
  }

  private isDelivered(status: string): boolean {
    return (status || '').toLowerCase().includes('delivered');
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }

  private poDatesInCurrentMonth(): Date[] {
    const year  = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    return this.pos()
      .filter(po => !this.isDelivered(po.deliveryStatus))
      .map(po => po.estimatedDeliveryDate ? new Date(po.estimatedDeliveryDate) : null)
      .filter((d): d is Date =>
        !!d && d.getFullYear() > 1 &&
        d.getFullYear() === year && d.getMonth() === month);
  }

  isPoDate(cell: CalendarCell): boolean {
    if (!cell.date) return false;
    return this.poDatesInCurrentMonth().some(d => this.isSameDay(d, cell.date as Date));
  }

  isToday(cell: CalendarCell): boolean {
    return !!cell.date && this.isSameDay(cell.date, this.today);
  }

  isSelected(cell: CalendarCell): boolean {
    return !!cell.date && this.isSameDay(cell.date, this.selectedDate());
  }

  selectDate(cell: CalendarCell): void {
    if (cell.date) this.selectedDate.set(cell.date);
  }

  private buildCalendar(): void {
    const year        = this.calendarMonth.getFullYear();
    const month       = this.calendarMonth.getMonth();
    const firstDay    = new Date(year, month, 1);
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
    this.calendarMonth = new Date(
      this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.calendarMonth = new Date(
      this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  currentMonthLabel(): string {
    return `${this.monthNames[this.calendarMonth.getMonth()]} ${this.calendarMonth.getFullYear()}`;
  }

  selectedDateLabel(): string {
    return this.selectedDate().toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  }
}
