import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Invoice } from '@/types/invoice';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Header } from '@/components/layout/Header';

export default function Invoices() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const data = await api.getInvoices();
                setInvoices(data.filter((i: Invoice) => i.type === 'invoice'));
            } catch (error) {
                console.error('Failed to fetch invoices:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter(inv =>
        inv.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

    return (
        <div className="min-h-screen bg-background">
            <Header onCreateNew={() => navigate('/')} />

            <main className="container mx-auto px-4 lg:px-8 py-8">
                {/* Back Button & Title */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-heading font-bold text-3xl text-foreground flex items-center gap-3">
                            <FileText className="w-8 h-8 text-primary" />
                            All Invoices
                        </h1>
                        <p className="text-muted-foreground">
                            Total: {filteredInvoices.length} invoices • {formatCurrency(totalAmount)}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by client or reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>

                {/* Invoice List */}
                {isLoading ? (
                    <div className="text-center py-10">Loading invoices...</div>
                ) : (
                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="text-left p-4 font-medium">Reference</th>
                                    <th className="text-left p-4 font-medium">Client</th>
                                    <th className="text-left p-4 font-medium">Date</th>
                                    <th className="text-right p-4 font-medium">Amount</th>
                                    <th className="text-center p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate('/')}>
                                        <td className="p-4 font-mono text-sm">{invoice.referenceNumber}</td>
                                        <td className="p-4">{invoice.client?.companyName || 'N/A'}</td>
                                        <td className="p-4 text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(invoice.grandTotal)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-success/20 text-success' :
                                                    invoice.status === 'sent' ? 'bg-info/20 text-info' :
                                                        'bg-warning/20 text-warning'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredInvoices.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                No invoices found
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
