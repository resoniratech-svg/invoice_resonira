import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { InvoiceList } from '@/components/dashboard/InvoiceList';
import { InvoicePreview } from '@/components/invoice/InvoicePreview';
import { InvoiceForm } from '@/components/invoice/InvoiceForm';
import { Invoice, DashboardStats } from '@/types/invoice';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/invoiceUtils';

const Index = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalQuotations: 0,
    pendingAmount: 0,
    paidAmount: 0,
    thisMonthRevenue: 0,
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getInvoices();
      setInvoices(data);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateStats = (data: Invoice[]) => {
    const newStats: DashboardStats = {
      totalInvoices: data.filter(i => i.type === 'invoice').length,
      totalQuotations: data.filter(i => i.type === 'quotation').length,
      pendingAmount: data
        .filter(i => i.type === 'invoice' && i.status !== 'paid')
        .reduce((sum, inv) => sum + (inv.grandTotal - (inv.advancePayment || 0)), 0),
      paidAmount: data
        .filter(i => i.type === 'invoice')
        .reduce((sum, inv) => sum + (inv.advancePayment || 0), 0),
      thisMonthRevenue: data
        .filter(i => {
          if (i.type !== 'invoice') return false;
          const date = new Date(i.date);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        })
        .reduce((sum, inv) => sum + inv.grandTotal, 0),
    };
    setStats(newStats);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInvoice(id);
      const updatedInvoices = invoices.filter((inv) => inv.id !== id);
      setInvoices(updatedInvoices);
      calculateStats(updatedInvoices);
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleSave = async (invoice: Invoice) => {
    try {
      if (editingInvoice) {
        await api.updateInvoice(invoice.id, invoice);
        const updatedInvoices = invoices.map((inv) => (inv.id === invoice.id ? invoice : inv));
        setInvoices(updatedInvoices);
        calculateStats(updatedInvoices);
        toast.success('Document updated successfully');
      } else {
        await api.createInvoice(invoice);
        const updatedInvoices = [invoice, ...invoices];
        setInvoices(updatedInvoices);
        calculateStats(updatedInvoices);
        toast.success('Document created successfully');
      }
      setIsFormOpen(false);
      setEditingInvoice(undefined);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save document');
    }
  };

  const handleCreateNew = () => {
    setEditingInvoice(undefined);
    setIsFormOpen(true);
  };

  const handleCardClick = (cardType: string) => {
    // Navigate to the corresponding detail page
    switch (cardType) {
      case 'invoices':
        window.location.href = '/invoices';
        break;
      case 'quotations':
        window.location.href = '/quotations';
        break;
      case 'pending':
        window.location.href = '/pending';
        break;
      case 'paid':
        window.location.href = '/paid';
        break;
      case 'thisMonth':
        window.location.href = '/reports';
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateNew={handleCreateNew} />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your invoices and quotations with GST compliance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} onCardClick={handleCardClick} />
        </div>

        {/* Invoice List */}
        {isLoading ? (
          <div className="text-center py-10">Loading invoices...</div>
        ) : (
          <InvoiceList
            invoices={invoices}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Invoice Form Modal */}
      {isFormOpen && (
        <InvoiceForm
          invoice={editingInvoice}
          onSave={handleSave}
          onClose={() => {
            setIsFormOpen(false);
            setEditingInvoice(undefined);
          }}
        />
      )}

      <Toaster position="bottom-right" />
    </div>
  );
};

export default Index;

