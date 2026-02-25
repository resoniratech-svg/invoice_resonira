import { FileText, FileCheck, Clock, IndianRupee, TrendingUp, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/invoiceUtils';
import { DashboardStats } from '@/types/invoice';
import { Button } from '@/components/ui/button';

interface StatsCardsProps {
  stats: DashboardStats;
  onCardClick?: (cardType: string) => void;
}

export function StatsCards({ stats, onCardClick }: StatsCardsProps) {
  const cards = [
    {
      id: 'invoices',
      title: 'Total Invoices',
      value: stats.totalInvoices.toString(),
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      buttonText: 'View All',
    },
    {
      id: 'quotations',
      title: 'Quotations',
      value: stats.totalQuotations.toString(),
      icon: FileCheck,
      color: 'text-info',
      bgColor: 'bg-info/10',
      buttonText: 'View All',
    },
    {
      id: 'pending',
      title: 'Pending Amount',
      value: formatCurrency(stats.pendingAmount),
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      buttonText: 'Collect Now',
    },
    {
      id: 'paid',
      title: 'Paid Amount',
      value: formatCurrency(stats.paidAmount),
      icon: IndianRupee,
      color: 'text-success',
      bgColor: 'bg-success/10',
      buttonText: 'View Details',
    },
    {
      id: 'thisMonth',
      title: 'This Month',
      value: formatCurrency(stats.thisMonthRevenue),
      icon: TrendingUp,
      color: 'text-accent-foreground',
      bgColor: 'bg-accent/30',
      buttonText: 'View Report',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="stat-card animate-fade-in hover:shadow-lg transition-all duration-300 cursor-pointer group"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => onCardClick?.(card.id)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
              <p className="text-xl font-bold font-heading text-foreground truncate">
                {card.value}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full mt-2 ${card.color} opacity-0 group-hover:opacity-100 transition-opacity`}
            onClick={(e) => {
              e.stopPropagation();
              onCardClick?.(card.id);
            }}
          >
            {card.buttonText}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      ))}
    </div>
  );
}
