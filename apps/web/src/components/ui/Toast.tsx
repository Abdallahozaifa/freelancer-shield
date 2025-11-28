import { useEffect } from 'react';
import { create } from 'zustand';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

// Toast interface (exported as type)
export interface Toast {
  id: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Toast store
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Hook for easy toast usage
export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore();

  return {
    toast: (message: string, variant: Toast['variant'] = 'info', duration = 5000) => {
      addToast({ message, variant, duration });
    },
    success: (message: string, duration = 5000) => {
      addToast({ message, variant: 'success', duration });
    },
    error: (message: string, duration = 5000) => {
      addToast({ message, variant: 'error', duration });
    },
    warning: (message: string, duration = 5000) => {
      addToast({ message, variant: 'warning', duration });
    },
    info: (message: string, duration = 5000) => {
      addToast({ message, variant: 'info', duration });
    },
    dismiss: removeToast,
    clearAll: clearToasts,
  };
}

// Variant styles
const variantStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle,
    iconClass: 'text-green-500',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: AlertCircle,
    iconClass: 'text-red-500',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertTriangle,
    iconClass: 'text-yellow-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconClass: 'text-blue-500',
  },
};

// Individual toast item
function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const styles = variantStyles[toast.variant];
  const Icon = styles.icon;

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-md',
        'animate-in slide-in-from-right-full fade-in duration-200',
        styles.container
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 shrink-0', styles.iconClass)} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast container - renders all toasts
export function ToastContainer() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

export default ToastContainer;
