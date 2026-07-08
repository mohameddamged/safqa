import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { COMPANY_ENDPOINTS } from '../constants/company-endpoints';
import { ApiResultData, CompanyInfo } from '../models';

const baseUrl = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);

  getMyCompany(): Observable<ApiResultData<CompanyInfo>> {
    return this.http.get<ApiResultData<CompanyInfo>>(`${baseUrl}/${COMPANY_ENDPOINTS.me}`);
  }
}