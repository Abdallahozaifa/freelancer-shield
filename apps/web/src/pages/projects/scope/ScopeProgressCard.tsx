import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Card } from '../../../components/ui';
import { cn } from '../../../utils/cn';

export interface ScopeProgressData {
  total_items: number;
  completed_items: number;
  completion_percentage: number;
  total_estimated_hours: number | null;
  completed_estimated_hours: number | null;
}

interface ScopeProgressCardProps {
  progress: ScopeProgressData;
  className?: string;
}

const formatHours = (hours: number | null): string => {
  if (hours === null || hours === undefined) return '0';
  const num = Number(hours);
  // Remove unnecessary decimal places (8.0 -> 8, 8.5 -> 8.5)
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
};

export const ScopeProgressCard: React.FC<ScopeProgressCardProps> = ({
  progress,
  className,
}) => {
  const {
    total_items,
    completed_items,
    completion_percentage,
    total_estimated_hours,
    completed_estimated_hours,
  } = progress;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Progress: {completed_items} of {total_items} items ({completion_percentage}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            getProgressColor(completion_percentage)
          )}
          style={{ width: `${completion_percentage}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">{completed_items} Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600">{total_items - completed_items} Remaining</span>
        </div>
        {total_estimated_hours !== null && Number(total_estimated_hours) > 0 && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-gray-500">
              {formatHours(completed_estimated_hours)} of {formatHours(total_estimated_hours)}h completed
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
