import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Header } from '@/components/layout/Header';

export default function Pending() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const data = await api.getInvoices();
                // Filter invoices that have pending balance
                setInvoices(data.filter((i: Invoice) =>
                    i.type === 'invoice' &&
                    i.status !== 'paid' &&
                    (i.grandTotal - (i.advancePayment || 0)) > 0
                ));
            } catch (error) {
                console.error('Failed to fetch pending:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPending();
    }, []);

    const totalPending = invoices.reduce((sum, inv) =>
        sum + (inv.grandTotal - (inv.advancePayment || 0)), 0
    );

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
                            <Clock className="w-8 h-8 text-warning" />
                            Pending Payments
                        </h1>
                        <p className="text-muted-foreground">
                            {invoices.length} invoices with pending balance • Total: {formatCurrency(totalPending)}
                        </p>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-warning" />
                        <div>
                            <p className="font-semibold text-lg">Total Pending Amount</p>
                            <p className="text-3xl font-bold text-warning">{formatCurrency(totalPending)}</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Loading pending invoices...</div>
                ) : (
                    <div className="space-y-4">
                        {invoices.map((invoice) => {
                            const pending = invoice.grandTotal - (invoice.advancePayment || 0);
                            return (
                                <div key={invoice.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/')}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-mono text-sm text-muted-foreground">{invoice.referenceNumber}</p>
                                            <p className="font-semibold text-lg">{invoice.client?.companyName || 'N/A'}</p>
                                            <p className="text-sm text-muted-foreground">Due: {new Date(invoice.validityDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Total: {formatCurrency(invoice.grandTotal)}</p>
                                            <p className="text-sm text-success">Paid: {formatCurrency(invoice.advancePayment || 0)}</p>
                                            <p className="text-xl font-bold text-warning">Pending: {formatCurrency(pending)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" variant="outline">Send Reminder</Button>
                                        <Button size="sm" variant="default">Mark as Paid</Button>
                                    </div>
                                </div>
                            );
                        })}
                        {invoices.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground bg-card rounded-lg border border-border">
                                No pending payments! 🎉
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
