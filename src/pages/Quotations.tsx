import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Invoice } from '@/types/invoice';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/invoiceUtils';
import { Header } from '@/components/layout/Header';

export default function Quotations() {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                const data = await api.getInvoices();
                setQuotations(data.filter((i: Invoice) => i.type === 'quotation'));
            } catch (error) {
                console.error('Failed to fetch quotations:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuotations();
    }, []);

    const filteredQuotations = quotations.filter(q =>
        q.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = filteredQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

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
                            <FileCheck className="w-8 h-8 text-info" />
                            All Quotations
                        </h1>
                        <p className="text-muted-foreground">
                            Total: {filteredQuotations.length} quotations • {formatCurrency(totalAmount)}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search quotations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Loading quotations...</div>
                ) : (
                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="text-left p-4 font-medium">Reference</th>
                                    <th className="text-left p-4 font-medium">Client</th>
                                    <th className="text-left p-4 font-medium">Valid Till</th>
                                    <th className="text-right p-4 font-medium">Amount</th>
                                    <th className="text-center p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuotations.map((quotation) => (
                                    <tr key={quotation.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate('/')}>
                                        <td className="p-4 font-mono text-sm">{quotation.referenceNumber}</td>
                                        <td className="p-4">{quotation.client?.companyName || 'N/A'}</td>
                                        <td className="p-4 text-muted-foreground">{new Date(quotation.validityDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-right font-medium">{formatCurrency(quotation.grandTotal)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${quotation.status === 'accepted' ? 'bg-success/20 text-success' :
                                                    quotation.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                                                        'bg-info/20 text-info'
                                                }`}>
                                                {quotation.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredQuotations.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                No quotations found
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
