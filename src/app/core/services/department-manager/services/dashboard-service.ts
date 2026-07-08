import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private baseUrl = 'http://safka.runasp.net/api/AdminDashboard';

  constructor(private http: HttpClient) {}

  getCards(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Cards`);
  }

  getSubscriptionBreakdown(): Observable<any> {
    return this.http.get(`${this.baseUrl}/SubscriptionBreakdown`);
  }

  getMonthlyBreakdown(): Observable<any> {
    return this.http.get(`${this.baseUrl}/MonthlyBreakdown`);
  }
}
