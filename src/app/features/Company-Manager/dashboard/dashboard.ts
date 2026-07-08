import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService } from '../../../core/services/Company-Manager/Dashboard/dashboardservice';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  stats: WritableSignal<any[]> = signal([]);
  lineChartData: WritableSignal<any> = signal(null);
  doughnutChartData: WritableSignal<any> = signal(null);

  chartOptions = { responsive: true, maintainAspectRatio: false };
  doughnutOptions = { cutout: '80%', plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false };

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.dashboardService.getDashboardStats().subscribe({
      next: (res) => {
        const d = res.data;
        

        this.stats.set([
          { title: 'Pending Requests', value: d.pendingPurchaseRequestsCount, icon: 'images/icon-pending.png' },
          { title: 'Escrowed Spend', value: d.escrowedSpend + ' EGP', icon: 'images/icon-escrow.png' },
          { title: 'Negotiation Savings', value: d.negotiationSavings + ' EGP', icon: 'images/icon-savings.png' }
        ]);

        this.lineChartData.set({
          labels: d.monthlySpendings.map((m: any) => m.month),
          datasets: [{ data: d.monthlySpendings.map((m: any) => m.amount), label: 'Total Spent', borderColor: '#FB904E', tension: 0.4 }]
        });


        this.doughnutChartData.set({
          labels: d.categorySpendings.map((c: any) => c.categoryName),
          datasets: [{ data: d.categorySpendings.map((c: any) => c.totalAmount), backgroundColor: ['#FB904E', '#7ED9D9', '#FFD700'] }]
        });

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
      }
    });
  }
}