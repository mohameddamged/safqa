import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// GET /api/VendorInvoices
export interface VendorInvoice {
  purchaseOrderId:   number;
  vendorName:        string | null;
  poTitle:           string | null;
  netPayout:         number;
  deliveryDate:      string | null;
  acceptonDate:      string | null;
  transactionStatus: string;
  menuOpen?:         boolean;
  dropUp?:           boolean;
}

export interface VendorInvoicesResponse {
  data:    VendorInvoice[];
  success: boolean;
  message: string;
}

// GET /api/VendorInvoices/invoices/{purchaseOrderId}
export interface VendorBankAccount {
  accountHolderName: string | null;
  iban:              string | null;
  bankName:          string | null;
  accountNumber:     string | null;
}

export interface VendorInvoiceDetails {
  purchaseOrderId:    number;
  purchaseOrderTitle: string | null;
  deliveryStatus:     string | null;
  bankAccount:        VendorBankAccount | null;
  receiptImageUrl:    string | null;
}

export interface VendorInvoiceDetailsResponse {
  data:    VendorInvoiceDetails;
  success: boolean;
  message: string;
}

export interface VendorBankAccountDto {
  accountHolderName: string | null;
  iban:              string | null;
  bankName:          string | null;
  accountNumber:     string | null;
}

export interface VendorBankAccountResponse {
  data:    VendorBankAccountDto;
  success: boolean;
  message: string;
}

export type Invoice = VendorInvoice;

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/VendorInvoices`;

  // GET /api/VendorInvoices
  getInvoices(): Observable<VendorInvoicesResponse> {
    return this.http.get<VendorInvoicesResponse>(this.baseUrl);
  }

  // GET /api/VendorInvoices/invoices/{purchaseOrderId}
  getInvoiceDetails(purchaseOrderId: number): Observable<VendorInvoiceDetailsResponse> {
    return this.http.get<VendorInvoiceDetailsResponse>(
      `${this.baseUrl}/invoices/${purchaseOrderId}`,
    );
  }

  // GET /api/VendorInvoices/bank-account
  getBankAccount(): Observable<VendorBankAccountResponse> {
    return this.http.get<VendorBankAccountResponse>(`${this.baseUrl}/bank-account`);
  }

  // POST /api/VendorInvoices/bank-account
  saveBankAccount(dto: VendorBankAccountDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bank-account`, dto);
  }
}
