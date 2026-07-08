import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RfqService {
  private baseUrl = 'http://safka.runasp.net/api/RFQs';

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Stats`);
  }

  // getRfqs(status: string = '', pageNumber: number = 1, pageSize: number = 10): Observable<any> {
  //   return this.http.get(`${this.baseUrl}?Status=${status}&PageNumber=${pageNumber}&PageSize=${pageSize}`);
  // }
  getRfqs(pageNumber: number = 1, pageSize: number = 10, status: string = ''): Observable<any> {
  let url = `${this.baseUrl}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
  if (status) {
    url += `&Status=${status}`; 
  }
  return this.http.get(url);
}
}