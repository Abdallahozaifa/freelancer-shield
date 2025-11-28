import React from 'react';
import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  icon?: React.ReactNode;
}

const typeStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    content: 'text-blue-700',
    close: 'text-blue-500 hover:bg-blue-100',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-500',
    title: 'text-green-800',
    content: 'text-green-700',
    close: 'text-green-500 hover:bg-green-100',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    content: 'text-yellow-700',
    close: 'text-yellow-500 hover:bg-yellow-100',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    content: 'text-red-700',
    close: 'text-red-500 hover:bg-red-100',
  },
};

const defaultIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  children,
  onClose,
  icon,
}) => {
  const styles = typeStyles[type];
  const DefaultIcon = defaultIcons[type];

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        styles.container
      )}
      role="alert"
    >
      <div className="flex">
        <div className={cn('flex-shrink-0', styles.icon)}>
          {icon || <DefaultIcon className="h-5 w-5" aria-hidden="true" />}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn('text-sm font-medium', styles.title)}>
              {title}
            </h3>
          )}
          <div className={cn('text-sm', styles.content, title && 'mt-1')}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'inline-flex rounded-md p-1.5',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'transition-colors duration-200',
                styles.close
              )}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
