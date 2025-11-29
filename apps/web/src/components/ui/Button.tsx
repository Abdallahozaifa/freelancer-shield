import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses = {
  primary: [
    'bg-indigo-600 text-white',
    'shadow-sm shadow-indigo-600/20',
    'hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/25',
    'active:scale-[0.98]',
    'focus-visible:ring-indigo-500',
    'disabled:bg-indigo-300 disabled:shadow-none',
  ],
  secondary: [
    'bg-slate-100 text-slate-700',
    'hover:bg-slate-200',
    'active:scale-[0.98]',
    'focus-visible:ring-slate-500',
    'disabled:bg-slate-50 disabled:text-slate-400',
  ],
  outline: [
    'border border-slate-300 bg-white text-slate-700',
    'shadow-sm',
    'hover:bg-slate-50 hover:border-slate-400',
    'active:scale-[0.98]',
    'focus-visible:ring-slate-500',
    'disabled:text-slate-300 disabled:border-slate-200 disabled:bg-white',
  ],
  ghost: [
    'bg-transparent text-slate-700',
    'hover:bg-slate-100',
    'active:scale-[0.98]',
    'focus-visible:ring-slate-500',
    'disabled:text-slate-300',
  ],
  danger: [
    'bg-red-600 text-white',
    'shadow-sm shadow-red-600/20',
    'hover:bg-red-700 hover:shadow-md hover:shadow-red-600/25',
    'active:scale-[0.98]',
    'focus-visible:ring-red-500',
    'disabled:bg-red-300 disabled:shadow-none',
  ],
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-2.5 text-base gap-2 rounded-xl',
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:transform-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn('animate-spin', iconSizeClasses[size])} />
        ) : (
          leftIcon && (
            <span className={cn('flex-shrink-0', iconSizeClasses[size])}>
              {leftIcon}
            </span>
          )
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className={cn('flex-shrink-0', iconSizeClasses[size])}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
