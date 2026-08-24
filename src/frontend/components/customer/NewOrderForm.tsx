import React, { useState } from 'react';
import {
  Zone,
  ZoneArea,
  RateCard,
  CodSurchargeConfig,
  OrderType,
  PaymentType,
  Order,
} from '../../../types';
import {
  calculateOrderCharges,
  RateCalculationResult,
} from '../../../backend/services/rateEngine';
import {
  Box,
  MapPin,
  User,
  Phone,
  Scale,
  ShieldCheck,
  CheckCircle,
  Truck,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

interface NewOrderFormProps {
  zones: Zone[];
  zoneAreas: ZoneArea[];
  rateCards: RateCard[];
  codConfigs: CodSurchargeConfig[];
  currentUserId?: string;
  currentUserName?: string;
  currentUserEmail?: string;
  isAdminCreatingOnBehalf?: boolean;
  onOrderCreated: (newOrder: Order) => void;
  onCancel?: () => void;
}

export const NewOrderForm: React.FC<NewOrderFormProps> = ({
  zones,
  zoneAreas,
  rateCards,
  codConfigs,
  currentUserId = 'cust-001',
  currentUserName = 'Priya Sharma',
  currentUserEmail = 'priya.sharma@example.in',
  isAdminCreatingOnBehalf = false,
  onOrderCreated,
  onCancel,
}) => {
  // Form State
  const [orderType, setOrderType] = useState<OrderType>('B2C');
  const [paymentType, setPaymentType] = useState<PaymentType>('PREPAID');
  const [codAmount, setCodAmount] = useState<number>(0);

  // Customer / On Behalf details
  const [customerName, setCustomerName] = useState<string>(
    isAdminCreatingOnBehalf ? '' : currentUserName
  );
  const [customerEmail, setCustomerEmail] = useState<string>(
    isAdminCreatingOnBehalf ? '' : currentUserEmail
  );
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Sender Details
  const [senderName, setSenderName] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [senderAddress, setSenderAddress] = useState<string>('');
  const [senderPincode, setSenderPincode] = useState<string>('560001');

  // Recipient Details
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [recipientPincode, setRecipientPincode] = useState<string>('560034');

  // Package Details
  const [itemDescription, setItemDescription] = useState<string>('');
  const [lengthCm, setLengthCm] = useState<number>(20);
  const [breadthCm, setBreadthCm] = useState<number>(15);
  const [heightCm, setHeightCm] = useState<number>(10);
  const [actualWeightKg, setActualWeightKg] = useState<number>(1.0);

  const fillSampleInputs = () => {
    setSenderName('Siddhivinayak Commercial Hub');
    setSenderPhone('+91 98450 99881');
    setSenderAddress('42 Commercial Street, Suite 300');
    setSenderPincode('560001');
    setRecipientName('Rohan Mehta');
    setRecipientPhone('+91 98450 44332');
    setRecipientAddress('108 Lakeview Apartments, Koramangala 4th Block');
    setRecipientPincode('560034');
    setItemDescription('Electronic Components & Accessories');
    setLengthCm(25);
    setBreadthCm(20);
    setHeightCm(12);
    setActualWeightKg(1.8);
  };

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Run dynamic rate calculation
  const calcResult: RateCalculationResult = calculateOrderCharges({
    pickupPincode: senderPincode,
    dropPincode: recipientPincode,
    lengthCm,
    breadthCm,
    heightCm,
    actualWeightKg,
    orderType,
    paymentType,
    codDeclaredValue: paymentType === 'COD' ? codAmount : 0,
    zones,
    zoneAreas,
    rateCards,
    codConfigs,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Recompute strictly server-side on creation to guarantee mathematical integrity
      const finalVerifiedCalc = calculateOrderCharges({
        pickupPincode: senderPincode,
        dropPincode: recipientPincode,
        lengthCm,
        breadthCm,
        heightCm,
        actualWeightKg,
        orderType,
        paymentType,
        codDeclaredValue: paymentType === 'COD' ? codAmount : 0,
        zones,
        zoneAreas,
        rateCards,
        codConfigs,
      });

      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const trackingNumber = `TRK-${randomNum}`;
      const now = new Date().toISOString();

      const createdOrder: Order = {
        id: `ord-${randomNum}`,
        trackingNumber,
        orderType,
        paymentType,
        codAmountDue: paymentType === 'COD' ? codAmount : 0,
        status: 'PENDING',
        customerId: currentUserId,
        customerName,
        customerPhone,
        customerEmail,
        senderName,
        senderPhone,
        senderAddress,
        senderPincode,
        pickupZoneId: finalVerifiedCalc.pickupZone.id,
        recipientName,
        recipientPhone,
        recipientAddress,
        recipientPincode,
        dropZoneId: finalVerifiedCalc.dropZone.id,
        itemDescription,
        dimensions: finalVerifiedCalc.dimensions,
        charges: finalVerifiedCalc.charges,
        createdAt: now,
        updatedAt: now,
        estimatedDeliveryDate: new Date(Date.now() + finalVerifiedCalc.estimatedDeliveryHours * 3600 * 1000).toISOString(),
        history: [
          {
            id: `hist-${Date.now()}`,
            orderId: `ord-${randomNum}`,
            status: 'PENDING',
            timestamp: now,
            actorId: currentUserId,
            actorName: isAdminCreatingOnBehalf ? `Admin on behalf of ${customerName}` : customerName,
            actorRole: isAdminCreatingOnBehalf ? 'admin' : 'customer',
            remarks: `Order booked with live rate engine verification (${finalVerifiedCalc.charges.zoneRelation} Corridor). Charge: ₹${finalVerifiedCalc.charges.totalCharge.toFixed(2)}`,
            location: `${finalVerifiedCalc.pickupZone.name} (${senderPincode})`,
          },
        ],
      };

      onOrderCreated(createdOrder);
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isAdminCreatingOnBehalf && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-purple-600 shrink-0" />
            <span>
              <strong>Admin Dispatch Mode:</strong> Creating new billable consignment on customer's behalf.
            </span>
          </div>
          <span className="font-mono bg-purple-100 px-2 py-0.5 rounded text-[11px] font-bold">
            Role: Admin
          </span>
        </div>
      )}

      {/* Main Grid: Form Left, Sticky Live Quotation Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Classification & Mode */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" />
                1. Logistics Service & Payment Model
              </h4>
              <button
                type="button"
                onClick={fillSampleInputs}
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Sparkles size={12} />
                <span>Fill Sample Input</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Service Segment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('B2C')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      orderType === 'B2C'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-100'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    B2C Retail
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('B2B')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      orderType === 'B2B'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-100'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    B2B Commercial
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('PREPAID')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      paymentType === 'PREPAID'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-100'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Prepaid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('COD')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      paymentType === 'COD'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-100'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    COD (Cash)
                  </button>
                </div>
              </div>
            </div>

            {paymentType === 'COD' && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <label className="font-semibold text-amber-900 block">
                    Cash on Delivery Collectible (₹)
                  </label>
                  <p className="text-[11px] text-amber-700">Courier collects upon handover</p>
                </div>
                <div className="relative w-32">
                  <span className="absolute left-2.5 top-2 text-amber-600 font-mono">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={codAmount}
                    onChange={(e) => setCodAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-6 pr-2 py-1.5 bg-white border border-amber-300 rounded font-mono text-sm font-bold text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sender / Pickup Card */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-600 dark:text-blue-400" />
                2. Pickup Origin Details
              </h4>
              <span className="text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {calcResult.pickupZone.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Sender / Warehouse Name</label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Sender Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Pickup Street Address</label>
                <input
                  type="text"
                  required
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Origin Pincode</label>
                <input
                  type="text"
                  required
                  value={senderPincode}
                  onChange={(e) => setSenderPincode(e.target.value)}
                  placeholder="560001"
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Recipient / Delivery Drop Card */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
                3. Recipient Drop-Off Details
              </h4>
              <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {calcResult.dropZone.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Recipient Full Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Recipient Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Destination Address</label>
                <input
                  type="text"
                  required
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Drop Pincode</label>
                <input
                  type="text"
                  required
                  value={recipientPincode}
                  onChange={(e) => setRecipientPincode(e.target.value)}
                  placeholder="560034"
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Package Dimensions Card */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Box size={14} className="text-amber-500" />
              4. Package Dimensions & Weight
            </h4>

            <div>
              <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Item Title / Description</label>
              <input
                type="text"
                required
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Length (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-mono text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Breadth (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={breadthCm}
                  onChange={(e) => setBreadthCm(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-mono text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg text-xs font-mono text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 block mb-1">Actual (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={actualWeightKg}
                  onChange={(e) => setActualWeightKg(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-2 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 rounded-lg text-xs font-mono font-bold text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Live Sticky Rate Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 bg-zinc-950 text-white rounded-3xl p-5 sm:p-6 border border-zinc-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Live Pricing Breakdown
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/30">
                ● {calcResult.charges.zoneRelation} ZONE
              </span>
            </div>

            {/* Weight Metric Comparison */}
            <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Actual: {calcResult.dimensions.actualWeightKg} kg</span>
                <span>Volumetric: {calcResult.dimensions.volumetricWeightKg} kg</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Scale size={14} className="text-amber-400" /> Billable Weight
                </span>
                <span className="font-mono text-white text-sm font-bold">
                  {calcResult.charges.billableWeightKg} kg{' '}
                  <span className="text-[10px] text-amber-400 font-normal">
                    ({calcResult.charges.weightBasis})
                  </span>
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span>Base Rate ({calcResult.rateCard?.baseWeightKg ?? 1}kg slab)</span>
                <span className="font-mono text-white">
                  ₹{(calcResult.charges?.baseFreightCharge ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Extra Weight Charge</span>
                <span className="font-mono text-white">
                  ₹{(calcResult.charges?.extraWeightCharge ?? 0).toFixed(2)}
                </span>
              </div>
              {paymentType === 'COD' && (
                <div className="flex justify-between text-amber-300">
                  <span>COD Handling Surcharge</span>
                  <span className="font-mono">+₹{(calcResult.charges?.codSurcharge ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Handling & Protection Fee</span>
                <span className="font-mono">₹{(calcResult.charges?.handlingFee ?? 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Total Charge */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs uppercase font-mono text-zinc-400">Total Payable</span>
                <span className="text-3xl font-black font-mono text-amber-400">
                  ₹{(calcResult.charges?.totalCharge ?? 0).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Generating Consignment...</span>
                ) : (
                  <>
                    <Truck size={16} />
                    <span>Confirm & Book Shipment</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full mt-2 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel & Go Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
