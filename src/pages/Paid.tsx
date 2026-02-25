import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Header } from '@/components/layout/Header';

export default function Paid() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPaid = async () => {
            try {
                const data = await api.getInvoices();
                // Filter invoices that have received payments
                setInvoices(data.filter((i: Invoice) =>
                    i.type === 'invoice' && (i.advancePayment || 0) > 0
                ));
            } catch (error) {
                console.error('Failed to fetch paid:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPaid();
    }, []);

    const totalPaid = invoices.reduce((sum, inv) => sum + (inv.advancePayment || 0), 0);

    return (
        <div className="min-h-screen bg-background">
            <Header onCreateNew={() => navigate('/')} />

            <main className="container mx-auto px-4 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="font-heading font-bold text-3xl text-foreground flex items-center gap-3">
                            <IndianRupee className="w-8 h-8 text-success" />
                            Payments Received
                        </h1>
                        <p className="text-muted-foreground">
                            {invoices.length} invoices with payments • Total: {formatCurrency(totalPaid)}
                        </p>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-success/10 border border-success/30 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-success" />
                        <div>
                            <p className="font-semibold text-lg">Total Amount Received</p>
                            <p className="text-3xl font-bold text-success">{formatCurrency(totalPaid)}</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Loading payment records...</div>
                ) : (
                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="text-left p-4 font-medium">Reference</th>
                                    <th className="text-left p-4 font-medium">Client</th>
                                    <th className="text-left p-4 font-medium">Date</th>
                                    <th className="text-right p-4 font-medium">Invoice Total</th>
                                    <th className="text-right p-4 font-medium">Amount Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate('/')}>
                                        <td className="p-4 font-mono text-sm">{invoice.referenceNumber}</td>
                                        <td className="p-4">{invoice.client?.companyName || 'N/A'}</td>
                                        <td className="p-4 text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">{formatCurrency(invoice.grandTotal)}</td>
                                        <td className="p-4 text-right font-bold text-success">{formatCurrency(invoice.advancePayment || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {invoices.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                No payments received yet
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
