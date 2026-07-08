import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const REQUEST_TIMEOUT_MS = 30_000;

export interface InventoryProfileAddress {
  country:      string;
  stateRegion:  string;
  city:         string;
  streetNumber: string;
  fullAddress:  string;
}

export interface InventoryProfileData {
  firstName:        string;
  lastName:         string;
  phoneNumber:      string;
  profilePictureUrl: string;
  workEmail:        string;
  title:            string;
  companyName:      string;
  companyEmail:     string;
  companyPhone:     string;
  companyAddress:   InventoryProfileAddress;
}

export interface ApiResponse<T> {
  data:    T;
  success: boolean;
  message: string;
}

export interface UpdatePersonalInfoPayload {
  firstName:   string;
  lastName:    string;
  phoneNumber: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryProfileService {

  private readonly baseUrl = `${environment.apiUrl}/Profile`;

  constructor(private http: HttpClient) {}

  // GET /api/Profile/profile
  getProfile(): Observable<ApiResponse<InventoryProfileData>> {
    return this.http
      .get<ApiResponse<InventoryProfileData>>(`${this.baseUrl}/profile`)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // POST /api/Profile/update-personal-info
  updatePersonalInfo(payload: UpdatePersonalInfoPayload): Observable<ApiResponse<unknown>> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/update-personal-info`, payload)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // POST /api/Profile/update-picture
  updatePicture(file: File): Observable<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/update-picture`, formData)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }
}
