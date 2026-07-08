import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

const REQUEST_TIMEOUT_MS = 30_000;

export interface DepartmentProfileAddress {
  country: string;
  stateRegion: string;
  city: string;
  streetNumber: string;
  fullAddress: string;
}

// شكل الداتا اللي راجعة من GET /api/Profile/profile زي ما هو بالظبط في السواجر
export interface DepartmentProfileData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePictureUrl: string;
  workEmail: string;
  title: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: DepartmentProfileAddress;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface UpdatePersonalInfoPayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

@Injectable({ providedIn: 'root' })
export class DepartmentProfileService {
  private readonly baseUrl = `${environment.apiUrl}/Profile`;

  constructor(private http: HttpClient) {}

  // GET /api/Profile/profile
  getProfile(): Observable<ApiResponse<DepartmentProfileData>> {
    return this.http
      .get<ApiResponse<DepartmentProfileData>>(`${this.baseUrl}/profile`)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // POST /api/Profile/update-personal-info
  updatePersonalInfo(payload: UpdatePersonalInfoPayload): Observable<ApiResponse<boolean>> {
    return this.http
      .post<ApiResponse<boolean>>(`${this.baseUrl}/update-personal-info`, payload)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  // POST /api/Profile/update-picture
  // ⚠️ الرد بيرجع اسم الملف بس جوه "message" (مش رابط كامل)، مثال:
  // { "success": true, "message": "79b8e65a-fe8f-479e-b290-7baf885f2971.png" }
  updatePicture(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<ApiResponse<string>>(`${this.baseUrl}/update-picture`, formData)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }
}
