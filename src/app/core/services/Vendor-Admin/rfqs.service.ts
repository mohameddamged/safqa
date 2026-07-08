import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Shape returned by GET /api/RFQVendor/vendor/my-rfqs ──
export interface ApiRfqItem {
  rfqId: number;
  rfqTitle: string;
  companyName: string;
  rfqDeadline: string; // ISO date string
}

export interface ApiPagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiRfqDetail {
  rfqId: number;
  rfqTitle: string;
  itemName: string;
  categoryName: string;
  quantity: number;
  unit: string;
  additionalNotes: string;
  notesToVendors: string;
  rfqDeadline: string;
  deliveryDeadline: string;
  country: string;
  stateRegion: string;
  city: string;
  streetNumber: string;
  fullAddress: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

const BASE_URL = 'https://safka.runasp.net';

// NOTE: auth token is attached automatically by Core/interceptors/auth-interceptor.ts
@Injectable({ providedIn: 'root' })
export class RfqsService {

  constructor(private http: HttpClient) {}

  /** GET /api/RFQVendor/vendor/my-rfqs */
  getMyRfqs(pageNumber = 1, pageSize = 10): Observable<ApiResponse<ApiPagedResult<ApiRfqItem>>> {
    return this.http.get<ApiResponse<ApiPagedResult<ApiRfqItem>>>(
      `${BASE_URL}/api/RFQVendor/vendor/my-rfqs`,
      { params: { pageNumber, pageSize } }
    );
  }

  /** GET /api/RFQVendor/vendor/my-rfqs/{rfqId} */
  getRfqDetails(rfqId: string): Observable<ApiResponse<ApiRfqDetail>> {
    return this.http.get<ApiResponse<ApiRfqDetail>>(
      `${BASE_URL}/api/RFQVendor/vendor/my-rfqs/${encodeURIComponent(rfqId)}`
    );
  }
}
