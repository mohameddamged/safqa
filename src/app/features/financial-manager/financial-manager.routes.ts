import { Routes } from '@angular/router';

export const FINANCIAL_MANAGER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/fm-dashboard/fm-dashboard').then((m) => m.FmDashboard),
    title: 'Dashboard | Safqa',
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    title: 'Profile | Safqa',
  },
  {
    path: 'pending-prs',
    loadComponent: () => import('./pages/pending-pr/pending-pr').then((m) => m.PendingPrs),
    title: 'Pending PRs | Safqa',
  },
  {
    path: 'pending-prs/:id',
    loadComponent: () => import('./pages/pr-details/pr-details').then((m) => m.PrDetails),
    title: 'PR Details | Safqa',
  },
  {
    path: 'pending-po-invoices',
    loadComponent: () =>
      import('./pages/pending-po-invoices/pending-po-invoices').then((m) => m.PendingPoInvoices),
    title: 'Pending PO Invoices | Safqa',
  },
  {
    path: 'pending-po-invoices/:id',
    loadComponent: () =>
      import('./pages/pending-po-details/pending-po-details').then((m) => m.PendingPoDetails),
    title: 'Invoice Details | Safqa',
  },
  {
    path: 'paid-invoices',
    loadComponent: () => import('./pages/paid-invoices/paid-invoices').then((m) => m.PaidInvoices),
    title: 'Paid Invoices | Safqa',
  },
  {
    path: 'paid-invoices/:id',
    loadComponent: () =>
      import('./pages/paid-invoice-details/paid-invoice-details').then((m) => m.PaidInvoiceDetails),
    title: 'Invoice Details | Safqa',
  },
  // ── Recovered Funds ──────────────────────────────────────────────────────
  {
    path: 'recovered-funds',
    loadComponent: () =>
      import('./pages/recovered-funds/recovered-funds').then((m) => m.RecoveredFunds),
    title: 'Recovered Funds | Safqa',
  },
  {
    path: 'recovered-funds/:id',
    loadComponent: () =>
      import('./pages/recovered-fund-details/recovered-fund-details').then(
        (m) => m.RecoveredFundDetails,
      ),
    title: 'Recovered Fund Details | Safqa',
  },
];