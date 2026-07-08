import { Routes } from '@angular/router';
import { PrList } from './pr-list/pr-list';
import { PrDetails } from './pr-details/pr-details';
import { CompanyDashboardComponent } from './dashboard/dashboard.component';
import { VendorOffersComponent } from './vendor-offers/vendor-offers.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { ProfileComponent } from './profile/profile.component';
import { GeneralInfoComponent } from './general-info/general-info.component';
import { PoList } from './po-list/po-list';
import { PoDetails } from './po-details/po-details';
import { MembersComponent } from './members/members.component';
import { PoTracking } from './po-tracking/po-tracking';
import { CompanyInfo } from './company-info/company-info';
import { Dashboard } from './dashboard/dashboard';



export const COMPANY_ROUTES: Routes = [
  { path: '', redirectTo: 'pr-list', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: Dashboard
  },
   {
    path: 'members',
    component: MembersComponent
  },


  {
    path: 'pr-list',
    component: PrList
  },

  {
    path: 'pr-list/pr-details/:id',
    component: PrDetails
  },

  {
    path: 'vendor-offers',
    component: VendorOffersComponent
  },
  {
    path: 'allpos',
    component: PoList
  },
   {
    path: 'allpos/po-details/:id',
    component: PoDetails
  },
   {
    path: 'allpos/po-tracking/:id',
    component: PoTracking
  },
  {
    path: 'Subscription',
    component: SubscriptionComponent
  },
  {
    path: 'company-info',
    component: CompanyInfo
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'setting',
    component: GeneralInfoComponent
  },


];