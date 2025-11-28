import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

// Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

// Zustand Store
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Hook
export function useToast() {
  const { addToast, removeToast } = useToastStore();

  return {
    toast: (options: Omit<Toast, 'id'>) => addToast(options),
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
    dismiss: (id: string) => removeToast(id),
  };
}

// Toast Item Component
const typeStyles = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-500',
    title: 'text-green-800',
    message: 'text-green-700',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700',
  },
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const styles = typeStyles[toast.type];
  const Icon = icons[toast.type];

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onDismiss]);

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-lg border shadow-lg pointer-events-auto',
        'animate-in slide-in-from-right-full duration-300',
        styles.container
      )}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn('flex-shrink-0', styles.icon)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <p className={cn('text-sm font-medium', styles.title)}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={cn('mt-1 text-sm', styles.message)}>
                {toast.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'ml-4 inline-flex rounded-md p-1.5',
              'text-gray-400 hover:text-gray-600',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'transition-colors duration-200'
            )}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};
