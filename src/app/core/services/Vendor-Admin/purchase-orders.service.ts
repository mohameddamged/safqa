import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type PoStatus = 'pending_payment' | 'processing' | 'on_the_way' | 'delivered' | 'rejected';

export interface PurchaseOrder {
  id: string;
  poTitle: string;
  deliveryDate: string;     // dd/mm/yyyy (placeholder, as per the design mock)
  status: PoStatus;
  menuOpen?: boolean;
  dropUp?: boolean;

  // ── PO details ──
  itemName: string;
  category: string;
  quantity: string;
  unitOfMeasurement: string;
  technicalSpecs: string;
  additionalNotes: string;
  cost: string;
  currency: string;
  deliveryDeadline: string;
  country: string;
  stateRegion: string;
  city: string;
  street: string;
  fullCompanyAddress: string;

  rejectionReason?: string;

  // ── Tracking ──
  orderNumber: string;
  dateAcceptingPo: string;
  shipmentStatus: 'processing' | 'on_the_way';
  confirmationCode: string;
  estimatedDeliveryDate: Date;
}

const LOREM = 'Lorem Ipsum';
const LOREM_LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
const PLACEHOLDER_DATE = 'dd/mm/yyyy';

function makePoDetails(): Omit<PurchaseOrder, 'id' | 'poTitle' | 'deliveryDate' | 'status' | 'menuOpen' | 'dropUp'> {
  return {
    itemName: LOREM,
    category: LOREM,
    quantity: LOREM,
    unitOfMeasurement: LOREM,
    technicalSpecs: `${LOREM_LONG}\n${LOREM_LONG}\n${LOREM_LONG}\n${LOREM_LONG}`,
    additionalNotes: LOREM,
    cost: 'XXXXXXX',
    currency: LOREM,
    deliveryDeadline: PLACEHOLDER_DATE,
    country: 'Egypt',
    stateRegion: 'Dakahlia',
    city: 'Mansoura',
    street: 'El Gomhoria St.',
    fullCompanyAddress: '12 El Gomhoria St., Mansoura, Dakahlia, Egypt',
    orderNumber: 'XXXXXXXXXX',
    dateAcceptingPo: PLACEHOLDER_DATE,
    shipmentStatus: 'processing',
    confirmationCode: '',
    estimatedDeliveryDate: new Date(2026, 7, 17),
  };
}

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {

  private seed: PurchaseOrder[] = [
    { id: 'XXXXX', poTitle: LOREM, deliveryDate: PLACEHOLDER_DATE, status: 'pending_payment', ...makePoDetails() },
    { id: 'XXXXX', poTitle: LOREM, deliveryDate: PLACEHOLDER_DATE, status: 'processing',       ...makePoDetails() },
    { id: 'XXXXX', poTitle: LOREM, deliveryDate: PLACEHOLDER_DATE, status: 'on_the_way',        ...makePoDetails() },
    { id: 'XXXXX', poTitle: LOREM, deliveryDate: PLACEHOLDER_DATE, status: 'delivered',         ...makePoDetails() },
    { id: 'XXXXX', poTitle: LOREM, deliveryDate: PLACEHOLDER_DATE, status: 'delivered',         ...makePoDetails() },
    { id: 'XXXXX', poTitle: LOREM, deliveryDate: PLACEHOLDER_DATE, status: 'delivered',         ...makePoDetails() },
    { id: 'XXXXX', poTitle: LOREM, deliveryDate: PLACEHOLDER_DATE, status: 'delivered',         ...makePoDetails() },
  ];

  private pos$ = new BehaviorSubject<PurchaseOrder[]>(this.seed);

  getPOs() {
    return this.pos$.asObservable();
  }

  getPOsSnapshot(): PurchaseOrder[] {
    return this.pos$.value;
  }

  getPoByIndex(index: number): PurchaseOrder | undefined {
    return this.pos$.value[index];
  }

  acceptPo(po: PurchaseOrder): void {
    const list = this.pos$.value.map(p => p === po ? { ...p, status: 'processing' as PoStatus } : p);
    this.pos$.next(list);
  }

  rejectPo(po: PurchaseOrder, reason: string): void {
    const list = this.pos$.value.map(p => p === po ? { ...p, status: 'rejected' as PoStatus, rejectionReason: reason } : p);
    this.pos$.next(list);
  }

  updateTracking(po: PurchaseOrder, changes: Partial<Pick<PurchaseOrder, 'shipmentStatus' | 'confirmationCode' | 'estimatedDeliveryDate' | 'status'>>): void {
    const list = this.pos$.value.map(p => p === po ? { ...p, ...changes } : p);
    this.pos$.next(list);
  }
}
