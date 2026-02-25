import { Eye, Edit, Trash2, MoreHorizontal, FileText, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Invoice } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/utils/invoiceUtils';

interface InvoiceListProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

export function InvoiceList({ invoices, onView, onEdit, onDelete }: InvoiceListProps) {
  const getStatusVariant = (status: Invoice['status']) => {
    const variants: Record<Invoice['status'], 'draft' | 'sent' | 'accepted' | 'rejected' | 'paid'> = {
      draft: 'draft',
      sent: 'sent',
      accepted: 'accepted',
      rejected: 'rejected',
      paid: 'paid',
    };
    return variants[status];
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="font-heading font-semibold text-lg text-foreground">Recent Documents</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reference</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Client</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr
                key={invoice.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {invoice.type === 'invoice' ? (
                      <FileText className="w-4 h-4 text-primary" />
                    ) : (
                      <FileCheck className="w-4 h-4 text-info" />
                    )}
                    <span className="capitalize text-sm font-medium">{invoice.type}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-mono text-sm text-foreground">{invoice.referenceNumber}</span>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {invoice.client.companyName}
                    </p>
                    <p className="text-xs text-muted-foreground">{invoice.client.attentionTo}</p>
                  </div>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">{formatDate(invoice.date)}</span>
                </td>
                <td className="p-4 text-right">
                  <span className="font-semibold text-foreground">{formatCurrency(invoice.grandTotal)}</span>
                </td>
                <td className="p-4 text-center">
                  <Badge variant={getStatusVariant(invoice.status)} className="capitalize">
                    {invoice.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(invoice)}
                      className="h-8 w-8"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(invoice)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(invoice.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {invoices.length === 0 && (
        <div className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">No documents yet</h3>
          <p className="text-muted-foreground">Create your first invoice or quotation to get started.</p>
        </div>
      )}
    </div>
  );
}
