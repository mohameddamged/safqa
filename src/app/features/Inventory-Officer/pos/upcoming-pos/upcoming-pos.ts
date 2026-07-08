import { Component, HostListener, signal } from '@angular/core';
import { PoService } from '../../../../core/services/inventory-officer/poservice';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-upcoming-pos',
  imports: [RouterLink, DatePipe],
  templateUrl: './upcoming-pos.html',
  styleUrl: './upcoming-pos.css',
})
export class UpcomingPos {
  pos = signal<any[]>([]);
  openDropdownId = signal<number | null>(null);
  isLoading = signal(true);

  currentPage = signal(1);
  totalPages = signal(1);
  pageSize = 5;

  constructor(private poService: PoService) {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.poService.getPOs(this.currentPage(), this.pageSize).subscribe({
      next: (res) => {
        this.pos.set(res?.data?.items ?? []);
        this.totalPages.set(res?.data?.totalPages || 1);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() > 1;
  }

  // بيحول "NoDeliveryStatus" أو "OnTheWay" لصيغة مقروءة "No Delivery Status" / "On The Way"
  formatStatus(status: string): string {
    if (!status) return '—';
    return status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  statusStyle(status: string) {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return { background: '#DBFFDD', color: '#00B209' };
    if (s.includes('way') || s.includes('transit')) return { background: '#FCF1ED', color: '#E779F1' };
    if (s.includes('delay') || s.includes('late')) return { background: '#FEDCDD', color: '#FC161A' };
    if (s.includes('no') || s === '') return { background: '#E5E7EB', color: '#6B7280' };
    return { background: '#E0F7FA', color: '#00BCD4' };
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage.set(newPage);
      this.loadData();
    }
  }

  toggleDropdown(id: number, event: Event) {
    event.stopPropagation();
    this.openDropdownId.set(this.openDropdownId() === id ? null : id);
  }


  @HostListener('document:click')
  closeDropdown() {
    this.openDropdownId.set(null);
  }
}
