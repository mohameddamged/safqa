// po.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PoService {
  private baseUrl = 'https://safka.runasp.net/api/InventoryOfficer';

  constructor(private http: HttpClient) {}

  // GET /api/InventoryOfficer/purchase-orders -> بيانات صفحة Upcoming POs
  getPOs(page: number, pageSize: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('page', page?.toString() || '1')
      .set('pageSize', pageSize?.toString() || '10');

    return this.http.get<any>(`${this.baseUrl}/purchase-orders`, { params: httpParams });
  }

  // GET /api/InventoryOfficer/purchase-orders/{purchaseOrderId} -> بيانات صفحة PO Details
  getPoById(purchaseOrderId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/purchase-orders/${purchaseOrderId}`);
  }

  // GET /api/InventoryOfficer/purchase-orders/{purchaseOrderId}/tracking -> بيانات صفحة PO Tracking
  getPoTracking(purchaseOrderId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/purchase-orders/${purchaseOrderId}/tracking`);
  }

  // POST /api/InventoryOfficer/purchase-orders/{purchaseOrderId}/fully-delivered -> تأكيد استلام الأوردر كامل
  markFullyDelivered(purchaseOrderId: string | number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/purchase-orders/${purchaseOrderId}/fully-delivered`, {});
  }

  // POST /api/InventoryOfficer/purchase-orders/complaints -> إرسال شكوى (تسليم جزئي / تلفيات / غير مكتمل) وإرسال OTP للفيندور
  submitComplaint(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/purchase-orders/complaints`, formData);
  }

  // GET /api/InventoryOfficer/purchase-orders/{purchaseOrderId}/complaints -> كل الشكاوى الخاصة بأوردر معين
  getComplaints(purchaseOrderId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/purchase-orders/${purchaseOrderId}/complaints`);
  }
}