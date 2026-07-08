import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorDashboardService {

  // GET /api/VendorProfile/dashboard
  private readonly url = `${environment.apiUrl}/VendorProfile/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get(this.url);
  }
}
