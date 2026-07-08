import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models';
 import { AdminLayout } from './Layouts/system-admin-layout/admin-layout/admin-layout';
 import { CompanyLayout } from './Layouts/company-manager-layout/company-layout/company-layout';
 import { InventoryLayout } from './Layouts/inventory-officer-layout/inventory-layout/inventory-layout';
import { ProcurementOfficerLayout } from './features/procurement-officer/layout/procurement-officer-layout';
import { VendorLayout } from './Layouts/vendor-admin-layout/vendor-layout/vendor-layout';
import { DepartmentManagerLayout } from './Layouts/Department-manager/department-manager-layout';




export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: 'invite-register',
    loadChildren: () =>
      import('./features/invitations/invitations.routes').then((m) => m.INVITE_REGISTER_ROUTES),
  },
 
  {
    path: 'financial-manager',
    canActivate: [authGuard, roleGuard([Role.FinanceManager])],
    loadChildren: () =>
      import('./features/financial-manager/financial-manager.routes').then(
        (m) => m.FINANCIAL_MANAGER_ROUTES,
      ),
  },


{
  path: 'system-admin',  
  component: AdminLayout,
  canActivate: [authGuard, roleGuard([Role.SystemAdmin])],
  loadChildren: () =>
    import('./features/System-Admin/system-admin.routes').then((m) => m.SYSTEM_ADMIN_ROUTES),
},
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard | Safqa',
  },
{
  path: 'company-manager',
  component: CompanyLayout,
  canActivate: [authGuard, roleGuard([Role.CompanyAdmin])],  
  loadChildren: () =>
    import('./features/Company-Manager/company-manager.routes').then((m) => m.COMPANY_ROUTES),
},

{
  path: 'department-manager',
  component: DepartmentManagerLayout,
  canActivate: [authGuard, roleGuard([Role.Manager])],
  loadChildren: () =>
    import('./features/department-manager/department-manager.routes')
      .then((m) => m.routes),
},
{
  path: 'procurement-officer',  
  component: ProcurementOfficerLayout,
  canActivate: [authGuard, roleGuard([Role.ProcurementOfficer])],
  loadChildren: () =>
    import('./features/procurement-officer/Procurement-officer.routes')
      .then((m) => m.PROCUREMENT_OFFICER_ROUTES),
},
 {
  path: 'vendor-admin',
  component: VendorLayout,
  canActivate: [authGuard, roleGuard([Role.VendorAdmin])],
  loadChildren: () =>
    import('./features/Vendor-Admin/vendor.routes').then((m) => m.VENDOR_ROUTES),
},
  {
  path: 'inventory-officer',
  component: InventoryLayout,
  canActivate: [authGuard, roleGuard([Role.InventoryOfficer])],
  loadChildren: () =>
    import('./features/Inventory-Officer/inventory-officer.routes')
      .then((m) => m.INVENTORY_OFFICER_ROUTES),
},
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized').then((m) => m.Unauthorized),
    title: 'Unauthorized | Safqa',
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/Landing/Pages/LandingPage/landing-page').then((m) => m.LandingPageComponent),
    title: 'Safqa',
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./features/Landing/Pages/Pricing/components/pricing/pricing').then((m) => m.Pricing),
    title: 'Pricing | Safqa',
  },
  { path: '**', redirectTo: '' },
];