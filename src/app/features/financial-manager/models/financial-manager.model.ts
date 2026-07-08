
// ---------------------------------------------------------------------------
// Shared paging envelope
// ---------------------------------------------------------------------------

export interface FmPagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Profile / Company Info
// ---------------------------------------------------------------------------

export interface FmCompanyInfo {
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
  country: string;
  stateRegion: string;
  city: string;
  street: string;
  fullAddress: string;
}

// ---------------------------------------------------------------------------
// Pending PRs list  (GET /api/Finance)
// Backend: PurchaseRequestResponseDto
// ---------------------------------------------------------------------------

export interface FmPrListItem {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  currency: string;
  status: string;
  requiredDeliveryDate: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// PR Details  (GET /api/Finance/{id})
// Backend: PurchaseRequestDetailsDto
// ---------------------------------------------------------------------------

export interface FmPrDetails {
  id: number;
  itemName: string;
  categoryId: number;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  currency: string;
  requiredDeliveryDate: string;
  technicalSpecifications: string | null;
  reason: string | null;
  additionalNotes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

/** Decision payload for approve / reject */
export interface FmPrDecisionRequest {
  purchaseRequestId: number;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Pending PO Invoices list  (GET /api/Finance/pending-po-invoices)
// Backend: PendingPOInvoiceListDto
// ---------------------------------------------------------------------------

export interface FmPendingPoListItem {
  id: number;
  poTitle: string;
  poDate: string;   // PODate from backend
}

// ---------------------------------------------------------------------------
// Pending PO Invoice Details  (GET /api/Finance/pending-po-invoices/{id})
// Backend: PendingPOInvoiceDetailsDto
// ---------------------------------------------------------------------------

export interface FmPendingPoDetails {
  id: number;
  rfqId: number;
  poTitle: string;
  vendorName: string;
  itemName: string;
  categoryName: string;
  quantity: number;
  unit: string;
  totalCost: number;
  currency: string;
  deliveryDeadline: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Payment Summary  (GET /api/Finance/{id}/payment-summary)
// Backend: anonymous object from FinanceController
// ---------------------------------------------------------------------------

export interface FmPaymentSummary {
  vendorName: string;
  totalCost: number;
  currency: string;
  status: string;
  isOnHold: string;
  safqaBankAccount: {
    bankName: string;
    iban: string;
    accountHolderName: string;
  };
}

/** Old alias kept for backward-compat — same shape as FmPaymentSummary */
export type FmPoPaymentDetails = FmPaymentSummary;

export interface FmPoPaymentConfirmationRequest {
  poId: string;
  receiptFile: File | null;
}

// ---------------------------------------------------------------------------
// Paid Invoices list  (GET /api/Finance/paid-invoices)
// Backend: PaidInvoiceListDto
// id is number (was incorrectly typed as string before)
// ---------------------------------------------------------------------------

export interface FmPaidInvoiceListItem {
  id: number;          // ← fixed: was string, backend returns int
  poTitle: string;
  paymentDate: string;
  status: string;      // ← added: PaidInvoiceListDto.Status
}

// ---------------------------------------------------------------------------
// Recovered Funds list  (GET /api/Finance/recovered-funds)
// Backend: CompanyRecoveredFundDto
// ---------------------------------------------------------------------------

export interface FmRecoveredFundListItem {
  purchaseOrderId: number;
  purchaseOrderTitle: string;
  paymentDate: string;
  recoveredFundDate: string | null;
  cost: number;
  currency: string;
}

// ---------------------------------------------------------------------------
// Recovered Fund Details  (GET /api/Finance/recovered-funds/{purchaseOrderId})
// Backend: CompanyRecoveredFundDetailsDto
// NOTE: This is a financial view only — complaint details (photos, damaged
//       items) are Inventory Officer data, NOT available through this endpoint.
// ---------------------------------------------------------------------------

export interface FmRecoveredFundDetails {
  purchaseOrderId: number;
  purchaseOrderTitle: string;
  receiptImageUrl: string | null;
  cost: number;
  currency: string;
  vendorName: string;
  paymentDate: string;
  recoveredFundDate: string | null;
}

// ---------------------------------------------------------------------------
// Paid Invoice Details
// Pending clarification from Ahmed on which endpoint to use.
// Temporarily reuse FmPaymentSummary shape.
// ---------------------------------------------------------------------------

export interface FmPaidInvoiceDetails extends FmPaymentSummary {
  receiptImageUrl: string | null;
}
