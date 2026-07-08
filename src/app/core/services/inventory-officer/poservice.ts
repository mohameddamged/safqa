import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PoService {
  private readonly baseUrl = `${environment.apiUrl}/InventoryOfficer`;

  constructor(private http: HttpClient) {}

  // GET /api/InventoryOfficer/dashboard-stats
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard-stats`);
  }

  // GET /api/InventoryOfficer/purchase-orders
  getPOs(page: number, pageSize: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('page', page?.toString() || '1')
      .set('pageSize', pageSize?.toString() || '10');
    return this.http.get<any>(`${this.baseUrl}/purchase-orders`, { params: httpParams });
  }

  // GET /api/InventoryOfficer/purchase-orders/{purchaseOrderId}
  getPoById(purchaseOrderId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/purchase-orders/${purchaseOrderId}`);
  }

  // GET /api/InventoryOfficer/purchase-orders/{purchaseOrderId}/tracking
  getPoTracking(purchaseOrderId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/purchase-orders/${purchaseOrderId}/tracking`);
  }

  // POST /api/InventoryOfficer/purchase-orders/{purchaseOrderId}/fully-delivered
  markFullyDelivered(purchaseOrderId: string | number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/purchase-orders/${purchaseOrderId}/fully-delivered`, {});
  }

  // POST /api/InventoryOfficer/purchase-orders/complaints
  submitComplaint(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/purchase-orders/complaints`, formData);
  }

  // GET /api/InventoryOfficer/purchase-orders/{purchaseOrderId}/complaints
  getComplaints(purchaseOrderId: string | number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/purchase-orders/${purchaseOrderId}/complaints`);
  }
}
