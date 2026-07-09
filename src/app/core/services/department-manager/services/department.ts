import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DepartmentOption {
  id: number;
  name: string;
}

export interface ApiResponse {
  data: DepartmentOption[];
  success: boolean;
  message: string;
}

export interface PostApiResponse {
  data: any;
  success: boolean;
  message: string;
}

export interface PurchaseRequestItem {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  currency: string;
  status: string;
  requiredDeliveryDate: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

// شكل الـ PR الكامل زي ما بيرجع من GET /api/DepartmentManager/purchase-requests/{id}
// (نفس الـ endpoint ده بنستخدمه في View Rejection Reason وفي صفحة Edit Purchase Request)
export interface PurchaseRequestDetail {
  id: number;
  prTitle: string;
  itemName: string;
  categoryId: number;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  currency: string;
  requiredDeliveryDate: string;
  technicalSpecifications: string;
  reason: string;
  additionalNotes: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  // مش دايمًا راجعين من الـ API (بيظهروا بس لما الحالة تبقى Rejected)
  rejectionReason?: string | null;
  rejectedBy?: string | null;
  // اختياري: لو الـ backend ضاف رقم النسخة/التعديل (مش موجود في الـ swagger response اللي وصلني لحد دلوقتي)
  revision?: number | null;
}

export interface PurchaseRequestDetailResponse {
  data: PurchaseRequestDetail;
  success: boolean;
  message: string;
}

// شكل الـ payload مطابق للـ Swagger بالظبط:
// categoryId رقم (id)، لكن unit و currency بيتبعتوا كاسم نصي (enum name) مش id
export interface CreatePurchaseRequestPayload {
  itemName: string;
  categoryId: number;
  quantity: number;
  unit: string;               // اسم الـ enum مثل "Piece"
  estimatedPrice: number;
  currency: string;           // اسم الـ enum مثل "EGP"
  requiredDeliveryDate: string; // ISO date string
  technicalSpecifications?: string;
  reason?: string;
  additionalNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  private baseUrl = 'https://safka.runasp.net/api/DepartmentManager';

  getCategories(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/categories`);
  }

  getUnits(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/units`);
  }

  getCurrencies(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/currencies`);
  }

  createPurchaseRequest(payload: CreatePurchaseRequestPayload): Observable<PostApiResponse> {
    return this.http.post<PostApiResponse>(`${this.baseUrl}/purchase-requests`, payload);
  }

  updatePurchaseRequest(id: string, payload: CreatePurchaseRequestPayload): Observable<PostApiResponse> {
    return this.http.put<PostApiResponse>(`${this.baseUrl}/purchase-requests/${id}`, payload);
  }

  getPurchaseRequests(pageIndex: number, pageSize: number, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());
    if (status) params = params.set('status', status);
    return this.http.get<any>(`${this.baseUrl}/purchase-requests`, { params });
  }

  // GET /api/DepartmentManager/purchase-requests/{id}
  // بيرجع تفاصيل PR واحدة كاملة - مستخدم في View Rejection Reason وفي صفحة Edit Purchase Request
  getPurchaseRequestById(id: string | number): Observable<PurchaseRequestDetailResponse> {
    return this.http.get<PurchaseRequestDetailResponse>(`${this.baseUrl}/purchase-requests/${id}`);
  }

  // POST /api/DepartmentManager/purchase-requests/{id}/cancel
  // متاح بس لما الحالة تكون PendingCompanyAdminApproval (نفس شرط الـ Edit)
cancelPurchaseRequest(id: string | number): Observable<any> {
  // 💡 أضفنا responseType: 'text' عشان الأنجولر ميضربش لو الباك إيند رجع فاضي
  return this.http.put(`${this.baseUrl}/purchase-requests/${id}/cancel`, {}, { responseType: 'text' });
}
}
