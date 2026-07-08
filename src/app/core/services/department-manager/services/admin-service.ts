import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = 'http://safka.runasp.net/api/admin';

  constructor(private http: HttpClient) { }

  getList(type: 'companies' | 'vendors', params: { status?: string, searchTerm?: string, page?: number, pageSize?: number }): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('pageSize', params.pageSize?.toString() || '10');

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);

    return this.http.get<any>(`${this.baseUrl}/${type}`, { params: httpParams });
  }

  getDetails(type: 'companies' | 'vendors', id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${type}/${id}`);
  }
}