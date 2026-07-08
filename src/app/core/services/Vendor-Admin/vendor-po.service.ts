import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

const REQUEST_TIMEOUT_MS = 30000; // 30s — free hosting (runasp.net) can be slow to wake up

export interface VendorPoListItem {
  id: number;
  title: string;
  deliveryDeadline: string;
  status: string;
  deliveryStatus: string;
  menuOpen?: boolean;
  dropUp?: boolean;
}

export interface VendorPoListData {
  items: VendorPoListItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface VendorPoDetails {
  id: number;
  itemName: string;
  categoryName: string;
  quantity: number;
  unit: string;
  technicalSpecification: string;
  additionalNotes: string;
  cost: number;
  currency: string;
  deliveryDeadline: string;
  country: string;
  state: string;
  city: string;
  street: string;
  fullAddress: string;
  status: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface VendorPoComplaintDetails {
  complaintReason: string;
  receivedQuantity: number;
  damagedQuantity: number;
}

// Possible values seen from the API: 'OnTheWay' | 'NotCompleted' | 'FullyDelivered' | 'Damaged'
export type VendorPoDeliveryStatus = string;

export interface VendorPoTracking {
  id: number;
  orderNumber: string;
  poName: string;
  acceptedAt?: string;
  deliveryStatus: VendorPoDeliveryStatus;
  paymentStatus: string;
  complaintDetails?: VendorPoComplaintDetails;
  complaintPhotoUrls?: string[];
}

@Injectable({ providedIn: 'root' })
export class VendorPoService {

  private baseUrl = 'https://safka.runasp.net/api/VendorPo';

  constructor(private http: HttpClient) {}

  // GET /api/VendorPo?pageNumber=&pageSize=
  getPOs(pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<VendorPoListData>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<VendorPoListData>>(this.baseUrl, { params })
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // GET /api/VendorPo/{poId}/details
  getPoDetails(poId: number): Observable<ApiResponse<VendorPoDetails>> {
    return this.http.get<ApiResponse<VendorPoDetails>>(`${this.baseUrl}/${poId}/details`)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // POST /api/VendorPo/{poId}/approve
  approvePo(poId: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/${poId}/approve`, {})
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // POST /api/VendorPo/{poId}/reject
  rejectPo(poId: number, reason: string): Observable<ApiResponse<unknown>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/${poId}/reject`, JSON.stringify(reason), { headers })
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // GET /api/VendorPo/{poId}/tracking
  getTracking(poId: number): Observable<ApiResponse<VendorPoTracking>> {
    return this.http.get<ApiResponse<VendorPoTracking>>(`${this.baseUrl}/${poId}/tracking`)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // PUT /api/VendorPo/{poId}/on-the-way
  markOnTheWay(poId: number): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/${poId}/on-the-way`, {})
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // POST /api/VendorPo/{poId}/verify-otp
  // Backend expects the OTP as a raw JSON string body (not wrapped in an object).
  verifyOtp(poId: number, otp: string): Observable<ApiResponse<unknown>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/${poId}/verify-otp`, JSON.stringify(otp), { headers })
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }
}
