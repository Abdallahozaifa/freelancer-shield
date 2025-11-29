import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const variantClasses = {
  default: 'bg-white rounded-2xl border border-slate-200/60 shadow-sm',
  elevated: 'bg-white rounded-2xl border border-slate-200/60 shadow-md',
  outlined: 'bg-white rounded-2xl border-2 border-slate-200',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
  variant = 'default',
}) => {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'transition-all duration-200 hover:shadow-lg hover:border-slate-300/60 hover:-translate-y-0.5',
        isClickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  action,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-4 mb-4 border-b border-slate-100',
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
};

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return <div className={cn(className)}>{children}</div>;
};

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'pt-4 mt-4 border-t border-slate-100 flex items-center gap-3',
        className
      )}
    >
      {children}
    </div>
  );
};

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  as: Component = 'h3',
}) => {
  return (
    <Component className={cn('text-lg font-semibold text-slate-900', className)}>
      {children}
    </Component>
  );
};

export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={cn('text-sm text-slate-500 mt-1', className)}>{children}</p>
  );
};

// Stat Card Component
export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconVariant?: 'primary' | 'success' | 'warning' | 'danger';
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

const iconVariantClasses = {
  primary: 'bg-indigo-100 text-indigo-600',
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  danger: 'bg-red-100 text-red-600',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconVariant = 'primary',
  trend,
  className,
}) => {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 mt-2 text-sm font-medium',
              trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-slate-400 font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl',
            iconVariantClasses[iconVariant]
          )}>
            {icon}
          </div>
        )}
      </div>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-transparent pointer-events-none" />
    </Card>
  );
};
