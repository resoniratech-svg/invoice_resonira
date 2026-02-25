import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Invoice, LineItem, ClientInfo } from '@/types/invoice';
import {
  generateReferenceNumber,
  calculateLineItemTotal,
  calculateSubtotal,
  calculateGST,
  calculateGrandTotal,
  amountToWords,
  addDays,
} from '@/utils/invoiceUtils';
import { api } from '@/services/api';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSave: (invoice: Invoice) => void;
  onClose: () => void;
}

export function InvoiceForm({ invoice, onSave, onClose }: InvoiceFormProps) {
  const isEditing = !!invoice;

  useEffect(() => {
    if (!isEditing) {
      const fetchNextNumber = async () => {
        try {
          const invoices = await api.getInvoices();
          const numbers = invoices
            .map((inv) => parseInt(inv.referenceNumber))
            .filter((n) => !isNaN(n));

          const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
          setFormData(prev => ({ ...prev, referenceNumber: nextNum.toString() }));
        } catch (error) {
          console.error('Failed to generate sequence number:', error);
          // Fallback to 1 if fetch fails
          setFormData(prev => ({ ...prev, referenceNumber: "1" }));
        }
      };
      fetchNextNumber();
    }
  }, []);

  const [formData, setFormData] = useState({
    type: invoice?.type || 'quotation' as 'quotation' | 'invoice',
    referenceNumber: invoice?.referenceNumber || generateReferenceNumber(),
    date: invoice?.date || new Date().toISOString().split('T')[0],
    validityDate: invoice?.validityDate || addDays(new Date(), 30).toISOString().split('T')[0],
    subject: invoice?.subject || '',
    description: invoice?.description || '',
    preparedBy: invoice?.preparedBy || '',
    preparedByEmail: invoice?.preparedByEmail || '',
    paymentTerms: invoice?.paymentTerms || '100% advance payment with a firm Purchase Order',
    deliveryTerms: invoice?.deliveryTerms || 'As mutually agreed',
    status: invoice?.status || 'draft' as Invoice['status'],
  });

  const [client, setClient] = useState<ClientInfo>(
    invoice?.client || {
      companyName: '',
      attentionTo: '',
      address: '',
      phone: '',
      email: '',
      gstNo: '',
    }
  );

  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoice?.lineItems || [
      {
        id: '1',
        description: '',
        duration: '1 Year',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]
  );

  const [gstRate, setGstRate] = useState(invoice?.gstRate || 18);
  const [advancePayment, setAdvancePayment] = useState(invoice?.advancePayment || 0);

  const subtotal = calculateSubtotal(lineItems);
  const gstAmount = calculateGST(subtotal, gstRate);
  const grandTotal = calculateGrandTotal(subtotal, gstAmount);
  const balanceDue = Math.max(0, grandTotal - advancePayment);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      duration: '1 Year',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = calculateLineItemTotal(
              field === 'quantity' ? Number(value) : item.quantity,
              field === 'unitPrice' ? Number(value) : item.unitPrice
            );
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newInvoice: Invoice = {
      id: invoice?.id || Date.now().toString(),
      ...formData,
      client,
      lineItems,
      subtotal,
      gstRate,
      gstAmount,
      grandTotal,
      advancePayment,
      balanceDue,
      amountInWords: amountToWords(balanceDue > 0 ? balanceDue : grandTotal),
      createdAt: invoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newInvoice);
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-auto py-8 px-4">
      <div className="bg-card w-full max-w-4xl rounded-xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading font-semibold text-xl">
            {isEditing ? 'Edit' : 'Create'} {formData.type === 'quotation' ? 'Quotation' : 'Invoice'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Document Type & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="type">Document Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'quotation' | 'invoice') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="input-invoice">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quotation">Quotation</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="input-invoice font-mono"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-invoice"
              />
            </div>
            <div>
              <Label htmlFor="validityDate">Valid Till</Label>
              <Input
                id="validityDate"
                type="date"
                value={formData.validityDate}
                onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                className="input-invoice"
              />
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg text-primary">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={client.companyName}
                  onChange={(e) => setClient({ ...client, companyName: e.target.value })}
                  className="input-invoice"
                  required
                />
              </div>
              <div>
                <Label htmlFor="attentionTo">Attention To *</Label>
                <Input
                  id="attentionTo"
                  value={client.attentionTo}
                  onChange={(e) => setClient({ ...client, attentionTo: e.target.value })}
                  className="input-invoice"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={client.address}
                  onChange={(e) => setClient({ ...client, address: e.target.value })}
                  className="input-invoice"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  className="input-invoice"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  className="input-invoice"
                />
              </div>
              <div>
                <Label htmlFor="gstNo">GST Number</Label>
                <Input
                  id="gstNo"
                  value={client.gstNo}
                  onChange={(e) => setClient({ ...client, gstNo: e.target.value })}
                  className="input-invoice"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-lg text-primary">Scope of Work</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-primary-foreground text-sm">
                    <th className="p-3 text-left w-1/3">Description</th>
                    <th className="p-3 text-center w-24">Duration</th>
                    <th className="p-3 text-center w-20">Qty</th>
                    <th className="p-3 text-right w-28">Unit Price</th>
                    <th className="p-3 text-right w-28">Total</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 1 ? 'bg-muted/30' : ''}>
                      <td className="p-2">
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="input-invoice text-sm min-h-[60px]"
                          placeholder="Item description..."
                        />
                      </td>
                      <td className="p-2">
                        <Select
                          value={item.duration}
                          onValueChange={(value) => updateLineItem(item.id, 'duration', value)}
                        >
                          <SelectTrigger className="input-invoice text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1 Month">1 Month</SelectItem>
                            <SelectItem value="3 Months">3 Months</SelectItem>
                            <SelectItem value="6 Months">6 Months</SelectItem>
                            <SelectItem value="1 Year">1 Year</SelectItem>
                            <SelectItem value="2 Years">2 Years</SelectItem>
                            <SelectItem value="One-time">One-time</SelectItem>
                            <SelectItem value="30 Days">30 Days</SelectItem>
                            <SelectItem value="60 Days">60 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="input-invoice text-sm text-center"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="input-invoice text-sm text-right"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="text"
                          value={item.total.toFixed(2)}
                          className="input-invoice text-sm text-right bg-muted/50"
                          readOnly
                        />
                      </td>
                      <td className="p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">GST Rate:</span>
                    <Select
                      value={gstRate.toString()}
                      onValueChange={(value) => setGstRate(parseInt(value))}
                    >
                      <SelectTrigger className="w-20 h-8 input-invoice">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span>Grand Total:</span>
                  <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>

                {/* Advance Payment */}
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-muted-foreground">Advance Paid:</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                    className="w-28 h-8 input-invoice text-right"
                    placeholder="0.00"
                  />
                </div>

                {/* Balance Due */}
                <div className="flex justify-between text-lg font-bold text-destructive">
                  <span>Balance Due:</span>
                  <span>₹{balanceDue.toFixed(2)}</span>
                </div>

                <p className="text-xs text-muted-foreground italic">
                  {amountToWords(balanceDue > 0 ? balanceDue : grandTotal)}
                </p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Textarea
                id="paymentTerms"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="input-invoice"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="deliveryTerms">Delivery Terms</Label>
              <Textarea
                id="deliveryTerms"
                value={formData.deliveryTerms}
                onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
                className="input-invoice"
                rows={2}
              />
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <Label>Status:</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Invoice['status']) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="w-32 input-invoice">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="invoice">
                {isEditing ? 'Update' : 'Create'} {formData.type === 'quotation' ? 'Quotation' : 'Invoice'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
