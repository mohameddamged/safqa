import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService } from '../../core/services/dashboard-service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './dashboard.html'
})
export class AdminDashboard implements OnInit {
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  stats: WritableSignal<any[]> = signal([]);
  lineChartData: WritableSignal<any> = signal(null);
  barChartData: WritableSignal<any> = signal(null);
  doughnutDataList = signal<any[]>([]);

  chartOptions = { responsive: true, maintainAspectRatio: false, layout: { padding: 10 } };
  doughnutOptions = { responsive: true, cutout: '80%', plugins: { legend: { display: false } } };

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
// stats = [
//   { title: 'Pending Approvals', value: '124', icon: 'images/dashboard/icon0.png' },
//   { title: 'Monthly Revenue', value: '8,400', icon: 'images/dashboard/icon1.png' },
//   { title: 'Total POs', value: '230', icon: 'images/dashboard/icon4.png' }
// ];

// ngOnInit(): void {
//   throw new Error('Method not implemented.');
// }

// barChartData: ChartConfiguration<'bar'>['data'] = {
//   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
//   datasets: [
//     { data: [400, 390, 200, 180, 160, 750, 50], label: 'Companies', backgroundColor: '#FB904E', borderRadius: 8, barThickness: 25 },
//     { data: [420, 900, 150, 450, 220, 320, 130], label: 'Vendors', backgroundColor: '#7ED9D9', borderRadius: 8, barThickness: 25 }
//   ]
// };

// barChartOptions: ChartConfiguration<'bar'>['options'] = {
//   responsive: true,
//   maintainAspectRatio: false,
//   layout: { padding: 20 },
//   plugins: { legend: { display: false } },
//   scales: { x: { grid: { display: false } }, y: { border: { display: false } } }
// };

// doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
//   labels: ['Pro plan', 'Free plan'],
//   datasets: [{
//     data: [35, 65],
//     backgroundColor: ['#FB904E', '#7ED9D9'],
//     borderRadius: 10,
//     borderWidth: 0
//   }]
// };

// doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
//   responsive: true,
//   cutout: '80%',
//   plugins: { legend: { display: false } }
// };

// lineChartData: ChartConfiguration<'line'>['data'] = {
//   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//   datasets: [
//     {
//       data: [-1000, 800, 200, 100, 0, -300, 300],
//       label: 'Companies',
//       borderColor: '#FB904E',
//       backgroundColor: 'rgba(251, 144, 78, 0.1)',
//       tension: 0.4,
//       fill: true
//     },
//     {
//       data: [-1200, -600, -900, -700, -200, -500, 100],
//       label: 'Vendors',
//       borderColor: '#7ED9D9',
//       backgroundColor: 'rgba(126, 217, 217, 0.1)',
//       tension: 0.4,
//       fill: true
//     }
//   ]
// };

// lineChartOptions: ChartConfiguration<'line'>['options'] = {
//   responsive: true,
//   maintainAspectRatio: false,
//   layout: { padding: 20 },
//   plugins: { legend: { display: false } },
//   scales: {
//     x: { grid: { display: false } },
//     y: { min: -1500, max: 1500, border: { display: false } }
//   }
// };
