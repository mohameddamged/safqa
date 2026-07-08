import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const BASE_URL = 'https://safka.runasp.net';
const LOCAL_DRAFTS_STORAGE_KEY = 'safka-local-drafts';

// NOTE: auth token is attached automatically by Core/interceptors/auth-interceptor.ts

export type NegotiationStatus = 'negotiated' | 'requested' | 'none';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  productPhotos: string[];
}

export interface ApiOfferItem {
  id: number | string;
  rfqId: number | string;
  rfqVendorId?: number | string;
  rfqTitle: string;
  productName?: string;
  companyName?: string;
  categoryId?: number;
  categoryName?: string;
  cost?: number;
  currency?: string;
  unit?: string;
  quantity?: number;
  rfqDeadline?: string;
  offerDeadline?: string;
  deliveryDeadline?: string;
  status: string;
  negotiation?: string;
  submittedAt?: string;
  productId?: number;
  productPhotos?: string[];
  technicalSpecs?: string;
  additionalNotes?: string;
  form?: {
    productId: number;
    itemName: string;
    category: number | string;
    quantity: string;
    unit: string;
    technicalSpecs: string;
    additionalNotes: string;
    cost: string;
    currency: string;
    offerDeadline: string;
    deliveryDeadline: string;
  };
}

export interface OfferRecord {
  id: string;
  rfqId: string;
  rfqTitle: string;
  rfqDeadline?: string;
  offerDeadline?: string;
  deliveryDeadline?: string;
  companyName?: string;
  status?: string;
  productName?: string;
  categoryName?: string;
  cost?: number;
  currency?: string;
  unit?: string;
  quantity?: number;
  productId?: number;
  productPhotos?: string[];
  technicalSpecs?: string;
  additionalNotes?: string;
  negotiation: NegotiationStatus;
  menuOpen?: boolean;
  dropUp?: boolean;
  // snapshot of the offer form, used for "View my Offer"
  form?: {
    productId: number;
    itemName: string;
    category: number | string;
    quantity: string;
    unit: string;
    technicalSpecs: string;
    additionalNotes: string;
    cost: string;
    currency: string;
    offerDeadline: string;
    deliveryDeadline: string;
  };
}

@Injectable({ providedIn: 'root' })
export class OffersService {

  constructor(private http: HttpClient) {}

  /** GET /api/VendorOffers/categories */
  getCategories(): Observable<{ data: Category[]; success: boolean; message: string }> {
    return this.http.get<{ data: Category[]; success: boolean; message: string }>(
      `${BASE_URL}/api/VendorOffers/categories`
    );
  }

  /** GET /api/VendorOffers/categories/{categoryId}/products */
  getProductsByCategory(categoryId: number): Observable<{ data: Product[]; success: boolean; message: string }> {
    return this.http.get<{ data: Product[]; success: boolean; message: string }>(
      `${BASE_URL}/api/VendorOffers/categories/${categoryId}/products`
    );
  }

  /** POST /api/VendorOffers/draft - Save an offer as draft */
  saveDraftToApi(payload: {
    rfqId: string;
    productId: number;
    itemName: string;
    category: number | string;
    quantity: string;
    unit: string;
    technicalSpecification: string;
    additionalNotes: string;
    cost: string;
    currency: string;
    offerDeadline: string;
    deliveryDeadline: string;
  }): Observable<{ data: any; success: boolean; message: string }> {
    const quantityNum = Number.isFinite(Number(payload.quantity)) ? parseInt(String(payload.quantity), 10) : undefined;
    const costNum = Number.isFinite(Number(payload.cost)) ? parseFloat(String(payload.cost)) : undefined;

    const draftPayload: any = {
      RFQId: Number(payload.rfqId) || undefined,
      ProductId: payload.productId ? Number(payload.productId) : undefined,
      ItemName: payload.itemName,
      Category: payload.category,
      Unit: payload.unit,
      TechnicalSpecification: payload.technicalSpecification,
      AdditionalNotes: payload.additionalNotes,
      Currency: payload.currency,
      OfferDeadline: payload.offerDeadline,
      DeliveryDeadline: payload.deliveryDeadline,
    };

    if (quantityNum !== undefined) draftPayload.Quantity = quantityNum;
    if (costNum !== undefined) draftPayload.Cost = costNum;

    return this.http.post<{ data: any; success: boolean; message: string }>(
      `${BASE_URL}/api/VendorOffers/draft`,
      { request: draftPayload }
    );
  }

  /** POST raw payload to /api/VendorOffers/draft exactly as provided */
  saveDraftRaw(payload: any): Observable<{ data: any; success: boolean; message: string }> {
    return this.http.post<{ data: any; success: boolean; message: string }>(
      `${BASE_URL}/api/VendorOffers/draft`,
      payload
    );
  }

  private extractMyOffersItems(res: any): ApiOfferItem[] {
    const items = res?.data?.items ?? res?.data?.data?.items ?? res?.data ?? [];
    return Array.isArray(items) ? items as ApiOfferItem[] : [];
  }

  /** PUT /api/VendorOffers/{offerId}/draft - Update an existing draft offer */
  updateDraftToApi(offerId: string, payload: {
    rfqId?: string;
    productId: number;
    itemName?: string;
    category?: number | string;
    quantity: string | number;
    unit: string;
    technicalSpecification: string;
    additionalNotes: string;
    cost: string | number;
    currency: string;
    offerDeadline: string;
    deliveryDeadline: string;
  }): Observable<{ data: any; success: boolean; message: string }> {
    const quantityNum = Number(payload.quantity) || 0;
    const costNum = Number(payload.cost) || 0;

    const draftPayload = {
      productId: Number(payload.productId) || 0,
      cost: costNum,
      unit: payload.unit,
      quantity: quantityNum,
      currency: payload.currency,
      offerDeadline: this.toIsoDateTime(payload.offerDeadline),
      deliveryDeadline: this.toIsoDateTime(payload.deliveryDeadline),
      technicalSpecification: payload.technicalSpecification ?? '',
      additionalNotes: payload.additionalNotes ?? '',
    };

    return this.http.put<{ data: any; success: boolean; message: string }>(
      `${BASE_URL}/api/VendorOffers/${offerId}/draft`,
      draftPayload
    );
  }

  /** Normalizes a date-only or partial date string into a full ISO 8601 datetime */
  private toIsoDateTime(value?: string): string {
    if (!value) return '';
    let v = value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      v = `${v}T00:00:00.000Z`;
    } else if (!/Z$|[+-]\d{2}:\d{2}$/.test(v)) {
      v = `${v}Z`;
    }
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toISOString();
    return value;
  }

  /** POST /api/VendorOffers/submit - Submit an offer to the company */
  submitOfferToApi(payload: {
    rfqId: string;
    productId: number;
    itemName?: string;
    category?: number | string;
    quantity: string | number;
    unit: string;
    technicalSpecification: string;
    additionalNotes: string;
    cost: string | number;
    currency: string;
    offerDeadline: string;
    deliveryDeadline: string;
  }): Observable<{ data: any; success: boolean; message: string }> {
    const submitPayload = {
      rfqId: Number(payload.rfqId) || 0,
      productId: Number(payload.productId) || 0,
      cost: Number(payload.cost) || 0,
      currency: payload.currency,
      unit: payload.unit,
      quantity: Number(payload.quantity) || 0,
      offerDeadline: this.toIsoDateTime(payload.offerDeadline),
      deliveryDeadline: this.toIsoDateTime(payload.deliveryDeadline),
      technicalSpecification: payload.technicalSpecification ?? '',
      additionalNotes: payload.additionalNotes ?? '',
    };

    return this.http.post<{ data: any; success: boolean; message: string }>(
      `${BASE_URL}/api/VendorOffers/submit`,
      submitPayload
    );
  }

  /** DELETE /api/VendorOffers/{offerId}/draft - Delete a draft on the server */
  deleteDraftFromApi(offerId: string): Observable<{ data: any; success: boolean; message: string }> {
    return this.http.delete<{ data: any; success: boolean; message: string }>(
      `${BASE_URL}/api/VendorOffers/${offerId}/draft`
    );
  }

  /** GET /api/VendorOffers/my-offers - Fetch all offers (filter by status in component) */
  getMyOffers(): Observable<{ data: ApiOfferItem[]; success: boolean; message: string }> {
    return this.http.get<any>(
      `${BASE_URL}/api/VendorOffers/my-offers`
    ).pipe(
      map(res => {
        let apiItems: ApiOfferItem[] = [];
        try {
          apiItems = this.extractMyOffersItems(res);
        } catch {
          apiItems = [];
        }

        return {
          data: apiItems,
          success: !!res?.success,
          message: res?.message ?? ''
        };
      }),
      catchError(() => of({
        data: [],
        success: false,
        message: 'Network error – showing local drafts only'
      }))
    );
  }

  /** GET drafts only (filters server results to items whose status is draft) */
  getMyDraftsApi(): Observable<ApiOfferItem[]> {
    return this.getMyOffers().pipe(
      map(res => Array.isArray(res.data) ? (res.data as ApiOfferItem[]) : []),
      map(items => items.filter(item => this.isDraftStatus((item as any).status))),
      catchError(() => of([] as ApiOfferItem[]))
    );
  }

  /** GET offers whose status is anything other than Draft */
  getMyNonDraftOffers(): Observable<OfferRecord[]> {
    return this.getMyOffers().pipe(
      map(res => Array.isArray(res.data) ? (res.data as ApiOfferItem[]) : []),
      map(items => items.filter(item => !this.isDraftStatus((item as any).status))),
      map(items => items.map(item => this.mapApiItemToRecord(item))),
      catchError(() => of([] as OfferRecord[]))
    );
  }

  /** GET /api/VendorOffers/submitted-offers - paginated list of the vendor's submitted offers */
  getSubmittedOffers(pageNumber = 1, pageSize = 50): Observable<{ data: ApiOfferItem[]; success: boolean; message: string }> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<any>(
      `${BASE_URL}/api/VendorOffers/submitted-offers`,
      { params }
    ).pipe(
      map(res => {
        const items = res?.data?.items ?? res?.data ?? [];
        return {
          data: Array.isArray(items) ? (items as ApiOfferItem[]) : [],
          success: !!res?.success,
          message: res?.message ?? ''
        };
      }),
      catchError(() => of({
        data: [],
        success: false,
        message: 'Network error – could not load submitted offers'
      }))
    );
  }

  /** GET the vendor's submitted offers, mapped to the shape used across the UI */
  getMySubmittedOffers(): Observable<OfferRecord[]> {
    return this.getSubmittedOffers().pipe(
      map(res => res.data.map(item => this.mapApiItemToRecord(item))),
      catchError(() => of([] as OfferRecord[]))
    );
  }

  /** GET /api/VendorOffers/{offerId} - full details of a single offer */
  getOfferDetails(offerId: string): Observable<{ data: OfferRecord | null; success: boolean; message: string }> {
    return this.http.get<any>(
      `${BASE_URL}/api/VendorOffers/${offerId}`
    ).pipe(
      map(res => ({
        data: res?.data ? this.mapApiItemToRecord(res.data as ApiOfferItem) : null,
        success: !!res?.success,
        message: res?.message ?? ''
      })),
      catchError(() => of({
        data: null,
        success: false,
        message: 'Network error – could not load offer details'
      }))
    );
  }

  private isDraftStatus(status: unknown): boolean {
    const normalized = typeof status === 'string' ? status.trim().toLowerCase() : '';
    return normalized === 'draft' || normalized === 'drafted' || normalized === 'drafts';
  }

  private mapApiNegotiation(value: unknown): NegotiationStatus {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (normalized === 'negotiated') return 'negotiated';
    if (normalized === 'requested' || normalized === 'negotiationrequested') return 'requested';
    return 'none';
  }

  private pickField(obj: any, keys: string[]): string {
    if (!obj) return '';
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== '') return String(v);
    }
    return '';
  }

  /** Converts a raw API offer/draft item into the shape used across the UI */
  mapApiItemToRecord(item: ApiOfferItem): OfferRecord {
    const technicalSpecs = this.pickField(item, [
      'technicalSpecs', 'technicalSpecification', 'TechnicalSpecs', 'TechnicalSpecification', 'technical_specification'
    ]);
    const additionalNotes = this.pickField(item, [
      'additionalNotes', 'notes', 'AdditionalNotes', 'Notes', 'additional_notes'
    ]);

    return {
      id: String(item.id),
      rfqId: String(item.rfqId),
      rfqTitle: item.rfqTitle,
      rfqDeadline: item.rfqDeadline ?? '',
      offerDeadline: item.offerDeadline ?? '',
      deliveryDeadline: item.deliveryDeadline ?? '',
      companyName: item.companyName || item.productName,
      productName: item.productName,
      categoryName: item.categoryName,
      cost: item.cost,
      currency: item.currency,
      unit: item.unit,
      quantity: item.quantity,
      productId: item.productId,
      productPhotos: item.productPhotos ?? [],
      technicalSpecs,
      additionalNotes,
      status: item.status?.toString() ?? 'Draft',
      negotiation: this.mapApiNegotiation(item.negotiation),
      form: item.form ?? {
        productId: item.productId ?? 0,
        itemName: item.productName ?? '',
        category: item.categoryName ?? '',
        quantity: item.quantity != null ? String(item.quantity) : '',
        unit: item.unit ?? '',
        technicalSpecs,
        additionalNotes,
        cost: item.cost != null ? String(item.cost) : '',
        currency: item.currency ?? '',
        offerDeadline: item.offerDeadline ?? '',
        deliveryDeadline: item.deliveryDeadline ?? '',
      },
    };
  }

  // ── Local reactive caches consumed by the RFQs/Offers/Drafts pages ──
  private offers$ = new BehaviorSubject<OfferRecord[]>([]);
  private drafts$ = new BehaviorSubject<OfferRecord[]>(this.loadLocalDrafts());

  getOffers() {
    this.refreshOffersFromApi();
    return this.offers$.asObservable();
  }

  getOffersSnapshot(): OfferRecord[] {
    return this.offers$.value;
  }

  getDrafts() {
    this.refreshDraftsFromApi();
    return this.drafts$.asObservable();
  }

  getDraftsSnapshot(): OfferRecord[] {
    return this.drafts$.value;
  }

  /** Pulls the vendor's submitted/negotiated offers from the API into the local cache */
  refreshOffersFromApi(): void {
    this.getMyNonDraftOffers().subscribe(list => this.offers$.next(list));
  }

  /** Pulls the vendor's draft offers from the API (merged with any local-only drafts) into the local cache */
  refreshDraftsFromApi(): void {
    this.getMyDraftsApi().subscribe(apiDrafts => {
      const mapped = apiDrafts.map(item => this.mapApiItemToRecord(item));
      const localOnly = this.drafts$.value.filter(d => String(d.id).startsWith('local-'));
      this.drafts$.next([...mapped, ...localOnly]);
    });
  }

  private loadLocalDrafts(): OfferRecord[] {
    try {
      const stored = localStorage.getItem(LOCAL_DRAFTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) as OfferRecord[] : [];
    } catch {
      return [];
    }
  }

  private persistLocalDrafts(): void {
    localStorage.setItem(LOCAL_DRAFTS_STORAGE_KEY, JSON.stringify(this.drafts$.value));
  }

  private nextId(list: OfferRecord[]): string {
    const numericIds = list
      .map(item => Number(item.id))
      .filter(value => !Number.isNaN(value) && Number.isFinite(value));

    const nextNumericId = numericIds.length
      ? Math.max(...numericIds) + 1
      : 1;

    return String(nextNumericId).padStart(5, '0');
  }

  /** Called when the vendor sends an offer to the company (optimistic local update; source of truth is the API). */
  addOffer(record: Omit<OfferRecord, 'id' | 'negotiation'>): OfferRecord {
    const current = this.offers$.value;
    const newRecord: OfferRecord = {
      ...record,
      id: this.nextId(current),
      negotiation: 'none',
    };
    this.offers$.next([newRecord, ...current]);
    return newRecord;
  }

  /** Called when the vendor saves an offer as a local-only draft (used as a fallback if the API call fails). */
  addDraft(record: Omit<OfferRecord, 'id' | 'negotiation'>): OfferRecord {
    const current = this.drafts$.value;
    const newRecord: OfferRecord = {
      ...record,
      id: this.nextId(current),
      negotiation: 'none',
      status: 'Draft',
    };
    this.drafts$.next([newRecord, ...current]);
    this.persistLocalDrafts();
    return newRecord;
  }

  addLocalDraft(record: Omit<OfferRecord, 'id' | 'negotiation'>): OfferRecord {
    const current = this.drafts$.value;
    const localId = `local-${Date.now()}`;
    const newRecord: OfferRecord = {
      ...record,
      id: localId,
      negotiation: 'none',
      status: 'Draft',
    };
    this.drafts$.next([newRecord, ...current]);
    this.persistLocalDrafts();
    return newRecord;
  }

  updateDraft(record: Omit<OfferRecord, 'negotiation'> & { id: string }): OfferRecord | null {
    const current = this.drafts$.value;
    const index = current.findIndex(d => String(d.id) === String(record.id));
    if (index < 0) {
      return null;
    }

    const updatedDraft: OfferRecord = {
      ...current[index],
      ...record,
      negotiation: 'none',
      status: 'Draft',
    };

    const next = [...current];
    next[index] = updatedDraft;
    this.drafts$.next(next);
    this.persistLocalDrafts();
    return updatedDraft;
  }

  getDraftById(id: string): OfferRecord | undefined {
    return this.drafts$.value.find(draft => String(draft.id) === String(id));
  }

  /** Deletes a draft both from the API (if it has a server id) and from the local cache. */
  removeDraft(draft: OfferRecord): void {
    if (!String(draft.id).startsWith('local-')) {
      this.deleteDraftFromApi(String(draft.id)).subscribe();
    }
    this.drafts$.next(this.drafts$.value.filter(d => d !== draft));
    this.persistLocalDrafts();
  }

  removeDraftById(id: string): void {
    if (!String(id).startsWith('local-')) {
      this.deleteDraftFromApi(id).subscribe();
    }
    const next = this.drafts$.value.filter(d => String(d.id) !== String(id));
    this.drafts$.next(next);
    this.persistLocalDrafts();
  }

  upsertServerDraft(record: OfferRecord): void {
    const current = this.drafts$.value.slice();
    const idx = current.findIndex(d => String(d.id) === String(record.id));
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...record };
    } else {
      current.unshift(record);
    }
    this.drafts$.next(current);
    this.persistLocalDrafts();
  }
}
