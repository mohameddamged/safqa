import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { VendorDashboardService } from '../../../core/services/Vendor-Admin/vendor-dashboard.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './dashboard.component.html',
})
export class VENDORDashboardComponent implements OnInit {

  loading = signal<boolean>(true);
  error   = signal<string | null>(null);

  stats:        WritableSignal<any[]> = signal([]);
  doughnutData  = signal<any>(null);
  lineChartData: WritableSignal<any> = signal(null);
  topProducts   = signal<any[]>([]);
  aiRating      = signal<number>(0);
  aiInsights    = signal<string>('');

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 }
  };

  doughnutOptions = {
    cutout: '80%',
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  constructor(private vendorDashboardService: VendorDashboardService) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.vendorDashboardService.getDashboard().subscribe({
      next: (res: any) => {
        const d = res.data;

        this.stats.set([
          { title: 'Pending RFQs',               value: d.pendingRfqsCount,         icon: 'images/dashboard/icon0.png' },
          { title: 'Delivered Orders Last Month', value: d.deliveredOrdersLastMonth, icon: 'images/dashboard/icon4.png' },
          { title: 'Funds in Escrow',             value: d.fundsInEscrow,            icon: 'images/dashboard/icon1.png' },
        ]);

        this.doughnutData.set({
          labels: ['Won', 'Lost'],
          datasets: [{
            data: [d.rfqWinRate?.Won ?? 0, d.rfqWinRate?.Lost ?? 0],
            backgroundColor: ['#FB904E', '#7ED9D9'],
          }],
        });

        const trend = (d.salesTrend ?? []).slice().reverse();
        this.lineChartData.set({
          labels: trend.map((t: any) => t.monthName),
          datasets: [{
            data:            trend.map((t: any) => t.totalSales),
            label:           'Sales',
            borderColor:     '#FB904E',
            backgroundColor: 'rgba(251,144,78,0.1)',
            tension:         0.4,
            fill:            true,
          }],
        });

        this.topProducts.set(d.topProducts ?? []);
        this.aiRating.set(d.aiRating      ?? 0);
        this.aiInsights.set(d.aiInsights   ?? '');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Sorry, there was a problem fetching the data. Please try again later.');
        this.loading.set(false);
      }
    });
  }
}
