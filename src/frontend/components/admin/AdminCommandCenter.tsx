import React, { useState } from 'react';
import {
  Order,
  OrderStatus,
  Agent,
  Zone,
  ZoneArea,
  RateCard,
  CodSurchargeConfig,
  OrderType,
} from '../../../types';
import { StatusBadge } from '../common/StatusBadge';
import { NewOrderForm } from '../customer/NewOrderForm';
import {
  LayoutDashboard,
  Truck,
  MapPin,
  DollarSign,
  Users,
  Plus,
  Zap,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Layers,
  Settings2,
  Calendar,
  Phone,
  Power,
  Edit2,
  Trash2,
  Sliders,
  Check,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminCommandCenterProps {
  orders: Order[];
  agents: Agent[];
  zones: Zone[];
  zoneAreas: ZoneArea[];
  rateCards: RateCard[];
  codConfigs: CodSurchargeConfig[];
  onAutoAssignAll: () => void;
  onManualAssignAgent: (orderId: string, agentId: string) => void;
  onUpdateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    options?: { remarks?: string; forceOverride?: boolean }
  ) => void;
  onOrderCreated: (newOrder: Order) => void;
  onUpdateRateCards: (updated: RateCard[]) => void;
  onUpdateCodConfigs: (updated: CodSurchargeConfig[]) => void;
  onToggleAgentStatus: (agentId: string, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => void;
  onSelectOrderToTrack: (order: Order) => void;
}

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  orders,
  agents,
  zones,
  zoneAreas,
  rateCards,
  codConfigs,
  onAutoAssignAll,
  onManualAssignAgent,
  onUpdateOrderStatus,
  onOrderCreated,
  onUpdateRateCards,
  onUpdateCodConfigs,
  onToggleAgentStatus,
  onSelectOrderToTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'fleet' | 'zones_rates' | 'create_on_behalf'>('dispatch');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');

  // Edit Rate Cards state
  const [editableRateCards, setEditableRateCards] = useState<RateCard[]>(rateCards);
  const [editableCodConfigs, setEditableCodConfigs] = useState<CodSurchargeConfig[]>(codConfigs);
  const [ratesSaved, setRatesSaved] = useState<boolean>(false);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.assignedAgentName && o.assignedAgentName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesZone =
      zoneFilter === 'ALL' || o.pickupZoneId === zoneFilter || o.dropZoneId === zoneFilter;

    return matchesSearch && matchesStatus && matchesZone;
  });

  const unassignedOrders = orders.filter(
    (o) => !o.assignedAgentId && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  const handleSaveRates = () => {
    onUpdateRateCards(editableRateCards);
    onUpdateCodConfigs(editableCodConfigs);
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 2500);
  };

  const handleRateChange = (id: string, field: keyof RateCard, val: number) => {
    setEditableRateCards((prev) =>
      prev.map((rc) => (rc.id === id ? { ...rc, [field]: Number(val) } : rc))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Operations Header */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30 text-purple-400">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Operations Command HQ
                </h1>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-400/30 uppercase">
                  Phase 13 · Admin Control
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Intelligent routing, live fleet load balancing, dynamic rate cards & operational overrides
              </p>
            </div>
          </div>

          {/* Unassigned Quick Auto-Assign CTA */}
          <div className="flex items-center gap-3">
            {unassignedOrders.length > 0 && (
              <button
                type="button"
                onClick={onAutoAssignAll}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-98"
              >
                <Zap size={15} className="fill-zinc-950" />
                <span>Auto-Route Unassigned ({unassignedOrders.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Operations KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-zinc-800 text-xs font-mono">
          <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block">TOTAL CONSIGNMENTS</span>
            <span className="text-xl font-bold text-white mt-0.5">{orders.length}</span>
          </div>
          <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block">ACTIVE FLEET RIDERS</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5">
              {agents.filter((a) => a.status === 'AVAILABLE' || a.status === 'BUSY').length} / {agents.length}
            </span>
          </div>
          <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block">UNASSIGNED QUEUE</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5">{unassignedOrders.length}</span>
          </div>
          <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 block">ZONE COVERAGE</span>
            <span className="text-xl font-bold text-purple-400 mt-0.5">{zones.length} Master Hubs</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-stone-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('dispatch')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'dispatch'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard size={15} className="text-amber-500" />
          <span>Dispatch Grid</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fleet')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'fleet'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Truck size={15} className="text-emerald-500" />
          <span>Fleet Roster ({agents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('zones_rates')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'zones_rates'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <DollarSign size={15} className="text-orange-500" />
          <span>Rates & Surcharges</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create_on_behalf')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'create_on_behalf'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-black'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Plus size={15} className="text-purple-500" />
          <span>Manual Booking</span>
        </button>
      </div>

      {/* Tab 1: Dispatch Grid */}
      {activeTab === 'dispatch' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracking ID, recipient, courier, or shipper..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed</option>
                <option value="RESCHEDULED">Rescheduled</option>
              </select>

              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none"
              >
                <option value="ALL">All Hub Zones</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 uppercase font-mono text-[10px] border-y border-stone-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Customer & Route</th>
                  <th className="py-3 px-4">Weight / Charge</th>
                  <th className="py-3 px-4">Assigned Courier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Dispatch Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400">
                      No shipments found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => onSelectOrderToTrack(ord)}
                          className="hover:text-amber-500"
                        >
                          {ord.trackingNumber}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        <div className="font-semibold">{ord.recipientName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {ord.pickupZoneId} → {ord.dropZoneId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        <div className="font-mono font-bold">₹{(ord.charges?.totalCharge || 0).toFixed(2)}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{ord.dimensions.actualWeightKg} kg · {ord.paymentType}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {ord.assignedAgentName ? (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-800 dark:text-zinc-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-semibold">{ord.assignedAgentName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  onManualAssignAgent(ord.id, e.target.value);
                                }
                              }}
                              defaultValue=""
                              className="px-2 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg text-[11px] font-bold text-amber-800 dark:text-amber-300 focus:outline-none"
                            >
                              <option value="" disabled>
                                + Assign Courier
                              </option>
                              {agents.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name} ({a.currentActiveDeliveries}/{a.maxCapacity})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectOrderToTrack(ord)}
                          className="px-2.5 py-1 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Audit
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

      {/* Tab 2: Fleet Roster */}
      {activeTab === 'fleet' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                Courier Fleet Active Roster
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Live delivery load, vehicle allocations, performance ratings and availability toggles
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-400">
              {agents.length} Total Couriers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white">{agent.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">{agent.id} · {agent.vehicleType}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      agent.status === 'AVAILABLE'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                        : agent.status === 'BUSY'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                        : 'bg-zinc-500/20 text-zinc-500'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-[11px]">
                    <span>Current Active Load:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {agent.currentActiveDeliveries} / {agent.maxCapacity} parcels
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (agent.currentActiveDeliveries / agent.maxCapacity) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-zinc-700 text-[11px]">
                  <span className="text-zinc-500 font-mono">★ {agent.rating} ({agent.completedCount} drops)</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onToggleAgentStatus(
                          agent.id,
                          agent.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE'
                        )
                      }
                      className="px-2 py-1 bg-white dark:bg-zinc-700 hover:bg-stone-200 dark:hover:bg-zinc-600 rounded-lg text-zinc-800 dark:text-zinc-200 font-semibold transition-colors"
                    >
                      Toggle Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Zones & Dynamic Volumetric Rate Cards */}
      {activeTab === 'zones_rates' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                Volumetric Rate Cards & COD Surcharge Engine
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configure base pricing, incremental weight tiers, and cash-on-delivery handling fees
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveRates}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              {ratesSaved ? <Check size={14} /> : <Sliders size={14} />}
              <span>{ratesSaved ? 'Saved Successfully!' : 'Save Rate Matrix'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rate Cards Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase font-mono text-zinc-700 dark:text-zinc-300">
                Active Shipping Rate Cards
              </h3>
              <div className="space-y-3">
                {editableRateCards.map((rc) => (
                  <div
                    key={rc.id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-white font-mono">{rc.id}</span>
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-bold">
                        {rc.orderType} · {rc.zoneRelation}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-zinc-500 block">Base Price (₹)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={rc.baseRate}
                          onChange={(e) => handleRateChange(rc.id, 'baseRate', Number(e.target.value))}
                          className="w-full p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-stone-300 dark:border-zinc-700 font-mono font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 block">Base Wt (kg)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={rc.baseWeightKg}
                          onChange={(e) => handleRateChange(rc.id, 'baseWeightKg', Number(e.target.value))}
                          className="w-full p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-stone-300 dark:border-zinc-700 font-mono font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 block">Addl ₹/kg</label>
                        <input
                          type="number"
                          step="0.5"
                          value={rc.additionalPerKgRate}
                          onChange={(e) => handleRateChange(rc.id, 'additionalPerKgRate', Number(e.target.value))}
                          className="w-full p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-stone-300 dark:border-zinc-700 font-mono font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COD Surcharges Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase font-mono text-zinc-700 dark:text-zinc-300">
                COD Surcharge Rules
              </h3>
              <div className="space-y-3">
                {editableCodConfigs.map((cc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-white font-mono">{cc.orderType}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{cc.surchargeType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Surcharge Value</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                          {cc.surchargeType === 'PERCENTAGE' ? `${cc.surchargeValue}%` : `₹${cc.surchargeValue}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Min Surcharge (₹)</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{cc.minSurcharge}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Manual Booking on Behalf */}
      {activeTab === 'create_on_behalf' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="pb-4 border-b border-stone-100 dark:border-zinc-800">
            <h2 className="text-base font-black text-zinc-900 dark:text-white">
              Manual Consignment Override & Dispatch
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Admin authority booking directly into the live dispatch engine
            </p>
          </div>

          <NewOrderForm
            currentUser={{
              id: 'admin-master',
              name: 'Dispatch Admin Override',
              email: 'admin@relay.io',
              role: 'admin',
              phone: '+1 (555) 000-0000',
              address: 'Central Logistics Hub #1',
              pincode: '110001',
              joinedDate: '2024-01-01',
            }}
            zones={zones}
            zoneAreas={zoneAreas}
            rateCards={rateCards}
            codConfigs={codConfigs}
            onOrderCreated={(newOrd) => {
              onOrderCreated(newOrd);
              setActiveTab('dispatch');
            }}
          />
        </div>
      )}
    </div>
  );
};
