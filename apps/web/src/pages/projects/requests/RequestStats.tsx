import React from 'react';
import { FileText, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export type StatsFilter = 'all' | 'out_of_scope' | 'in_scope' | 'clarification_needed';

interface RequestStatsProps {
  total: number;
  inScope: number;
  outOfScope: number;
  clarificationNeeded: number;
  isLoading?: boolean;
  activeFilter: StatsFilter;
  onFilterChange: (filter: StatsFilter) => void;
}

export const RequestStats: React.FC<RequestStatsProps> = ({
  total,
  inScope,
  outOfScope,
  clarificationNeeded,
  isLoading,
  activeFilter,
  onFilterChange,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 animate-pulse"
          >
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 mb-2" />
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-10 sm:w-12" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      id: 'all' as const,
      label: 'All Active',
      shortLabel: 'All',
      value: total,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      activeRing: 'ring-gray-300',
      hoverBorder: 'hover:border-gray-400',
    },
    {
      id: 'out_of_scope' as const,
      label: 'Out of Scope',
      shortLabel: 'Out',
      value: outOfScope,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      activeRing: 'ring-red-300',
      hoverBorder: 'hover:border-red-400',
      warning: outOfScope > 0,
    },
    {
      id: 'in_scope' as const,
      label: 'In Scope',
      shortLabel: 'In',
      value: inScope,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      activeRing: 'ring-green-300',
      hoverBorder: 'hover:border-green-400',
    },
    {
      id: 'clarification_needed' as const,
      label: 'Needs Clarification',
      shortLabel: 'Info',
      value: clarificationNeeded,
      icon: HelpCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      activeRing: 'ring-yellow-300',
      hoverBorder: 'hover:border-yellow-400',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeFilter === stat.id;

          return (
            <button
              key={stat.id}
              onClick={() => onFilterChange(stat.id)}
              className={cn(
                'bg-white rounded-lg border-2 p-2.5 sm:p-4 transition-all text-left',
                'hover:shadow-md active:scale-[0.98] cursor-pointer',
                stat.hoverBorder,
                isActive
                  ? `border-indigo-500 ring-2 ring-indigo-200`
                  : stat.warning
                  ? 'border-red-300 shadow-sm shadow-red-100'
                  : 'border-gray-200'
              )}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <div className={cn('p-1 sm:p-1.5 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('w-3 h-3 sm:w-4 sm:h-4', stat.color)} />
                </div>
                <span className="text-[10px] sm:text-sm text-gray-600">
                  <span className="sm:hidden">{stat.shortLabel}</span>
                  <span className="hidden sm:inline">{stat.label}</span>
                </span>
              </div>
              <p
                className={cn(
                  'text-xl sm:text-2xl font-bold',
                  stat.warning && !isActive ? 'text-red-600' : 'text-gray-900'
                )}
              >
                {stat.value}
              </p>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] sm:text-xs text-gray-400 text-center">Tap to filter</p>
    </div>
  );
};

export default RequestStats;
