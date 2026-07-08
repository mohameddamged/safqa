import { Routes } from "@angular/router";
import { InventoryOfficerDashboard } from "./inventory-officer-dashboard/inventory-officer-dashboard";
import { InventoryProfile } from "./inventory-profile/inventory-profile";
import { UpcomingPos } from "./pos/upcoming-pos/upcoming-pos";
import { PoDetails } from "./pos/po-details/po-details";
import { PoTracking } from "./pos/po-tracking/po-tracking";
import { Complaint } from "./pos/complaint/complaint";

export const INVENTORY_OFFICER_ROUTES: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: InventoryOfficerDashboard },
    { path: 'upcoming-pos', component: UpcomingPos },
    { path: 'upcoming-pos/po-details/:id', component: PoDetails },
    { path: 'upcoming-pos/po-tracking/:id', component: PoTracking },
    { path: 'upcoming-pos/po-tracking/partial-delivery/:id', component: Complaint },
    { path: 'profile', component: InventoryProfile },

];