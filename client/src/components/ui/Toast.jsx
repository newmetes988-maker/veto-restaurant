import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';

const icons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
};

const bgStyles = {
  success: 'bg-emerald-500/10 border-emerald-500/20',
  error: 'bg-red-500/10 border-red-500/20',
  info: 'bg-blue-500/10 border-blue-500/20',
};

export const ToastContainer = () => {
  const toasts = useAdminStore((state) => state.toasts);
  const removeToast = useAdminStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md ${bgStyles[toast.type]} animate-slide-up min-w-[280px]`}
        >
          {icons[toast.type]}
          <span className="text-sm text-white/90 flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
