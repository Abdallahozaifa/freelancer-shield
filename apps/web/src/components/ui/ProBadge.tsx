import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gradient' | 'subtle' | 'outline';
  showIcon?: boolean;
  className?: string;
}

export const ProBadge: React.FC<ProBadgeProps> = ({ 
  size = 'md', 
  variant = 'gradient',
  showIcon = true,
  className 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const variantClasses = {
    gradient: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm',
    subtle: 'bg-indigo-100 text-indigo-700',
    outline: 'border border-indigo-300 text-indigo-700 bg-white',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 font-bold rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Pro Plan Member"
    >
      {showIcon && <Crown className={iconSizes[size]} />}
      PRO
    </span>
  );
};

