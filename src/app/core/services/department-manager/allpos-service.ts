import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PurchaseOrder {
  id:               number;
  vendorName:       string;
  companyName:      string;
  cost:             number;
  currency:         string;
  deliveryDeadline: string;
  status:           string;
  createdAt:        string;
  paymentDate:      string;
}

export interface PurchaseOrderDetails {
  id:               number;
  vendorName:       string;
  companyName:      string;
  cost:             number;
  currency:         string;
  deliveryDeadline: string;
  status:           string;
  createdAt:        string;
  paymentDate:      string;
  // Additional detail fields (may vary based on backend)
  rfqTitle?:        string;
  itemName?:        string;
  quantity?:        number;
  unit?:            string;
  technicalSpecs?:  string;
  paymentMethod?:   string;
}

export interface PurchaseOrdersResponse {
  success: boolean;
  message: string;
  data: {
    items:      PurchaseOrder[];
    pageNumber: number;
    pageSize:   number;
    totalCount: number;
    totalPages: number;
  };
}

export interface PurchaseOrderDetailsResponse {
  success: boolean;
  message: string;
  data:    PurchaseOrderDetails;
}

@Injectable({ providedIn: 'root' })
export class DepartmentManagerService {
  private readonly baseUrl = `${environment.apiUrl}/DepartmentManager`;

  constructor(private http: HttpClient) {}

  // GET /api/DepartmentManager/company/purchase-orders
  getPurchaseOrders(
    pageNumber: number = 1,
    pageSize:   number = 10,
  ): Observable<PurchaseOrdersResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize',   pageSize.toString());
    return this.http.get<PurchaseOrdersResponse>(
      `${this.baseUrl}/company/purchase-orders`,
      { params },
    );
  }

  // GET /api/DepartmentManager/purchase-orders/{purchaseOrderId}
  getPurchaseOrderById(purchaseOrderId: number): Observable<PurchaseOrderDetailsResponse> {
    return this.http.get<PurchaseOrderDetailsResponse>(
      `${this.baseUrl}/purchase-orders/${purchaseOrderId}`,
    );
  }
}
