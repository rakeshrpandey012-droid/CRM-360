import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  };

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          border: 'border-emerald-500/30 dark:border-emerald-500/20',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          glow: 'shadow-emerald-500/10',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          border: 'border-rose-500/30 dark:border-rose-500/20',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          glow: 'shadow-rose-500/10',
          badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          border: 'border-amber-500/30 dark:border-amber-500/20',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          glow: 'shadow-amber-500/10',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
          border: 'border-blue-500/30 dark:border-blue-500/20',
          bg: 'bg-white/95 dark:bg-slate-900/95',
          glow: 'shadow-blue-500/10',
          badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        };
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const style = getToastStyle(t.type);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start p-4 rounded-2xl border shadow-xl backdrop-blur-md animate-toast-in ${style.border} ${style.bg} ${style.glow} transition-all duration-200`}
            >
              <div className="mr-3 mt-0.5">{style.icon}</div>
              <div className="flex-1 pr-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {t.title}
                </h4>
                {t.message && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
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
