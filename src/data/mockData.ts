import { Invoice, CompanyInfo, DashboardStats } from '@/types/invoice';

export const defaultCompanyInfo: CompanyInfo = {
  name: 'RESONIRA TECHNOLOGIES',
  gstin: '36ABMFR2520B1ZJ',
  state: 'Telangana',
  stateCode: '36',
  pan: 'ABMFR2520B',
  salesPhone: '+919154289324',
  supportPhone: '',
  email: 'info@resonira.com',
  address: 'Telangana, India',
  logo: '/logo.png',
};

// Start with empty invoice list - create new invoices via the UI
export const mockInvoices: Invoice[] = [];

export const mockDashboardStats: DashboardStats = {
  totalInvoices: 0,
  totalQuotations: 0,
  pendingAmount: 0,
  paidAmount: 0,
  thisMonthRevenue: 0,
};

