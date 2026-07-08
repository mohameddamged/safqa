import { Routes } from "@angular/router";
import { VENDORDashboardComponent } from "./dashboard/dashboard.component";
import { RfqsComponent} from "./rfqs/rfqs.component"
import { MyOffersComponent } from "./my-offers/my-offers.component";
import { PurchaseOrdersComponent } from "./purchase-orders/purchase-orders.component";
import { SubscriptionComponent } from "./subscription/subscription.component";
import { InvoicesComponent } from "./invoices/invoices.component";
import { SetADiscountComponent } from "./set-a-discount/set-a-discount.component";
import { VendorProfileComponent } from "./vendor-profile/vendor-profile.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { RfqDetailsComponent } from "./rfq-details/rfq-details.component";
import { NegotiationChatComponent } from "./negotiation-chat/negotiation-chat.component";
import { InvoicePoDetailsComponent } from "./invoice-po-details/invoice-po-details.component";
import { PoDetailsComponent } from "./po-details/po-details.component";
import { PoTrackingComponent } from "./po-tracking/po-tracking.component";
import { PoTrackingResultComponent } from "./po-tracking-result/po-tracking-result.component";
import { DraftsComponent } from "./drafts/drafts.component";
import { ApplyOfferComponent } from "./apply-offer/apply-offer.component";
import { ProductList } from "./products/product-list/product-list";
import { ProductDetails } from "./products/product-details/product-details";
import { AddProduct } from "./products/add-product/add-product";
import { BankAccountComponent } from "./bank-account/bank-account.component";

export const VENDOR_ROUTES: Routes = [

    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: VENDORDashboardComponent },
    { path: 'products', component: ProductList},
    { path: 'products/add-product', component: AddProduct},
    { path: 'products/:id', component: ProductDetails},
    { path: 'rfqs', component: RfqsComponent },
    { path: 'rfqs/rfq-details/:id', component: RfqDetailsComponent },
    { path: 'rfqs/:id/apply-offer', component: ApplyOfferComponent },
    { path: 'NegotiationChat', component: NegotiationChatComponent },
    { path: 'my-offers', component: MyOffersComponent },
    { path: 'my-offers/NegotiationChat/:id', component: NegotiationChatComponent },
    { path: 'my-offers/drafts', component: DraftsComponent },
    { path: 'purchase-orders', component: PurchaseOrdersComponent },
    { path: 'purchase-orders/podetailsC/:id', component: PoDetailsComponent },
    { path: 'purchase-orders/po-tracking/:id/result', component: PoTrackingResultComponent },
    { path: 'purchase-orders/po-tracking/:id/:type', component: PoTrackingComponent },
    { path: 'Subscription', component: SubscriptionComponent },
    { path: 'Invoices', component: InvoicesComponent },
    { path: 'invoices/InvoicePoDetails/:id/:type', component: InvoicePoDetailsComponent },
    { path: 'set-a-discount', component: SetADiscountComponent },
    { path: 'vendor-profile', component: VendorProfileComponent },
    { path: 'bank-account', component: BankAccountComponent },
    { path: 'change-password', component: ChangePasswordComponent },
];
