import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { VerificationListComponent } from './verifications/verification-list/verification-list/verification-list';
import { VerificationDetails } from './verifications/verification-details/verification-details/verification-details';
import { CompaniesDetails } from './Companies/Companies-details/companies-details/companies-details';
import { VendorList } from './Vendorsc/Vendor-list/vendor-list/vendor-list';
import { VendorDetails } from './Vendorsc/Vendors-details/vendor-details/vendor-details';
import { Subscriptions } from './Subscriptions/subscriptions/subscriptions';
import { Rfq } from './Rfq/rfq/rfq';
import { Categories } from './Categories/categories/categories';
import { EscrowCompanies } from './EscrowPayments/companies/escrow-companies';
import { EscrowPaymentDetails } from './EscrowPayments/payment-details/escrow-payment-details';
import { SafqaPayments } from './EscrowPayments/safqa-payments/safqa-payments';
import { VendorTransactionDetails } from './EscrowPayments/vendor-transaction-details/vendor-transaction-details';
import { ReturnedFunds } from './EscrowPayments/returned-funds/returned-funds';
import { ReturnedFundDetails } from './EscrowPayments/returned-fund-details/returned-fund-details';
import { CompaniesList } from './Companies/Companies-list/Companies-list/companies-list';


export const SYSTEM_ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'verifications/:type', component: VerificationListComponent },
  { path: 'verifications/:type/:id', component: VerificationDetails },
  { path: 'companies', component: CompaniesList },
  { path: 'companies/:id', component: CompaniesDetails },
  { path: 'vendors', component: VendorList },
  { path: 'vendors/:id', component: VendorDetails },
  { path: 'subscriptions', component: Subscriptions },
  { path: 'rfqs', component: Rfq },
  { path: 'categories', component: Categories },
  { path: 'escrow-payments/companies', component: EscrowCompanies },
  { path: 'escrow-payments/companies/:id', component: EscrowPaymentDetails },
  { path: 'escrow-payments/safqa', component: SafqaPayments },
  { path: 'escrow-payments/safqa/:id', component: VendorTransactionDetails },
  { path: 'escrow-payments/returned-funds',     component: ReturnedFunds },
{ path: 'escrow-payments/returned-funds/:id', component: ReturnedFundDetails },
];