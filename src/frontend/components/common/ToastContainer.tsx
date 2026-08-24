import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Truck,
  X,
  CalendarClock,
} from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'reschedule';
  title: string;
  message: string;
  trackingNumber?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto p-4 rounded-xl shadow-xl border bg-white border-slate-200 animate-in slide-in-from-bottom-5 duration-200 space-y-1"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {t.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
              {t.type === 'info' && <Truck size={16} className="text-blue-600" />}
              {t.type === 'warning' && <AlertCircle size={16} className="text-rose-600" />}
              {t.type === 'reschedule' && <CalendarClock size={16} className="text-purple-600" />}
              <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 leading-snug">{t.message}</p>

          {t.trackingNumber && (
            <span className="inline-block text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
              {t.trackingNumber}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
