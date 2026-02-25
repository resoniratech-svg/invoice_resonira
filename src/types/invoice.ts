export interface LineItem {
  id: string;
  description: string;
  duration: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CompanyInfo {
  name: string;
  gstin: string;
  state: string;
  stateCode: string;
  pan: string;
  salesPhone: string;
  supportPhone: string;
  email: string;
  address: string;
  logo?: string;
}

export interface ClientInfo {
  companyName: string;
  attentionTo: string;
  address: string;
  phone: string;
  email: string;
  gstNo: string;
}

export interface Invoice {
  id: string;
  type: 'quotation' | 'invoice';
  referenceNumber: string;
  date: string;
  validityDate: string;
  subject: string;
  description: string;
  preparedBy: string;
  preparedByEmail: string;
  client: ClientInfo;
  lineItems: LineItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  grandTotal: number;
  advancePayment: number;
  balanceDue: number;
  amountInWords: string;
  paymentTerms: string;
  deliveryTerms: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalInvoices: number;
  totalQuotations: number;
  pendingAmount: number;
  paidAmount: number;
  thisMonthRevenue: number;
}
