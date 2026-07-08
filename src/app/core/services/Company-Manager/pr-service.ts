import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrService {
  private http = inject(HttpClient);
  private baseUrl = 'https://safka.runasp.net/api/CompanyAdmin';

  getPendingPRs(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/pending?pageIndex=${page}&pageSize=10`);
  }

  getPrDetails(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  approvePr(id: string, notes: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/approve?Notes=${notes}`, {});
  }

  rejectPr(id: string, notes: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/reject?Notes=${notes}`, {});
  }
}