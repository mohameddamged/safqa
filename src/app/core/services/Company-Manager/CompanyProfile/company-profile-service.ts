import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanyProfileService {
  private http = inject(HttpClient);
  private baseUrl = 'https://safka.runasp.net/api/CompanyProfile';

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile`);
  }

  updateName(name: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-name`, `"${name}"`, { headers: { 'Content-Type': 'application/json' } });
  }

  updatePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put(`${this.baseUrl}/update-picture`, formData);
  }

  updateAddress(address: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-address`, address);
  }

  updateBankAccount(bank: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-bank-account`, bank);
  }
}