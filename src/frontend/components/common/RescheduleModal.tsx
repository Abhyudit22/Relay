import React, { useState } from 'react';
import { Order } from '../../../types';
import {
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface RescheduleModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReschedule: (
    orderId: string,
    rescheduleData: {
      requestedDate: string;
      timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
      customerNotes?: string;
    }
  ) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmReschedule,
}) => {
  // Compute default next available dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const threeDaysOut = new Date(today);
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);

  const formatDateValue = (d: Date) => d.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(formatDateValue(tomorrow));
  const [selectedSlot, setSelectedSlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmReschedule(order.id, {
        requestedDate: selectedDate,
        timeSlot: selectedSlot,
        customerNotes: notes.trim() || undefined,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const quickDates = [
    {
      label: 'Tomorrow',
      date: formatDateValue(tomorrow),
      formatted: tomorrow.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    },
    {
      label: 'Day After',
      date: formatDateValue(dayAfter),
      formatted: dayAfter.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    },
    {
      label: 'In 3 Days',
      date: formatDateValue(threeDaysOut),
      formatted: threeDaysOut.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-zinc-950 to-stone-900 text-white p-5 flex items-start justify-between border-b border-rose-900/40">
          <div>
            <span className="text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
              Recovery Protocol
            </span>
            <h3 className="text-lg font-black mt-1 text-white tracking-tight">Reschedule Delivery Attempt</h3>
            <p className="text-xs text-zinc-300 font-mono">
              Tracking #{order.trackingNumber} · Free customer re-delivery
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Failure Summary Alert */}
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-300">
            <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Prior Attempt Delay Reason:</p>
              <p className="text-rose-800 dark:text-rose-300 mt-0.5">
                {order.history.find((h) => h.status === 'FAILED')?.failureReason ||
                  'Customer was unreachable at delivery location.'}
              </p>
            </div>
          </div>

          {/* 1. Date Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              <Calendar size={14} className="text-amber-500" />
              1. Choose Preferred Date
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickDates.map((q) => (
                <button
                  key={q.date}
                  type="button"
                  onClick={() => setSelectedDate(q.date)}
                  className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                    selectedDate === q.date
                      ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/20 font-bold text-amber-900 dark:text-amber-300 shadow-2xs'
                      : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 hover:border-stone-300 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="block text-[10px] text-zinc-400 uppercase font-mono">{q.label}</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{q.formatted}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Slot Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              <Clock size={14} className="text-amber-500" />
              2. Preferred Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { slot: 'MORNING' as const, time: '09:00 - 13:00', label: 'Morning' },
                { slot: 'AFTERNOON' as const, time: '13:00 - 17:00', label: 'Afternoon' },
                { slot: 'EVENING' as const, time: '17:00 - 21:00', label: 'Evening' },
              ].map((s) => (
                <button
                  key={s.slot}
                  type="button"
                  onClick={() => setSelectedSlot(s.slot)}
                  className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                    selectedSlot === s.slot
                      ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/20 font-bold text-amber-900 dark:text-amber-300 shadow-2xs'
                      : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 hover:border-stone-300 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="block font-bold text-zinc-900 dark:text-white">{s.label}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{s.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Customer Gate Instructions */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-mono">
              <MessageSquare size={14} className="text-amber-500" />
              3. Doorstep Handover Instructions (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Leave with building security guard, buzzer code is #402..."
              rows={2}
              className="w-full p-3 bg-stone-50 dark:bg-zinc-800 rounded-2xl border border-stone-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-98"
            >
              <RotateCcw size={14} />
              <span>{isSubmitting ? 'Scheduling...' : 'Confirm Rescheduled Slot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
