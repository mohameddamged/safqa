import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private baseUrl = 'http://safka.runasp.net/api/Category';

  constructor(private http: HttpClient) {}

  getAll(pageNumber: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  create(name: string, description: string): Observable<any> {
    return this.http.post(this.baseUrl, { name, description });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  update(id: number, name: string, description: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, { name, description });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}