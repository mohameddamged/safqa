import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
//   addProduct(productData: any) {
//   return this.http.post('https://localhost:7062/api/Products', productData);
// }
  private baseUrl = 'https://safka.runasp.net/api/Products';

  constructor(private http: HttpClient) {}

  getProducts(pageIndex: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createProduct(productData: FormData): Observable<any> {
    return this.http.post(this.baseUrl, productData);
  }

  updateProduct(id: number, productData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, productData);
  }

  addProductImages(id: number, images: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/images`, images);
  }

  deleteProductImage(productId: number, imageId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${productId}/images/${imageId}`);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}