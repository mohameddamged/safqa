import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResultData } from '../../../core/models';
import { CompanyService } from '../../../core/services/company.service';
import { FINANCE_ENDPOINTS } from '../../../core/constants/finance-endpoints';
import {
  FmCompanyInfo,
  FmPagedResult,
  FmPaidInvoiceListItem,
  FmPendingPoDetails,
  FmPendingPoListItem,
  FmPaymentSummary,
  FmPrDetails,
  FmPrListItem,
  FmRecoveredFundDetails,
  FmRecoveredFundListItem,
} from '../models';

const baseUrl = environment.apiUrl;
const PAGE_SIZE = 10;

@Injectable({ providedIn: 'root' })
export class FinancialManagerService {
  private readonly http = inject(HttpClient);
  private readonly companyService = inject(CompanyService);

  // ── Company Info ─────────────────────────────────────────────────────────
  // GET /api/company/CompanyInfo
  getCompanyInfo(): Observable<FmCompanyInfo> {
    return this.companyService.getMyCompany().pipe(
      map((result) => {
        const company = result.data;
        if (!company) throw new Error(result.message || 'Company not found.');
        return {
          companyName:  company.companyName,
          companyEmail: company.workEmail,
          phoneNumber:  company.phoneNumber,
          country:      company.address.country,
          stateRegion:  company.address.stateRegion,
          city:         company.address.city,
          street:       company.address.streetNumber,
          fullAddress:  company.address.fullAddress,
        } satisfies FmCompanyInfo;
      }),
    );
  }

  // ── Pending PRs ───────────────────────────────────────────────────────────
  // GET /api/Finance?pageIndex=&pageSize=
  getPendingPrs(
    pageIndex: number,
    pageSize: number = PAGE_SIZE,
  ): Observable<ApiResultData<FmPagedResult<FmPrListItem>>> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);
    return this.http.get<ApiResultData<FmPagedResult<FmPrListItem>>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.list}`,
      { params },
    );
  }

  // GET /api/Finance/{id}
  getPrDetails(id: number): Observable<ApiResultData<FmPrDetails>> {
    return this.http.get<ApiResultData<FmPrDetails>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.byId(id)}`,
    );
  }

  // PUT /api/Finance/{id}/approve?Notes=...
  approvePr(id: number, notes?: string): Observable<ApiResultData<FmPrDetails>> {
    let params = new HttpParams();
    if (notes?.trim()) params = params.set('Notes', notes.trim());
    return this.http.put<ApiResultData<FmPrDetails>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.approve(id)}`,
      null,
      { params },
    );
  }

  // PUT /api/Finance/{id}/reject?Notes=...
  rejectPr(id: number, notes?: string): Observable<ApiResultData<FmPrDetails>> {
    let params = new HttpParams();
    if (notes?.trim()) params = params.set('Notes', notes.trim());
    return this.http.put<ApiResultData<FmPrDetails>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.reject(id)}`,
      null,
      { params },
    );
  }

  // ── Pending PO Invoices ───────────────────────────────────────────────────
  // GET /api/Finance/pending-po-invoices?pageIndex=&pageSize=
  getPendingPoInvoices(
    pageIndex: number,
    pageSize: number = PAGE_SIZE,
  ): Observable<ApiResultData<FmPagedResult<FmPendingPoListItem>>> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);
    return this.http.get<ApiResultData<FmPagedResult<FmPendingPoListItem>>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.pendingPoInvoices}`,
      { params },
    );
  }

  // GET /api/Finance/pending-po-invoices/{purchaseOrderId}
  // Returns full PO details (item info, vendor, cost, delivery)
  getPendingPoInvoiceDetails(id: number): Observable<ApiResultData<FmPendingPoDetails>> {
    return this.http.get<ApiResultData<FmPendingPoDetails>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.pendingPoInvoiceById(id)}`,
    );
  }

  // ── Payment ───────────────────────────────────────────────────────────────
  // GET /api/Finance/{purchaseOrderId}/payment-summary
  // Returns Safqa bank account info for the payment screen
  getPaymentSummary(poId: number): Observable<ApiResultData<FmPaymentSummary>> {
    return this.http.get<ApiResultData<FmPaymentSummary>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.paymentSummary(poId)}`,
    );
  }

  // PUT /api/Finance/{purchaseOrderId}/process-payment
  // Marks PO as PendingSafqaAdminApproval (no body needed)
  processPayment(poId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${baseUrl}/${FINANCE_ENDPOINTS.processPayment(poId)}`,
      null,
    );
  }

  // GET /api/Finance/purchase-orders/{id}/payment-info
  // Payment gateway info (response schema TBD — awaiting Ahmed's clarification)
  getPaymentInfo(id: number): Observable<any> {
    return this.http.get<any>(
      `${baseUrl}/${FINANCE_ENDPOINTS.paymentInfo(id)}`,
    );
  }

  // POST /api/Finance/purchase-orders/{id}/pay
  // Initiates Stripe/payment gateway checkout (response TBD)
  initiatePayment(id: number): Observable<any> {
    return this.http.post<any>(
      `${baseUrl}/${FINANCE_ENDPOINTS.initiatePayment(id)}`,
      null,
    );
  }

  // ── Paid Invoices ─────────────────────────────────────────────────────────
  // GET /api/Finance/paid-invoices?pageIndex=&pageSize=
  getPaidInvoices(
    pageIndex: number,
    pageSize: number = PAGE_SIZE,
  ): Observable<ApiResultData<FmPagedResult<FmPaidInvoiceListItem>>> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);
    return this.http.get<ApiResultData<FmPagedResult<FmPaidInvoiceListItem>>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.paidInvoices}`,
      { params },
    );
  }

  // ── Recovered Funds ───────────────────────────────────────────────────────
  // GET /api/Finance/recovered-funds?pageNumber=&pageSize=
  // NOTE: query param is 'pageNumber' NOT 'pageIndex' for this endpoint
  getRecoveredFunds(
    pageNumber: number,
    pageSize: number = PAGE_SIZE,
  ): Observable<ApiResultData<FmPagedResult<FmRecoveredFundListItem>>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get<ApiResultData<FmPagedResult<FmRecoveredFundListItem>>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.recoveredFunds}`,
      { params },
    );
  }

  // GET /api/Finance/recovered-funds/{purchaseOrderId}
  getRecoveredFundDetails(id: number): Observable<ApiResultData<FmRecoveredFundDetails>> {
    return this.http.get<ApiResultData<FmRecoveredFundDetails>>(
      `${baseUrl}/${FINANCE_ENDPOINTS.recoveredFundById(id)}`,
    );
  }
}
