import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcurementService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/Procurement`;
  private readonly rfqVendorBase = `${environment.apiUrl}/RFQVendor`;
  private readonly chatBase = `${environment.apiUrl}/Chat`;
  private readonly profileBase = `${environment.apiUrl}/ProcurementProfile`;

  // ── Purchase Requests ─────────────────────────────────────────────
  getPendingPRs(pageIndex = 1, pageSize = 10): Observable<any> {
    return this.http.get(`${this.base}/purchase-requests`, {
      params: { pageIndex, pageSize }
    });
  }

  getPRById(id: number): Observable<any> {
    return this.http.get(`${this.base}/purchase-requests/${id}`);
  }

  convertToRFQ(id: number, body: { closingDate: string; notesToVendors?: string }): Observable<any> {
    return this.http.put(`${this.base}/purchase-requests/${id}/convert-to-rfq`, body);
  }

  // ── RFQs ──────────────────────────────────────────────────────────
  getRFQs(pageIndex = 1, pageSize = 10): Observable<any> {
    return this.http.get(`${this.base}/rfqs`, {
      params: { pageIndex, pageSize }
    });
  }

  getRFQById(id: number): Observable<any> {
    return this.http.get(`${this.base}/rfqs/${id}`);
  }

  updateRFQ(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/rfqs/${id}`, data);
  }

  // ── Vendor Offers ─────────────────────────────────────────────────
  getRFQsWithOffers(pageIndex = 1, pageSize = 10): Observable<any> {
    return this.http.get(`${this.base}`, {
      params: { pageIndex, pageSize }
    });
  }

  getOffersByRFQ(rfqId: number, pageIndex = 1, pageSize = 10): Observable<any> {
    return this.http.get(`${this.base}/${rfqId}/offers`, {
      params: { pageIndex, pageSize }
    });
  }

  getOfferById(rfqId: number, offerId: number): Observable<any> {
    return this.http.get(`${this.base}/${rfqId}/offers/${offerId}`);
  }

  acceptOffer(offerId: number): Observable<any> {
    return this.http.put(`${this.base}/offers/${offerId}/accept`, {});
  }

  rejectOffer(offerId: number): Observable<any> {
    return this.http.put(`${this.base}/offers/${offerId}/reject`, {});
  }

  requestNegotiation(offerId: number, payload: any = {}): Observable<any> {
    return this.http.post(`${this.base}/offers/${offerId}/request-negotiation`, payload);
  }

  // ── Offer Comparison (AI) ─────────────────────────────────────────
  getOfferComparison(rfqId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/OfferComparison/rfq/${rfqId}`);
  }

  // ── Vendor Performance (AI) ───────────────────────────────────────
  getVendorPerformance(vendorId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/VendorPerformance/${vendorId}/analysis`);
  }

  // ── Purchase Orders ───────────────────────────────────────────────
  getPurchaseOrders(pageIndex = 1, pageSize = 10, status?: string): Observable<any> {
    const params: any = { pageIndex, pageSize };
    if (status) params['status'] = status;
    return this.http.get(`${this.base}/purchase-orders`, { params });
  }

  getPurchaseOrderById(id: number): Observable<any> {
    return this.http.get(`${this.base}/purchase-orders/${id}`);
  }

  // ── Eligible Vendors + Send RFQ ───────────────────────────────────
  getEligibleVendors(rfqId: number): Observable<any> {
    return this.http.get(`${this.rfqVendorBase}/${rfqId}/eligible-vendors`);
  }

  sendRFQToVendors(rfqId: number, vendorIds: number[]): Observable<any> {
    return this.http.post(`${this.rfqVendorBase}/${rfqId}/send`, { vendorIds });
  }

  // ── Chat (REST — history + mark read) ────────────────────────────
  getChatMessages(rfqVendorOfferId: number): Observable<any> {
    return this.http.get(`${this.chatBase}/conversation/${rfqVendorOfferId}`);
  }

  markMessagesAsRead(rfqVendorOfferId: number): Observable<any> {
    return this.http.put(`${this.chatBase}/conversation/${rfqVendorOfferId}/read`, {});
  }

  // ── Profile ───────────────────────────────────────────────────────
  getProfile(): Observable<any> {
    return this.http.get(`${this.profileBase}/profile`);
  }

  updatePersonalInfo(dto: { firstName: string; lastName: string; phoneNumber: string }): Observable<any> {
    return this.http.post(`${this.profileBase}/update-personal-info`, dto);
  }

  updateProfilePicture(file: File): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.profileBase}/update-picture`, form);
  }
}
