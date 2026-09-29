import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              border: 'border-emerald-500',
              bg: 'bg-surface-light dark:bg-surface-dark',
              iconColor: 'text-emerald-500'
            },
            warning: {
              icon: AlertTriangle,
              border: 'border-amber-500',
              bg: 'bg-surface-light dark:bg-surface-dark',
              iconColor: 'text-amber-500'
            },
            error: {
              icon: AlertOctagon,
              border: 'border-red-500',
              bg: 'bg-surface-light dark:bg-surface-dark',
              iconColor: 'text-red-500'
            },
            critical: {
              icon: AlertOctagon,
              border: 'border-red-600 shadow-lg shadow-red-500/20',
              bg: 'bg-red-50 dark:bg-red-950/80',
              iconColor: 'text-red-600'
            },
            info: {
              icon: Info,
              border: 'border-cjack-accent',
              bg: 'bg-surface-light dark:bg-surface-dark',
              iconColor: 'text-cjack-accent'
            }
          }[toast.type] || {
            icon: Info,
            border: 'border-surface-borderLight dark:border-surface-borderDark',
            bg: 'bg-surface-light dark:bg-surface-dark',
            iconColor: 'text-gray-400'
          };

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-md text-xs transition-all ${typeConfig.border} ${typeConfig.bg}`}
              role="alert"
            >
              <IconComponent className={`h-4 w-4 mt-0.5 shrink-0 ${typeConfig.iconColor}`} />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                    {toast.title}
                  </p>
                )}
                {toast.message && (
                  <p className="text-gray-600 dark:text-gray-300 break-words">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
