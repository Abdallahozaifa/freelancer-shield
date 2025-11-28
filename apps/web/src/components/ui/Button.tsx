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
    'bg-blue-600 text-white',
    'hover:bg-blue-700',
    'focus-visible:ring-blue-500',
    'disabled:bg-blue-300',
  ],
  secondary: [
    'bg-gray-100 text-gray-900',
    'hover:bg-gray-200',
    'focus-visible:ring-gray-500',
    'disabled:bg-gray-50 disabled:text-gray-400',
  ],
  outline: [
    'border border-gray-300 bg-transparent text-gray-700',
    'hover:bg-gray-50',
    'focus-visible:ring-gray-500',
    'disabled:text-gray-300 disabled:border-gray-200',
  ],
  ghost: [
    'bg-transparent text-gray-700',
    'hover:bg-gray-100',
    'focus-visible:ring-gray-500',
    'disabled:text-gray-300',
  ],
  danger: [
    'bg-red-600 text-white',
    'hover:bg-red-700',
    'focus-visible:ring-red-500',
    'disabled:bg-red-300',
  ],
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
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
          'inline-flex items-center justify-center font-medium rounded-md',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
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
