import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Header } from '@/components/layout/Header';

export default function Reports() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await api.getInvoices();
                // Filter this month's invoices
                const now = new Date();
                setInvoices(data.filter((i: Invoice) => {
                    if (i.type !== 'invoice') return false;
                    const date = new Date(i.date);
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }));
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, []);

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + (inv.advancePayment || 0), 0);
    const totalPending = totalRevenue - totalPaid;

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
                            <TrendingUp className="w-8 h-8 text-accent-foreground" />
                            Monthly Report
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {currentMonth}
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-card rounded-lg border border-border p-6">
                        <p className="text-muted-foreground text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                        <p className="text-sm text-muted-foreground mt-1">{invoices.length} invoices</p>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                        <p className="text-muted-foreground text-sm">Amount Collected</p>
                        <p className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</p>
                        <p className="text-sm text-muted-foreground mt-1">{((totalPaid / totalRevenue) * 100 || 0).toFixed(1)}% collected</p>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                        <p className="text-muted-foreground text-sm">Amount Pending</p>
                        <p className="text-2xl font-bold text-warning">{formatCurrency(totalPending)}</p>
                        <p className="text-sm text-muted-foreground mt-1">{((totalPending / totalRevenue) * 100 || 0).toFixed(1)}% pending</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Loading report...</div>
                ) : (
                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <div className="p-4 border-b border-border">
                            <h2 className="font-semibold">Invoices This Month</h2>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="text-left p-4 font-medium">Reference</th>
                                    <th className="text-left p-4 font-medium">Client</th>
                                    <th className="text-left p-4 font-medium">Date</th>
                                    <th className="text-right p-4 font-medium">Amount</th>
                                    <th className="text-right p-4 font-medium">Paid</th>
                                    <th className="text-center p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate('/')}>
                                        <td className="p-4 font-mono text-sm">{invoice.referenceNumber}</td>
                                        <td className="p-4">{invoice.client?.companyName || 'N/A'}</td>
                                        <td className="p-4 text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">{formatCurrency(invoice.grandTotal)}</td>
                                        <td className="p-4 text-right text-success">{formatCurrency(invoice.advancePayment || 0)}</td>
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
                        {invoices.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                No invoices this month
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
