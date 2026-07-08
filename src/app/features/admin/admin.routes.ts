import { Routes } from '@angular/router';
import { App as AdminApp } from './app';
import { AdminDashboard } from './features/dashboard/dashboard';
import { VerificationListComponent } from './features/verifications/verification-list/verification-list/verification-list';
import { VerificationDetails } from './features/verifications/verification-details/verification-details/verification-details';
import { CompaniesDetails } from './features/Companies/Companies-details/companies-details/companies-details';
import { VendorList } from './features/Vendorsc/Vendor-list/vendor-list/vendor-list';
import { VendorDetails } from './features/Vendorsc/Vendors-details/vendor-details/vendor-details';
import { Subscriptions } from './features/Subscriptions/subscriptions/subscriptions';
import { Rfq } from './features/Rfq/rfq/rfq';
import { Categories } from './features/Categories/categories/categories';
import { CompaniesList } from './features/Companies/Companies-list/Companies-list/Companies-list';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminApp,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'verifications/:type', component: VerificationListComponent },
      { path: 'verifications/:type/:id', component: VerificationDetails },
      { path: 'companies', component: CompaniesList },
      { path: 'companies/:id', component: CompaniesDetails },
      { path: 'vendors', component: VendorList },
      { path: 'vendors/:id', component: VendorDetails },
      { path: 'subscriptions', component: Subscriptions },
      { path: 'rfqs', component: Rfq },
      { path: 'categories', component: Categories },
    ],
  },
];