import { useState } from 'react';
import { X, Printer, Download, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Invoice } from '@/types/invoice';
import { defaultCompanyInfo } from '@/data/mockData';
import { formatNumber, formatDate } from '@/utils/invoiceUtils';
import { toast } from 'sonner';

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(invoice.client?.email || '');
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE}/invoices/send-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice, download: true }),
      });

      if (!response.ok) {
        // Fallback: use browser print
        toast.info('PDF download via backend unavailable. Using print instead.');
        window.print();
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.type === 'quotation' ? 'Quotation' : 'Invoice'}_${invoice.referenceNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.info('Using browser print for PDF');
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE}/invoices/send-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice, recipientEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast.success(`Invoice sent successfully to ${recipientEmail}`);
      setEmailDialogOpen(false);
    } catch (error: any) {
      console.error('Send error:', error);
      toast.error(error.message || 'Failed to send email. Make sure backend is running.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-auto py-8 px-4">
      <div className="bg-card w-full max-w-4xl rounded-xl shadow-2xl animate-scale-in">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border no-print">
          <h2 className="font-heading font-semibold text-lg">
            {invoice.type === 'quotation' ? 'Quotation' : 'Invoice'} Preview
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PDF
            </Button>
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Invoice via Email</DialogTitle>
                  <DialogDescription>
                    Enter the recipient's email address to send this {invoice.type} with PDF attachment.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="recipient-email">Recipient Email</Label>
                  <Input
                    id="recipient-email"
                    type="email"
                    placeholder="client@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="invoice"
                    onClick={handleSendEmail}
                    disabled={isSending || !recipientEmail}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 bg-white relative" id="invoice-content">
          {/* Watermark Pattern - 3 Times */}
          {defaultCompanyInfo.logo && (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col justify-around items-center py-20 opacity-[0.05]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-2/3 h-1/4 flex items-center justify-center">
                  <img
                    src={defaultCompanyInfo.logo}
                    alt=""
                    className="h-full object-contain"
                    style={{ transform: 'rotate(-25deg)' }}
                  />
                </div>
              ))}
            </div>
          )}
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              {defaultCompanyInfo.logo ? (
                <img
                  src={defaultCompanyInfo.logo}
                  alt={defaultCompanyInfo.name}
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-xl">
                  {defaultCompanyInfo.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {defaultCompanyInfo.gstin && (
                <p>GSTIN/UIN: <span className="font-medium text-foreground">{defaultCompanyInfo.gstin}</span></p>
              )}
              {defaultCompanyInfo.state && (
                <p>STATE: <span className="font-medium text-foreground">{defaultCompanyInfo.state}</span></p>
              )}
              {defaultCompanyInfo.stateCode && (
                <p>STATE CODE: <span className="font-medium text-foreground">{defaultCompanyInfo.stateCode}</span></p>
              )}
              {defaultCompanyInfo.pan && (
                <p>PAN: <span className="font-medium text-foreground">{defaultCompanyInfo.pan}</span></p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-2xl text-primary uppercase tracking-wide">
              Tax {invoice.type === 'quotation' ? 'Proposal' : 'Invoice'}
            </h2>
          </div>

          {/* Client & Quote Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">{invoice.type === 'quotation' ? 'Quotation For:' : 'Invoice For:'}</span>{' '}
                <span className="font-semibold text-foreground">{invoice.client.companyName}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Name/Attn.:</span>{' '}
                <span className="text-foreground">{invoice.client.attentionTo}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Address:</span>{' '}
                <span className="text-foreground">{invoice.client.address}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Tel:</span>{' '}
                <span className="text-foreground">{invoice.client.phone}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Email:</span>{' '}
                <span className="text-foreground">{invoice.client.email}</span>
              </p>
              {invoice.client.gstNo && (
                <p className="text-sm">
                  <span className="text-muted-foreground">GST No:</span>{' '}
                  <span className="text-foreground">{invoice.client.gstNo}</span>
                </p>
              )}
            </div>
            <div className="text-right space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Date:</span>{' '}
                <span className="font-semibold text-foreground">{formatDate(invoice.date)}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">{invoice.type === 'quotation' ? 'Quotation Ref.:' : 'Invoice No:'}</span>{' '}
                <span className="font-mono font-semibold text-foreground">{invoice.referenceNumber}</span>
              </p>
              {invoice.preparedBy && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Prepared By:</span>{' '}
                  <span className="text-foreground">{invoice.preparedBy}</span>
                </p>
              )}
              {invoice.preparedByEmail && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <span className="text-foreground">{invoice.preparedByEmail}</span>
                </p>
              )}
            </div>
          </div>

          {/* Subject - only show if exists */}
          {invoice.subject && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Subject</p>
              <p className="font-medium text-foreground">{invoice.subject}</p>
            </div>
          )}

          {/* Description - only show if exists */}
          {invoice.description && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-foreground">{invoice.description}</p>
            </div>
          )}

          {/* Scope of Work Table */}
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-lg text-primary mb-4 uppercase tracking-wide">
              Scope of Work
            </h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-3 text-left text-sm font-semibold">Sl.</th>
                    <th className="p-3 text-left text-sm font-semibold">Description</th>
                    <th className="p-3 text-center text-sm font-semibold">Duration</th>
                    <th className="p-3 text-center text-sm font-semibold">Qty</th>
                    <th className="p-3 text-right text-sm font-semibold">Unit Price (INR)</th>
                    <th className="p-3 text-right text-sm font-semibold">Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 1 ? 'bg-muted/30' : ''}>
                      <td className="p-3 text-sm text-foreground">{index + 1}</td>
                      <td className="p-3 text-sm text-foreground whitespace-pre-line">{item.description}</td>
                      <td className="p-3 text-sm text-center text-foreground">{item.duration}</td>
                      <td className="p-3 text-sm text-center text-foreground">{item.quantity}</td>
                      <td className="p-3 text-sm text-right text-foreground">{formatNumber(item.unitPrice)}</td>
                      <td className="p-3 text-sm text-right font-medium text-foreground">{formatNumber(item.total)}</td>
                    </tr>
                  ))}
                  {/* GST Row */}
                  <tr className="border-t border-border">
                    <td colSpan={5} className="p-3 text-sm text-right font-medium text-foreground">
                      GST ({invoice.gstRate}%)
                    </td>
                    <td className="p-3 text-sm text-right font-medium text-foreground">
                      {formatNumber(invoice.gstAmount)}
                    </td>
                  </tr>
                  {/* Grand Total Row */}
                  <tr className="bg-primary text-primary-foreground">
                    <td colSpan={5} className="p-3 text-right font-bold uppercase">Grand Total</td>
                    <td className="p-3 text-right font-bold">{formatNumber(invoice.grandTotal)}</td>
                  </tr>
                  {/* Advance Payment Row - only show if there's an advance */}
                  {invoice.advancePayment > 0 && (
                    <>
                      <tr className="border-t border-border bg-green-50">
                        <td colSpan={5} className="p-3 text-sm text-right font-medium text-green-700">
                          Advance Paid
                        </td>
                        <td className="p-3 text-sm text-right font-medium text-green-700">
                          - {formatNumber(invoice.advancePayment)}
                        </td>
                      </tr>
                      <tr className="bg-red-50">
                        <td colSpan={5} className="p-3 text-right font-bold text-red-600 uppercase">Balance Due</td>
                        <td className="p-3 text-right font-bold text-red-600">{formatNumber(invoice.balanceDue)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mb-8 p-4 bg-accent/20 rounded-lg border border-accent/30">
            <p className="text-sm font-medium text-foreground italic">{invoice.amountInWords}</p>
          </div>

          {/* Terms */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-heading font-semibold text-sm text-primary uppercase mb-2">Payment Terms</h4>
              <p className="text-sm text-foreground">{invoice.paymentTerms}</p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-primary uppercase mb-2">Delivery Terms</h4>
              <p className="text-sm text-foreground">{invoice.deliveryTerms}</p>
            </div>
          </div>

          {/* Validity */}
          <div className="mb-8">
            <h4 className="font-heading font-semibold text-sm text-primary uppercase mb-2">Validity</h4>
            <p className="text-sm text-foreground">
              The above offer is valid till {formatDate(invoice.validityDate)}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              This is a computer generated {invoice.type} and no signature is required.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Date: {formatDate(invoice.date)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
