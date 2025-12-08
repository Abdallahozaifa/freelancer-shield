import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { ScopeClassification } from '../../../types';

interface RequestClassificationBadgeProps {
  classification: ScopeClassification | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const classificationConfig: Record<
  ScopeClassification,
  {
    label: string;
    icon: React.ElementType;
    colors: string;
  }
> = {
  in_scope: {
    label: 'In Scope',
    icon: CheckCircle,
    colors: 'bg-green-100 text-green-800 border-green-200',
  },
  out_of_scope: {
    label: 'Out of Scope',
    icon: AlertTriangle,
    colors: 'bg-red-100 text-red-800 border-red-200',
  },
  clarification_needed: {
    label: 'Needs Clarification',
    icon: HelpCircle,
    colors: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  revision: {
    label: 'Revision',
    icon: RefreshCw,
    colors: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    colors: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

const sizeClasses = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const iconSizes = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export const RequestClassificationBadge: React.FC<RequestClassificationBadgeProps> = ({
  classification,
  size = 'md',
  showIcon = true,
}) => {
  // If no classification, show as pending
  const effectiveClassification = classification ?? 'pending';
  const config = classificationConfig[effectiveClassification];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border',
        config.colors,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
};

export default RequestClassificationBadge;
