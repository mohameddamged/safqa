import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerificationService {

  private baseUrl = 'https://safka.runasp.net/api/admin';

  constructor(private http: HttpClient) { }

  getPending(type: 'companies' | 'vendors', page: number = 1, pageSize: number = 10): Observable<any> {
  return this.http.get(`${this.baseUrl}/${type}/pending?page=${page}&pageSize=${pageSize}`);
}

  getDetails(type: 'companies' | 'vendors', id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${type}/${id}`);
  }

  approve(type: 'companies' | 'vendors', id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${type}/${id}/approve`, {});
  }

  reject(type: 'companies' | 'vendors', id: number, reason: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.put(`${this.baseUrl}/${type}/${id}/reject`, JSON.stringify(reason), { headers });
  }
}