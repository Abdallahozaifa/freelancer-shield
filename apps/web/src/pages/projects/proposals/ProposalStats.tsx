import React from 'react';
import { FileText, Send, Clock, DollarSign } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { formatCurrency } from '../../../utils/format';

export type ActiveFilter = 'all' | 'draft' | 'sent';

interface ProposalStatsProps {
  draft: number;
  sent: number;
  pendingAmount: number;
  isLoading?: boolean;
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
}

export const ProposalStats: React.FC<ProposalStatsProps> = ({
  draft,
  sent,
  pendingAmount,
  isLoading,
  activeFilter,
  onFilterChange,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-10" />
          </div>
        ))}
      </div>
    );
  }

  const total = draft + sent;

  const stats = [
    {
      id: 'all' as const,
      label: 'All Active',
      value: total,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      hoverBorder: 'hover:border-gray-400',
    },
    {
      id: 'draft' as const,
      label: 'Draft',
      value: draft,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      hoverBorder: 'hover:border-gray-400',
    },
    {
      id: 'sent' as const,
      label: 'Sent',
      value: sent,
      subValue: pendingAmount > 0 ? formatCurrency(pendingAmount) : undefined,
      icon: Send,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      hoverBorder: 'hover:border-blue-400',
      highlight: sent > 0,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeFilter === stat.id;

          return (
            <button
              key={stat.id}
              onClick={() => onFilterChange(stat.id)}
              className={cn(
                'bg-white rounded-lg border-2 p-4 transition-all text-left',
                'hover:shadow-md cursor-pointer',
                stat.hoverBorder,
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : stat.highlight
                  ? 'border-blue-300 shadow-sm shadow-blue-100'
                  : 'border-gray-200'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn('p-1.5 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('w-4 h-4', stat.color)} />
                </div>
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <p
                className={cn(
                  'text-2xl font-bold',
                  stat.highlight && !isActive ? 'text-blue-600' : 'text-gray-900'
                )}
              >
                {stat.value}
              </p>
              {stat.subValue && (
                <p className="text-xs text-blue-500 mt-0.5">
                  {stat.subValue} pending
                </p>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 text-center">Click a card to filter</p>
    </div>
  );
};

export default ProposalStats;
