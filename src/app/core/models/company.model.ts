export interface CompanyAddress {
  country: string;
  stateRegion: string;
  city: string;
  streetNumber: string;
  fullAddress: string;
}

export interface CompanyInfo {
  id: number;
  companyName: string;
  workEmail: string;
  phoneNumber: string;
  planType: string;
  status: string;
  dateOfSignUp: string;
  address: CompanyAddress;
}