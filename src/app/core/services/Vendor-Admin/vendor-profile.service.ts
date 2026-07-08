import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const REQUEST_TIMEOUT_MS = 30_000;

export interface VendorProfileAddress {
  country:      string;
  stateRegion:  string;
  city:         string;
  streetNumber: string;
  fullAddress:  string;
}

export interface VendorProfileBankAccount {
  accountHolderName: string;
  bankName:          string;
  iban:              string;
  accountNumber:     string;
}

export interface VendorProfileData {
  vendorName:         string;
  taxId:              string;
  profilePictureUrl:  string;
  taxIdFrontImageUrl: string;
  taxIdBackImageUrl:  string;
  workEmail:          string;
  phoneNumber:        string;
  planType:           string;
  address:            VendorProfileAddress;
  bankAccount:        VendorProfileBankAccount | null;
}

export interface ApiResponse<T> {
  data:    T;
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class VendorProfileService {

  private readonly baseUrl = `${environment.apiUrl}/VendorProfile`;

  constructor(private http: HttpClient) {}

  // GET /api/VendorProfile/profile
  getProfile(): Observable<ApiResponse<VendorProfileData>> {
    return this.http
      .get<ApiResponse<VendorProfileData>>(`${this.baseUrl}/profile`)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // PUT /api/VendorProfile/update-name
  updateName(vendorName: string): Observable<ApiResponse<unknown>> {
    return this.http
      .put<ApiResponse<unknown>>(
        `${this.baseUrl}/update-name`,
        JSON.stringify(vendorName),
        { headers: { 'Content-Type': 'application/json' } },
      )
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // PUT /api/VendorProfile/update-picture
  updatePicture(file: File): Observable<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .put<ApiResponse<unknown>>(`${this.baseUrl}/update-picture`, formData)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }
}
