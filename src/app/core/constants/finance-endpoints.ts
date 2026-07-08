export const FINANCE_ENDPOINTS = {
  // ── Pending PRs ──────────────────────────────────────────────────────────
  list:    'Finance',
  byId:    (id: number) => `Finance/${id}`,
  approve: (id: number) => `Finance/${id}/approve`,
  reject:  (id: number) => `Finance/${id}/reject`,

  // ── Pending PO Invoices ───────────────────────────────────────────────────
  pendingPoInvoices:    'Finance/pending-po-invoices',
  pendingPoInvoiceById: (id: number) => `Finance/pending-po-invoices/${id}`,

  // ── Payment ───────────────────────────────────────────────────────────────
  paymentSummary:  (id: number) => `Finance/${id}/payment-summary`,
  processPayment:  (id: number) => `Finance/${id}/process-payment`,
  paymentInfo:     (id: number) => `Finance/purchase-orders/${id}/payment-info`,
  initiatePayment: (id: number) => `Finance/purchase-orders/${id}/pay`,

  // ── Paid Invoices ─────────────────────────────────────────────────────────
  paidInvoices: 'Finance/paid-invoices',

  // ── Recovered Funds ───────────────────────────────────────────────────────
  recoveredFunds:    'Finance/recovered-funds',
  recoveredFundById: (id: number) => `Finance/recovered-funds/${id}`,
} as const;
