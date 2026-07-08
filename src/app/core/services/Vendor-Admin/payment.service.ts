import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = 'https://safka.runasp.net';

  constructor(private http: HttpClient) {}

  /** POST /api/Payment/checkout — plan: 1 = Free, 2 = Premium */
  checkout(plan: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Payment/checkout`, { plan });
  }

  /** POST /api/Payment/cancel-subscription */
  cancelSubscription(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Payment/cancel-subscription`, {});
  }
}
