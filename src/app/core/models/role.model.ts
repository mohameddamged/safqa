export const Role = {
  SystemAdmin: 'SystemAdmin',
  CompanyAdmin: 'CompanyAdmin',
  VendorAdmin: 'VendorAdmin',          
  Manager: 'Manager',
  ProcurementOfficer: 'ProcurementOfficer', 
  FinanceManager: 'FinanceManager',
  InventoryOfficer: 'InventoryOfficer',
 
} as const;
export type RoleName = typeof Role[keyof typeof Role];

export const ROLE_HOME_ROUTE: Record<RoleName, string> = {
  [Role.SystemAdmin]:        '/system-admin',
  [Role.CompanyAdmin]:       '/company-manager',
  [Role.Manager]:            '/department-manager',
  [Role.VendorAdmin]:        '/vendor-admin',
  [Role.ProcurementOfficer]: '/procurement-officer',   
  [Role.FinanceManager]:     '/financial-manager',
  [Role.InventoryOfficer]:   '/inventory-officer',
 
};

export const CompanyRole = {
  Manager: 1,
  ProcurementOfficer: 2,
  FinanceManager: 3,
  InventoryOfficer: 4,
  DepartmentManager: 5,
} as const;

export type CompanyRoleName = keyof typeof CompanyRole;

export const COMPANY_ROLE_LABELS: Record<CompanyRoleName, string> = {
  Manager: 'Manager',
  ProcurementOfficer: 'Procurement Officer',
  FinanceManager: 'Finance Manager',
  InventoryOfficer: 'Inventory Officer',
  DepartmentManager: 'Department Manager',
};