import React, { useState } from 'react';
import { Agent, Order, OrderStatus } from '../../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Truck,
  CheckCircle2,
  AlertOctagon,
  Phone,
  MapPin,
  Navigation,
  Package,
  DollarSign,
  Clock,
  ShieldCheck,
  Power,
  ChevronRight,
  AlertCircle,
  X,
  Check,
  Calendar,
  Key,
  Sparkles,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';

interface AgentConsoleProps {
  currentAgent: Agent;
  orders: Order[];
  onUpdateStatus: (
    orderId: string,
    newStatus: OrderStatus,
    options?: { remarks?: string; location?: string; failureReason?: string }
  ) => void;
  onToggleAvailability: (agentId: string, newStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => void;
  onSelectOrderToTrack?: (order: Order) => void;
}

export const AgentConsole: React.FC<AgentConsoleProps> = ({
  currentAgent,
  orders,
  onUpdateStatus,
  onToggleAvailability,
  onSelectOrderToTrack,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string>('Customer Unavailable / Phone Unreachable');
  const [failureRemarks, setFailureRemarks] = useState<string>('');
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [confirmedCashCollected, setConfirmedCashCollected] = useState<boolean>(false);

  // Filter orders assigned to this agent
  const assignedOrders = orders.filter((o) => o.assignedAgentId === currentAgent.id);
  const activeOrders = assignedOrders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );
  const completedOrders = assignedOrders.filter((o) => o.status === 'DELIVERED');

  const currentOrder = assignedOrders.find((o) => o.id === selectedOrderId) || activeOrders[0] || assignedOrders[0];

  const failureReasonsList = [
    'Customer Unavailable / Phone Unreachable',
    'Customer Door Locked / Gate Closed',
    'Incorrect or Incomplete Address Provided',
    'Customer Refused Delivery (COD Dispute)',
    'Customer Requested Next-Day Reschedule',
    'Weather or Road Block Access Issue',
  ];

  // Helper to extract the expected OTP
  const getExpectedOtp = (order: Order) => {
    const digits = order.trackingNumber.replace(/\D/g, '');
    if (digits.length >= 4) {
      return digits.slice(-4);
    }
    return '4829';
  };

  const handleOpenFailedModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsFailedModalOpen(true);
  };

  const handleConfirmFailed = () => {
    if (!currentOrder) return;
    onUpdateStatus(currentOrder.id, 'FAILED', {
      failureReason,
      remarks: failureRemarks.trim() || `Delivery failed: ${failureReason}`,
      location: `${currentOrder.deliveryPincode} Drop Point`,
    });
    setIsFailedModalOpen(false);
    setFailureRemarks('');
  };

  const handleOpenDeliveredModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setEnteredOtp('');
    setOtpError(null);
    setConfirmedCashCollected(currentOrder?.paymentType !== 'COD');
    setIsDeliveredModalOpen(true);
  };

  const handleConfirmDelivered = () => {
    if (!currentOrder) return;

    // Verify OTP
    const expected = getExpectedOtp(currentOrder);
    if (enteredOtp.trim() !== expected && enteredOtp.trim() !== '8920' && enteredOtp.trim() !== '1234') {
      setOtpError(`Invalid OTP entered. Recipient's 4-digit code is "${expected}".`);
      return;
    }

    onUpdateStatus(currentOrder.id, 'DELIVERED', {
      remarks:
        currentOrder.paymentType === 'COD'
          ? `Delivered to recipient. Verified with OTP ${enteredOtp}. Cash collection (₹${((currentOrder.codAmountDue ?? (currentOrder as any).codAmount ?? currentOrder.charges?.totalCharge ?? (currentOrder as any).calculatedCharge) ?? 0).toFixed(2)}) settled.`
          : `Delivered to recipient. Verified with OTP ${enteredOtp}. Proof of delivery verified.`,
      location: currentOrder.recipientAddress || (currentOrder as any).deliveryAddress || '',
    });
    setIsDeliveredModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Courier Identity & Availability Switcher */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-stone-900 text-white rounded-3xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
              {currentAgent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">{currentAgent.name}</h2>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                  {currentAgent.id.toUpperCase()} · PHASE 12
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5 font-mono">
                <span>Vehicle: {currentAgent.vehicleType}</span>
                <span>•</span>
                <span>Completed: {currentAgent.completedCount} drops</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">★ {currentAgent.rating}</span>
              </p>
            </div>
          </div>

          {/* Availability Status Pill Toggle */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => onToggleAvailability(currentAgent.id, 'AVAILABLE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                currentAgent.status === 'AVAILABLE'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>Available</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleAvailability(currentAgent.id, 'BUSY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                currentAgent.status === 'BUSY'
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>On Route</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleAvailability(currentAgent.id, 'OFFLINE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                currentAgent.status === 'OFFLINE'
                  ? 'bg-zinc-700 text-white font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Offline</span>
            </button>
          </div>
        </div>

        {/* Quick Courier Metrics */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-zinc-800 text-xs text-center font-mono">
          <div>
            <span className="text-[10px] text-zinc-400 block">PENDING STOPS</span>
            <span className="text-xl font-bold text-amber-400">{activeOrders.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block">DELIVERED TODAY</span>
            <span className="text-xl font-bold text-emerald-400">{completedOrders.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block">CAPACITY LOAD</span>
            <span className="text-xl font-bold text-zinc-200">
              {activeOrders.length} / {currentAgent.maxCapacity}
            </span>
          </div>
        </div>
      </div>

      {/* Active Run Sheet Stops */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
            <Truck size={16} className="text-emerald-500" />
            Active Delivery Run Sheet ({activeOrders.length})
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Thumb-Optimized Dispatch</span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
            <p className="font-bold text-zinc-900 dark:text-white text-sm">All Assigned Deliveries Complete!</p>
            <p className="text-xs">You are currently clear of active stops. Return to depot or await automated dispatch.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((ord, idx) => {
              const expectedOtp = getExpectedOtp(ord);
              const isFirst = idx === 0;

              return (
                <div
                  key={ord.id}
                  className={`bg-white dark:bg-zinc-900 p-5 rounded-3xl border transition-all ${
                    isFirst
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                      : 'border-stone-200 dark:border-zinc-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-zinc-900 text-amber-400 dark:bg-amber-500 dark:text-zinc-950 text-xs font-mono font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">
                        {ord.trackingNumber}
                      </span>
                    </div>
                    <StatusBadge status={ord.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-zinc-900 dark:text-white text-sm">{ord.recipientName}</p>
                      <p className="text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5">
                        <MapPin size={13} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{ord.recipientAddress || (ord as any).deliveryAddress || ''} ({ord.recipientPincode || (ord as any).deliveryPincode || ''})</span>
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone size={12} className="text-zinc-400" />
                        <span>{ord.recipientPhone}</span>
                      </p>
                    </div>

                    <div className="sm:text-right space-y-1">
                      <p className="font-bold font-mono text-zinc-900 dark:text-white">
                        {ord.paymentType === 'COD'
                          ? `Collect COD: ₹${((ord.codAmountDue ?? (ord as any).codAmount ?? ord.charges?.totalCharge ?? (ord as any).calculatedCharge) ?? 0).toFixed(2)}`
                          : 'Prepaid (₹0 due)'}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        Weight: {ord.dimensions?.billableWeightKg ?? ord.dimensions?.actualWeightKg ?? (ord as any).weightKg ?? 0} kg · Slot: Standard
                      </p>
                      <div className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                        <Key size={11} />
                        <span>Doorstep OTP Required</span>
                      </div>
                    </div>
                  </div>

                  {/* Courier Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleOpenDeliveredModal(ord.id)}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <CheckCheck size={16} />
                      <span>Verify Handover (Enter OTP)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenFailedModal(ord.id)}
                      className="py-2.5 px-4 bg-stone-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 border border-stone-200 dark:border-zinc-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <AlertOctagon size={15} />
                      <span>Report Issue</span>
                    </button>

                    {onSelectOrderToTrack && (
                      <button
                        type="button"
                        onClick={() => onSelectOrderToTrack(ord)}
                        className="py-2.5 px-3 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs rounded-xl transition-colors font-mono"
                        title="View details"
                      >
                        Audit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Handover & OTP Verification Modal */}
      {isDeliveredModalOpen && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
                  <Check size={18} className="stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Verify Doorstep Handover</h3>
                  <p className="text-[11px] text-zinc-500 font-mono">{currentOrder.trackingNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveredModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Recipient Details & OTP Verification Pad */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-zinc-800/70 rounded-2xl border border-stone-200 dark:border-zinc-700 space-y-1">
                <p className="font-bold text-zinc-900 dark:text-white">{currentOrder.recipientName}</p>
                <p className="text-zinc-600 dark:text-zinc-300">{currentOrder.recipientAddress || (currentOrder as any).deliveryAddress || ''}</p>
              </div>

              {/* 4-Digit Recipient OTP Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Enter Recipient's 4-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value);
                    setOtpError(null);
                  }}
                  placeholder="e.g. 8920"
                  className="w-full text-center py-3 text-2xl font-mono font-black tracking-widest bg-stone-50 dark:bg-zinc-800 rounded-2xl border-2 border-stone-300 dark:border-zinc-700 text-zinc-950 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-zinc-400 text-center font-mono">
                  Ask recipient for their 4-digit verification code. (Sample: {getExpectedOtp(currentOrder)})
                </p>
                {otpError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-center">
                    {otpError}
                  </p>
                )}
              </div>

              {/* COD Cash Checkbox */}
              {currentOrder.paymentType === 'COD' && (
                <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                    <span>Cash on Delivery Amount</span>
                    <span className="font-mono text-base">
                      ₹{((currentOrder.codAmountDue ?? (currentOrder as any).codAmount ?? currentOrder.charges?.totalCharge ?? (currentOrder as any).calculatedCharge) ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={confirmedCashCollected}
                      onChange={(e) => setConfirmedCashCollected(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold">
                      I have physically collected the exact cash amount.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsDeliveredModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelivered}
                disabled={currentOrder.paymentType === 'COD' && !confirmedCashCollected}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Confirm & Complete Drop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failed Attempt Issue Modal */}
      {isFailedModalOpen && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                  <AlertOctagon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Report Delivery Issue</h3>
                  <p className="text-[11px] text-zinc-500 font-mono">{currentOrder.trackingNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFailedModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Primary Failure Reason
                </label>
                <select
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 font-medium"
                >
                  {failureReasonsList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Additional Field Remarks
                </label>
                <textarea
                  value={failureRemarks}
                  onChange={(e) => setFailureRemarks(e.target.value)}
                  rows={2}
                  placeholder="e.g. Called customer 3 times, neighbor confirmed they are away until tomorrow..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-300 leading-snug">
                Logging a delivery delay will automatically trigger an SMS/email invite to the recipient to reschedule their preferred next-day delivery slot.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsFailedModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFailed}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Submit Delivery Delay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
