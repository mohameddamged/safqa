import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface BankAccountInfo {
  legalName: string;
  iban: string;
  bankName: string;
  accountNumber: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class BankAccountService {
  private readonly baseUrl = `${environment.apiUrl}/VendorInvoices`;

  private _account: BankAccountInfo | null = null;

  constructor(private http: HttpClient) {}

  get account(): BankAccountInfo | null {
    return this._account;
  }

  /** Sets the locally-held bank account (e.g. from the vendor profile response) without hitting the API. */
  setLocal(info: BankAccountInfo | null): void {
    this._account = info ? { ...info } : null;
  }

  /** POST /api/VendorInvoices/bank-account — persists the bank account to the database. */
  saveToApi(info: BankAccountInfo): Observable<ApiResponse<unknown>> {
    const payload = {
      accountHolderName: info.legalName,
      iban: info.iban,
      bankName: info.bankName,
      accountNumber: info.accountNumber,
    };

    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/bank-account`, payload)
      .pipe(tap(() => this.setLocal(info)));
  }

  save(info: BankAccountInfo): void {
    this._account = { ...info };
  }

  remove(): void {
    this._account = null;
  }
}
