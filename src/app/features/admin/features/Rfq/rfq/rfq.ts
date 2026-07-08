import { Component, OnInit, signal } from '@angular/core';
import { RfqService } from '../../../core/services/rfq-service';
import { DatePipe, NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'app-rfq',
  imports: [NgClass, DatePipe,NgStyle],
  templateUrl: './rfq.html',
  styleUrl: './rfq.css',
})
export class Rfq implements OnInit {
  stats = signal<any[]>([]);
  rfqs = signal<any[]>([]);
  currentPage = 1;
  totalPages = 1;
  selectedStatus = '';

  isFilterOpen = false;

  constructor(private rfqService: RfqService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(page: number = 1, status: string = '') {
    this.currentPage = page;

    this.rfqService.getStats().subscribe(res => {
      const data = res.data;
      this.stats.set([
        { title: 'Avg Response Time', value: data.avgResponseTime || 'N/A', icon: 'images/rfq/timer.png' },
        { title: 'Match Rate', value: (data.matchRate || 0) + '%', icon: 'images/rfq/star.png' },
        { title: 'Stale RFQs', value: data.staleRFQsCount || 0, icon: 'images/rfq/RFQ.png' }
      ]);
    });

    this.rfqService.getRfqs(page, 10, status).subscribe(res => {
      this.rfqs.set(res.data.items || []);
      this.totalPages = res.data.totalPages;
    });
  }

  applyFilter() {
    this.isFilterOpen = false;
    this.loadData(1, this.selectedStatus); 
  }

  resetFilter() {
    this.selectedStatus = '';
    this.isFilterOpen = false;
    this.loadData(1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadData(page, this.selectedStatus);
    }
  }

}
