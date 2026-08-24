import React, { useState } from 'react';
import {
  Order,
  Zone,
  ActiveUser,
  OrderStatus,
} from '../../../types';
import { StatusBadge } from '../common/StatusBadge';
import { TrackingTimeline } from '../common/TrackingTimeline';
import {
  Package,
  Truck,
  ShieldCheck,
  CalendarClock,
  MapPin,
  Phone,
  MessageSquare,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Search,
  Star,
  DollarSign,
  Sparkles,
  Home,
  Info,
  CreditCard,
  Banknote,
  Send,
  Eye,
  RefreshCw,
  Key,
  Check,
  Copy,
} from 'lucide-react';

interface RecipientPortalProps {
  currentUser: ActiveUser;
  orders: Order[];
  zones: Zone[];
  onOpenRescheduleModal: (order: Order) => void;
  onSelectOrderToTrack: (order: Order) => void;
}

export const RecipientPortal: React.FC<RecipientPortalProps> = ({
  currentUser,
  orders,
  onOpenRescheduleModal,
  onSelectOrderToTrack,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'ACTION_NEEDED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  // Delivery Notes State
  const [customInstructions, setCustomInstructions] = useState<Record<string, string>>({
    'ord-001': 'Please ring the buzzer for Apt 4B or leave with concierge.',
  });
  const [editingInstructionFor, setEditingInstructionFor] = useState<string | null>(null);
  const [tempInstruction, setTempInstruction] = useState('');

  // Ratings State for completed deliveries
  const [ratings, setRatings] = useState<Record<string, { stars: number; feedback: string }>>({
    'ord-004': { stars: 5, feedback: 'Arrived right on time in pristine condition!' },
  });
  const [ratingInput, setRatingInput] = useState<{ orderId: string; stars: number; feedback: string } | null>(null);

  // COD Payment readiness state
  const [cashReady, setCashReady] = useState<Record<string, boolean>>({});
  const [showPrepayModal, setShowPrepayModal] = useState<Order | null>(null);
  const [prepaySuccess, setPrepaySuccess] = useState<string | null>(null);

  // Filter orders related to this recipient
  const recipientOrders = orders.filter((ord) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ord.trackingNumber.toLowerCase().includes(q) ||
        ord.itemDescription.toLowerCase().includes(q) ||
        ord.senderName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeOrders = recipientOrders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );
  const deliveredOrders = recipientOrders.filter((o) => o.status === 'DELIVERED');
  const actionNeededOrders = recipientOrders.filter(
    (o) => o.status === 'FAILED' || o.status === 'RESCHEDULED' || (o.paymentType === 'COD' && o.status === 'OUT_FOR_DELIVERY')
  );

  const displayedOrders =
    activeFilter === 'ACTIVE'
      ? activeOrders
      : activeFilter === 'DELIVERED'
      ? deliveredOrders
      : activeFilter === 'ACTION_NEEDED'
      ? actionNeededOrders
      : recipientOrders;

  // Selected Order for focus or default to first active order
  const focusedOrder =
    recipientOrders.find((o) => o.id === selectedOrderId) ||
    activeOrders[0] ||
    recipientOrders[0];

  // Helper to generate deterministic 4-digit OTP from tracking number for demonstration
  const getDeliveryOtp = (order: Order) => {
    const digits = order.trackingNumber.replace(/\D/g, '');
    if (digits.length >= 4) {
      return digits.slice(-4);
    }
    return '4829';
  };

  const handleCopyOtp = (otp: string, orderId: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(orderId);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const handleSaveInstruction = (orderId: string) => {
    if (tempInstruction.trim()) {
      setCustomInstructions((prev) => ({
        ...prev,
        [orderId]: tempInstruction.trim(),
      }));
    }
    setEditingInstructionFor(null);
    setTempInstruction('');
  };

  const handleSaveRating = () => {
    if (ratingInput) {
      setRatings((prev) => ({
        ...prev,
        [ratingInput.orderId]: {
          stars: ratingInput.stars,
          feedback: ratingInput.feedback,
        },
      }));
      setRatingInput(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Recipient Welcome Hero */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-zinc-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-400/30">
              <Sparkles size={13} className="text-amber-400" />
              <span>Phase 11 · Customer & Recipient Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Track incoming parcels in real-time, reveal your 4-digit doorstep delivery OTP, provide gate instructions, and reschedule delivery slots.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-center min-w-[100px]">
              <span className="text-[10px] text-zinc-400 font-mono block">INCOMING</span>
              <span className="text-xl font-bold font-mono text-amber-400">{activeOrders.length}</span>
            </div>
            <div className="px-4 py-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-center min-w-[100px]">
              <span className="text-[10px] text-zinc-400 font-mono block">DELIVERED</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{deliveredOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Orders List, Right Focused Order Card & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Orders Explorer */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search and Filters Bar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracking ID, item, sender..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeFilter === 'ACTIVE'
                    ? 'bg-amber-500 text-zinc-950 shadow-2xs font-black'
                    : 'bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200'
                }`}
              >
                Active ({activeOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('ACTION_NEEDED')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeFilter === 'ACTION_NEEDED'
                    ? 'bg-amber-500 text-zinc-950 shadow-2xs font-black'
                    : 'bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200'
                }`}
              >
                Action Needed ({actionNeededOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('DELIVERED')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeFilter === 'DELIVERED'
                    ? 'bg-amber-500 text-zinc-950 shadow-2xs font-black'
                    : 'bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200'
                }`}
              >
                Delivered ({deliveredOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeFilter === 'ALL'
                    ? 'bg-amber-500 text-zinc-950 shadow-2xs font-black'
                    : 'bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200'
                }`}
              >
                All ({recipientOrders.length})
              </button>
            </div>
          </div>

          {/* Orders Cards List */}
          <div className="space-y-3">
            {displayedOrders.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs">
                No shipments found matching this filter.
              </div>
            ) : (
              displayedOrders.map((ord) => {
                const isSelected = focusedOrder?.id === ord.id;
                const otp = getDeliveryOtp(ord);
                const isOutForDelivery = ord.status === 'OUT_FOR_DELIVERY';

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-zinc-900 ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                        : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <Package size={14} className="text-amber-500" />
                        {ord.trackingNumber}
                      </span>
                      <StatusBadge status={ord.status} />
                    </div>

                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {ord.itemDescription}
                    </h4>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="truncate">From: {ord.senderName}</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200">
                        {ord.paymentType === 'COD'
                          ? `COD ₹${((ord.codAmountDue ?? (ord as any).codAmount ?? ord.charges?.totalCharge ?? (ord as any).calculatedCharge) ?? 0).toFixed(2)}`
                          : 'Prepaid'}
                      </span>
                    </div>

                    {/* Quick Doorstep OTP Banner for Out for Delivery */}
                    {isOutForDelivery && (
                      <div className="mt-2.5 p-2 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-amber-900 dark:text-amber-300 font-mono text-[11px]">
                          <Key size={12} className="text-amber-600" />
                          OTP: <strong>{otp}</strong>
                        </span>
                        <span className="text-[10px] bg-amber-500 text-zinc-950 font-bold px-1.5 py-0.2 rounded font-mono">
                          DOORSTEP
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Focused Order Detail Stage */}
        <div className="lg:col-span-7 space-y-5">
          {focusedOrder ? (
            <>
              {/* Focused Order Top Card */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-zinc-950 dark:text-white font-mono">
                        {focusedOrder.trackingNumber}
                      </h2>
                      <StatusBadge status={focusedOrder.status} />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {focusedOrder.itemDescription} · Sent by {focusedOrder.senderName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {focusedOrder.status !== 'DELIVERED' && (
                      <button
                        type="button"
                        onClick={() => onOpenRescheduleModal(focusedOrder)}
                        className="px-3.5 py-2 bg-amber-50 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5"
                      >
                        <CalendarClock size={14} />
                        <span>Reschedule Slot</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4-Digit OTP Handshake Card (If In Transit / Out for Delivery) */}
                {focusedOrder.status !== 'DELIVERED' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                        <Key size={22} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-900 dark:text-amber-300 tracking-wider">
                          DOORSTEP VERIFICATION CODE
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-2xl font-black font-mono tracking-widest text-zinc-950 dark:text-white">
                            {getDeliveryOtp(focusedOrder)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyOtp(getDeliveryOtp(focusedOrder), focusedOrder.id)}
                            className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 transition-colors text-xs font-bold flex items-center gap-1 font-mono"
                            title="Copy OTP"
                          >
                            {copiedOtp === focusedOrder.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            <span className="text-[10px]">{copiedOtp === focusedOrder.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-zinc-600 dark:text-zinc-400">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-200">Share with courier at doorstep</p>
                      <p className="text-[11px] text-zinc-500">Prevents misdelivery & verifies handover</p>
                    </div>
                  </div>
                )}

                {/* Delivery Notes / Gate Instructions */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Home size={14} className="text-amber-500" />
                      Gate & Delivery Instructions
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingInstructionFor(focusedOrder.id);
                        setTempInstruction(customInstructions[focusedOrder.id] || '');
                      }}
                      className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      {customInstructions[focusedOrder.id] ? 'Edit Note' : '+ Add Note'}
                    </button>
                  </div>

                  {editingInstructionFor === focusedOrder.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={tempInstruction}
                        onChange={(e) => setTempInstruction(e.target.value)}
                        placeholder="e.g. Leave with security guard, call before ringing doorbell..."
                        rows={2}
                        className="w-full p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-stone-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingInstructionFor(null)}
                          className="px-3 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveInstruction(focusedOrder.id)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg"
                        >
                          Save Instructions
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {customInstructions[focusedOrder.id] || (
                        <span className="italic text-zinc-400">
                          No special delivery instructions provided. Courier will deliver to standard doorstep address.
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Tracking Timeline Component */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold font-mono uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-3">
                    Consignment Audit Milestones
                  </h3>
                  <TrackingTimeline
                    order={focusedOrder}
                    onOpenRescheduleModal={onOpenRescheduleModal}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              Select an order to view live details and doorstep OTP.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
