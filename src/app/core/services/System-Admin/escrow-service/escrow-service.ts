import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EscrowService {
  private baseUrl = 'https://safka.runasp.net/api/SystemAdmin';

  constructor(private http: HttpClient) {}

  getEscrowList(params: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('pageSize', params.pageSize?.toString() || '10');

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<any>(`${this.baseUrl}/list`, { params: httpParams });
  }

  getDetails(poId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${poId}/details`);
  }

  // جدول "Safqa Payments" (معاملات الموردين) بييجي من GET /api/AdminEscrowPayments/VendorsTransactions
  private safqaPaymentsUrl = 'https://safka.runasp.net/api/AdminEscrowPayments/VendorsTransactions';

  getSafqaPayments(params: { status?: string }): Observable<any> {
    let httpParams = new HttpParams();

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<any>(this.safqaPaymentsUrl, { params: httpParams });
  }

  // تفاصيل معاملة مورد واحدة (صفحة Transactions Details)
  // GET /api/AdminEscrowPayments/VendorsTransactions/{poId}
  getVendorTransactionDetails(poId: number): Observable<any> {
    return this.http.get<any>(`${this.safqaPaymentsUrl}/${poId}`);
  }

  // زرار "Mark As Paid" — بيرفع إيصال الدفع (لو المستخدم اختار صورة) ويأكد الدفع
  // POST /api/AdminEscrowPayments/VendorsTransactions/{poId}/mark-as-paid
  markVendorTransactionAsPaid(poId: number, receiptFile?: File | null): Observable<any> {
    const formData = new FormData();
    if (receiptFile) {
      formData.append('receiptImage', receiptFile);
    }
    return this.http.post<any>(`${this.safqaPaymentsUrl}/${poId}/mark-as-paid`, formData);
  }

  // GET /api/SystemAdmin/returned-funds
getReturnedFunds(params: { pageNumber?: number; pageSize?: number }): Observable<any> {
  const httpParams = new HttpParams()
    .set('pageNumber', params.pageNumber?.toString() || '1')
    .set('pageSize',   params.pageSize?.toString()   || '10');
  return this.http.get<any>(`${this.baseUrl}/returned-funds`, { params: httpParams });
}

// GET /api/SystemAdmin/returned-funds/{purchaseOrderId}
getReturnedFundDetails(purchaseOrderId: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/returned-funds/${purchaseOrderId}`);
}

// PUT /api/SystemAdmin/returned-funds/{purchaseOrderId}/receipt
uploadReturnedFundReceipt(purchaseOrderId: number, file: File): Observable<any> {
  const formData = new FormData();
  formData.append('ReceiptImage', file);
  return this.http.put<any>(
    `${this.baseUrl}/returned-funds/${purchaseOrderId}/receipt`,
    formData,
  );
}
}

