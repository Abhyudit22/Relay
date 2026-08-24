import React, { useState } from 'react';
import { Order, OrderStatus } from '../../../types';
import { StatusBadge } from './StatusBadge';
import { ShippingLabelModal } from './ShippingLabelModal';
import { LiveTrackingMap } from './LiveTrackingMap';
import {
  Package,
  MapPin,
  User,
  ShieldCheck,
  Copy,
  Check,
  CalendarClock,
  Printer,
  CheckCircle2,
  Truck,
  Layers,
  Map,
  ListOrdered,
} from 'lucide-react';

interface TrackingTimelineProps {
  order: Order;
  onOpenRescheduleModal?: (order: Order) => void;
  onViewInvoice?: (order: Order) => void;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  order,
  onOpenRescheduleModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'timeline' | 'both'>('both');

  const copyTracking = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActorBadge = (role: string, name: string) => {
    switch (role) {
      case 'agent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-green-950 text-green-300 px-2 py-0.5 rounded border border-green-800/40">
            <User size={11} /> Courier: {name}
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/40">
            <ShieldCheck size={11} /> Admin: {name}
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
            ⚡ System Engine
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
            👤 Shipper: {name}
          </span>
        );
    }
  };

  // Standard delivery stages
  const stages: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'PENDING', label: 'Order Placed', icon: Package },
    { status: 'PICKED_UP', label: 'Picked Up', icon: Layers },
    { status: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStageIndex = (status: OrderStatus) => {
    if (status === 'DELIVERED') return 4;
    if (status === 'OUT_FOR_DELIVERY') return 3;
    if (status === 'IN_TRANSIT' || status === 'RESCHEDULED') return 2;
    if (status === 'PICKED_UP') return 1;
    if (status === 'PENDING') return 0;
    return 0;
  };

  const currentStageIdx = getStageIndex(order.status);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { date: iso, time: '' };
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-950 text-white p-6 border-b border-zinc-800">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase text-zinc-400 font-bold">
                Consignment Tracking No.
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/50 font-bold">
                {order.orderType}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {order.trackingNumber}
              </h2>
              <button
                type="button"
                onClick={copyTracking}
                title="Copy tracking code"
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl border border-zinc-700 transition-colors"
              >
                {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
              <Package size={13} className="text-red-500" />
              {order.itemDescription} · <span className="text-zinc-200">{order.dimensions?.billableWeightKg ?? order.dimensions?.actualWeightKg ?? (order as any).weightKg ?? 0} kg</span> billable weight
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <StatusBadge status={order.status} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(true)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Label</span>
              </button>
              {order.status !== 'DELIVERED' && onOpenRescheduleModal && (
                <button
                  type="button"
                  onClick={() => onOpenRescheduleModal(order)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                >
                  <CalendarClock size={13} />
                  <span>Reschedule</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Step Horizontal Progress Tracker */}
        <div className="pt-6">
          <div className="grid grid-cols-5 gap-2 relative">
            {stages.map((stage, idx) => {
              const isCompleted = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              const Icon = stage.icon;

              return (
                <div key={stage.status} className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={`text-[10px] mt-2 font-bold leading-tight ${
                      isCurrent
                        ? 'text-red-400'
                        : isCompleted
                        ? 'text-zinc-200'
                        : 'text-zinc-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="px-6 pt-2 flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'both'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Dual View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'map'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Map size={13} />
            <span>Live GPS Map</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ListOrdered size={13} />
            <span>Audit Trail</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
          Live Real-Time Telemetry
        </span>
      </div>

      {/* Live Map Display */}
      {(viewMode === 'map' || viewMode === 'both') && (
        <div className="p-4 sm:p-6 pt-0">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Map size={14} className="text-amber-500" />
              Live Route Navigation & Rider Radar
            </h3>
            <span className="text-[11px] font-mono text-emerald-500 font-bold">● Active Telemetry Feed</span>
          </div>
          <LiveTrackingMap order={order} />
        </div>
      )}

      {/* Audit Trail Milestones */}
      {(viewMode === 'timeline' || viewMode === 'both') && (
        <div className="p-6 pt-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Timestamped Audit Trail
          </h3>

          <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
            {(order.history || []).map((event, idx) => {
              const isLatest = idx === (order.history?.length || 1) - 1;
              const ts = formatTimestamp(event.timestamp);

              return (
                <div key={event.id || idx} className="relative pl-8 text-xs">
                  <div
                    className={`absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-zinc-900 ${
                      isLatest
                        ? 'border-red-600 ring-4 ring-red-600/20'
                        : 'border-zinc-400 dark:border-zinc-700'
                    }`}
                  />

                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white uppercase">
                        {event.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {ts.date} at {ts.time}
                      </span>
                    </div>

                    {event.remarks && (
                      <p className="text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed">
                        {event.remarks}
                      </p>
                    )}

                    {event.failureReason && (
                      <p className="text-red-600 dark:text-red-400 font-semibold text-xs">
                        Issue: {event.failureReason}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[11px]">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <MapPin size={11} /> {event.location || order.recipientAddress || (order as any).deliveryAddress || ''}
                      </span>
                      <div>
                        {getActorBadge(
                          event.actorRole || (event as any).actor?.role || 'system',
                          event.actorName || (event as any).actor?.name || 'System'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Label Modal */}
      {isLabelModalOpen && (
        <ShippingLabelModal
          order={order}
          isOpen={true}
          onClose={() => setIsLabelModalOpen(false)}
        />
      )}
    </div>
  );
};
