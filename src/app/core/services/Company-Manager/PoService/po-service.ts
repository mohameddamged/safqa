// services/po.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class PoService {
  private baseUrl = 'https://safka.runasp.net/api/Procurement';

  constructor(private http: HttpClient) {}

  getAllPurchaseOrders(pageIndex: number, pageSize: number, status: string): Observable<any> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString())
      .set('status', status);

    return this.http.get<any>(`${this.baseUrl}/purchase-orders`, { params });
  }

  getPurchaseOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/purchase-orders/${id}`);
  }
}