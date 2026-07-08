import { Routes } from "@angular/router";
import { Profile } from "./profile/profile";
import { ProcurementOfficerDashboard } from "./procurement-officer-dashboard/procurement-officer-dashboard";
import { PendingRFQs } from "./pending-rfqs/pending-rfqs";
import { RFQDetails } from './rfq-details/rfq-details';
import { RfqUpdate } from "./rfq-update/rfq-update";
import { SelectVendors } from "./select-vendors/select-vendors";
import { AllRFQs } from "./all-rfqs/all-rfqs";
import { AdditionalDetails } from "./additional-details/additional-details";
import { VendorOffers } from "./vendor-offers/vendor-offers";
import { OfferList } from "./offer-list/offer-list";
import { OfferDetails } from "./offer-details/offer-details";
import { PoList } from "./po-list/po-list";
import { Negotiation } from "./negotiation/negotiation";
import { PoDetails } from "./po-details/po-details";

export const PROCUREMENT_OFFICER_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ProcurementOfficerDashboard },

  { path: 'pendingprs',                component: PendingRFQs },
  { path: 'pr-list',                   component: PendingRFQs },
  { path: 'pr/:id/details',            component: RFQDetails },
  { path: 'pr/:id/additional-details', component: AdditionalDetails },

  { path: 'all-rfqs',               component: AllRFQs },
  { path: 'rfq/:id/update',         component: RfqUpdate },
  { path: 'rfq/:id/select-vendors', component: SelectVendors },

  { path: 'vendor-offers',                                  component: VendorOffers },
  { path: 'vendor-offers/offer/:offerId',                   component: OfferDetails },
  { path: 'vendor-offers/offer/:offerId/negotiate',         component: Negotiation },
  { path: 'vendor-offers/:rfqId/offers',                    component: OfferList },
  { path: 'vendor-offers/:rfqId/offers/:offerId',           component: OfferDetails },
  { path: 'vendor-offers/:rfqId/offers/:offerId/negotiate', component: Negotiation },

  { path: 'po-list',     component: PoList },
  { path: 'po-list/:id', component: PoDetails },

  { path: 'profile', component: Profile },

  { path: 'Subscription', redirectTo: 'vendor-offers' },
  { path: 'allpos',        redirectTo: 'po-list' },
  { path: 'setting',       redirectTo: 'profile' },
];

