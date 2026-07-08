import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../../core/services/System-Admin/dashborad-service/dashboard-service';

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
  barChartData: WritableSignal<any> = signal(null);
  doughnutDataList = signal<any[]>([]);

  chartOptions = { responsive: true, maintainAspectRatio: false, layout: { padding: 10 } };
  // doughnutOptions = { responsive: true, cutout: '80%', plugins: { legend: { display: false } } };

  doughnutOptions = {
  cutout: '80%', 
  plugins: {
    legend: {
      display: false 
    }
  },
  responsive: true,
  maintainAspectRatio: false
};

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      cards: this.dashboardService.getCards(),
      breakdown: this.dashboardService.getMonthlyBreakdown(),
      subs: this.dashboardService.getSubscriptionBreakdown()
    }).subscribe({
      next: (res) => {
        const d = res.cards.data;
        this.stats.set([
          { title: 'Pending Approvals', value: d.pendingApprovalsCount, icon: 'images/dashboard/icon0.png' },
          { title: 'Monthly Revenue', value: d.monthlyRevenue, icon: 'images/dashboard/icon1.png' },
          { title: 'Total POs', value: d.totalPOsCount, icon: 'images/dashboard/icon4.png' }
        ]);

        const users = res.breakdown.data.usersBreakdown;
        const rev = res.breakdown.data.revenueBreakdown;
        
        this.lineChartData.set({
          labels: users.map((u: any) => u.month),
          datasets: [
            { data: users.map((u: any) => u.companiesCount), label: 'Companies', borderColor: '#FB904E', tension: 0.4 },
            { data: users.map((u: any) => u.vendorsCount), label: 'Vendors', borderColor: '#7ED9D9', tension: 0.4 }
          ]
        });

        this.barChartData.set({
          labels: rev.map((r: any) => r.month),
          datasets: [
            { data: rev.map((r: any) => r.companiesRevenue), label: 'Companies', backgroundColor: '#FB904E' },
            { data: rev.map((r: any) => r.vendorsRevenue), label: 'Vendors', backgroundColor: '#7ED9D9' }
          ]
        });

        const s = res.subs.data;
        this.doughnutDataList.set([
          { label: 'Vendors', data: { labels: ['Pro', 'Free'], datasets: [{ data: [s.vendorProPlanCount, s.vendorFreePlanCount], backgroundColor: ['#FB904E', '#7ED9D9'] }] } },
          { label: 'Companies', data: { labels: ['Pro', 'Free'], datasets: [{ data: [s.companyProPlanCount, s.companyFreePlanCount], backgroundColor: ['#FB904E', '#7ED9D9'] }] } }
        ]);

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Sorry, there was a problem fetching the data. Please check your connection and try again later.');
        this.loading.set(false);
      }
    });
  }
}
