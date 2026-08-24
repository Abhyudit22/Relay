import React, { useState } from 'react';
import {
  Order,
  Zone,
  ZoneArea,
  RateCard,
  CodSurchargeConfig,
  ActiveUser,
} from '../../../types';
import { StatusBadge } from '../common/StatusBadge';
import { NewOrderForm } from './NewOrderForm';
import { TrackingTimeline } from '../common/TrackingTimeline';
import { ShippingLabelModal } from '../common/ShippingLabelModal';
import {
  Package,
  Plus,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ArrowUpRight,
  MapPin,
  CalendarClock,
  Sparkles,
  Printer,
  Building2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface CustomerPortalProps {
  currentUser: ActiveUser;
  orders: Order[];
  zones: Zone[];
  zoneAreas: ZoneArea[];
  rateCards: RateCard[];
  codConfigs: CodSurchargeConfig[];
  onOrderCreated: (newOrder: Order) => void;
  onOpenRescheduleModal: (order: Order) => void;
  onSelectOrderToTrack: (order: Order) => void;
  selectedTrackingOrder: Order | null;
  onCloseTrackingModal: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  orders,
  zones,
  zoneAreas,
  rateCards,
  codConfigs,
  onOrderCreated,
  onOpenRescheduleModal,
  onSelectOrderToTrack,
  selectedTrackingOrder,
  onCloseTrackingModal,
}) => {
  const [activeTab, setActiveTab] = useState<'my_orders' | 'new_order'>('my_orders');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [labelOrder, setLabelOrder] = useState<Order | null>(null);

  // Filter orders for this merchant
  const customerOrders = orders;

  const activeCount = customerOrders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'FAILED'
  ).length;
  const failedCount = customerOrders.filter((o) => o.status === 'FAILED').length;
  const deliveredCount = customerOrders.filter((o) => o.status === 'DELIVERED').length;

  const filteredOrders = customerOrders.filter((o) => {
    const matchesSearch =
      o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.itemDescription.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE')
      return (
        matchesSearch &&
        (o.status === 'PENDING' ||
          o.status === 'PICKED_UP' ||
          o.status === 'IN_TRANSIT' ||
          o.status === 'OUT_FOR_DELIVERY')
      );
    if (statusFilter === 'FAILED') return matchesSearch && o.status === 'FAILED';
    if (statusFilter === 'DELIVERED') return matchesSearch && o.status === 'DELIVERED';
    return matchesSearch && o.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Merchant Header & KPI Metrics */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-400/30 font-semibold">
                Phase 11 · Merchant & Shipper Hub
              </span>
              <span className="text-xs text-zinc-400">· {currentUser.companyName || currentUser.email}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl leading-relaxed">
              Book new consignments, calculate volumetric pricing, print 4x6 thermal AWB shipping labels, and track outbound freight.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'new_order' ? 'my_orders' : 'new_order')}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-98"
          >
            {activeTab === 'new_order' ? (
              <span>View Active Shipments</span>
            ) : (
              <>
                <Plus size={16} className="stroke-[3]" />
                <span>+ Book New Shipment</span>
              </>
            )}
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-zinc-800 text-xs">
          <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 font-mono">Active In-Transit</span>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-0.5">{activeCount}</p>
            </div>
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
              <Truck size={18} />
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
              failedCount > 0
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                : 'bg-zinc-900/90 border-zinc-800'
            }`}
          >
            <div>
              <span className="text-[11px] text-zinc-400 font-mono">Action Needed (Failed)</span>
              <p
                className={`text-2xl font-bold font-mono mt-0.5 ${
                  failedCount > 0 ? 'text-rose-400' : 'text-zinc-400'
                }`}
              >
                {failedCount}
              </p>
            </div>
            <div
              className={`p-2.5 rounded-xl ${
                failedCount > 0 ? 'bg-rose-600/30 text-rose-400' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              <AlertTriangle size={18} />
            </div>
          </div>

          <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 font-mono">Successfully Delivered</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">{deliveredCount}</p>
            </div>
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: New Booking Form OR Shipments List */}
      {activeTab === 'new_order' ? (
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                Book Outbound Consignment
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Dynamic rate calculation using dead weight vs volumetric density <code>(L×B×H)/5000</code>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('my_orders')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Back to Shipments
            </button>
          </div>

          <NewOrderForm
            currentUser={currentUser}
            zones={zones}
            zoneAreas={zoneAreas}
            rateCards={rateCards}
            codConfigs={codConfigs}
            onOrderCreated={(newOrd) => {
              onOrderCreated(newOrd);
              setActiveTab('my_orders');
            }}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden space-y-4 p-6">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tracking number, recipient, or item description..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
              {['ALL', 'ACTIVE', 'DELIVERED', 'FAILED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Shipments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 uppercase font-mono text-[10px] border-y border-stone-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Item & Dimensions</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Charge & Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400">
                      No consignments match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => onSelectOrderToTrack(ord)}
                          className="hover:text-amber-500 flex items-center gap-1.5 text-left"
                        >
                          <Package size={14} className="text-amber-500" />
                          <span>{ord.trackingNumber}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        <div className="font-semibold">{ord.itemDescription}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {ord.dimensions?.lengthCm ?? (ord.dimensions as any)?.length ?? 0}×
                          {ord.dimensions?.breadthCm ?? (ord.dimensions as any)?.width ?? 0}×
                          {ord.dimensions?.heightCm ?? (ord.dimensions as any)?.height ?? 0}cm ·{' '}
                          {ord.dimensions?.billableWeightKg ?? ord.dimensions?.actualWeightKg ?? (ord as any).weightKg ?? 0}kg
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        <div className="font-semibold">{ord.recipientName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {ord.recipientPincode ?? (ord as any).deliveryPincode ?? ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        <div className="font-bold font-mono">
                          ₹{(ord.charges?.totalCharge ?? (ord as any).calculatedCharge ?? 0).toFixed(2)}
                        </div>
                        <span className="text-[10px] font-mono uppercase text-zinc-400">
                          {ord.paymentType === 'COD'
                            ? `COD (₹${ord.codAmountDue ?? (ord as any).codAmount ?? 0})`
                            : 'Prepaid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setLabelOrder(ord)}
                          className="px-2.5 py-1 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                          title="Print 4x6 AWB Thermal Label"
                        >
                          <Printer size={12} />
                          <span>AWB</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectOrderToTrack(ord)}
                          className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-zinc-950 text-amber-800 dark:text-amber-300 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Track</span>
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4x6 AWB Thermal Shipping Label Modal */}
      {labelOrder && (
        <ShippingLabelModal
          order={labelOrder}
          isOpen={true}
          onClose={() => setLabelOrder(null)}
        />
      )}
    </div>
  );
};
