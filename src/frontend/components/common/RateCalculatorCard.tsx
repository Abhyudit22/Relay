import React, { useState, useEffect } from 'react';
import {
  Zone,
  ZoneArea,
  RateCard,
  CodSurchargeConfig,
  OrderType,
  PaymentType,
} from '../../../types';
import {
  calculateOrderCharges,
  RateCalculationResult,
} from '../../../backend/services/rateEngine';
import { Package3DVisualizer } from './Package3DVisualizer';
import {
  Box,
  MapPin,
  ShieldCheck,
  Zap,
  Clock,
} from 'lucide-react';

interface RateCalculatorCardProps {
  zones: Zone[];
  zoneAreas: ZoneArea[];
  rateCards: RateCard[];
  codConfigs: CodSurchargeConfig[];
  onApplyRates?: (calcResult: RateCalculationResult) => void;
  standalone?: boolean;
}

export const RateCalculatorCard: React.FC<RateCalculatorCardProps> = ({
  zones,
  zoneAreas,
  rateCards,
  codConfigs,
  onApplyRates,
  standalone = true,
}) => {
  const [lengthCm, setLengthCm] = useState<number>(30);
  const [breadthCm, setBreadthCm] = useState<number>(20);
  const [heightCm, setHeightCm] = useState<number>(15);
  const [actualWeightKg, setActualWeightKg] = useState<number>(2.5);
  const [pickupPincode, setPickupPincode] = useState<string>('560001');
  const [dropPincode, setDropPincode] = useState<string>('560034');
  const [orderType, setOrderType] = useState<OrderType>('B2C');
  const [paymentType, setPaymentType] = useState<PaymentType>('COD');
  const [codValue, setCodValue] = useState<number>(45.0);

  const [calcResult, setCalcResult] = useState<RateCalculationResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = calculateOrderCharges({
        pickupPincode,
        dropPincode,
        lengthCm,
        breadthCm,
        heightCm,
        actualWeightKg,
        orderType,
        paymentType,
        codDeclaredValue: codValue,
        zones,
        zoneAreas,
        rateCards,
        codConfigs,
      });
      setCalcResult(result);
      if (onApplyRates) {
        onApplyRates(result);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [
    lengthCm,
    breadthCm,
    heightCm,
    actualWeightKg,
    pickupPincode,
    dropPincode,
    orderType,
    paymentType,
    codValue,
    zones,
    zoneAreas,
    rateCards,
    codConfigs,
  ]);

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden ${
        standalone ? 'max-w-5xl mx-auto' : 'w-full'
      }`}
    >
      {/* Header */}
      <div className="bg-zinc-950 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600/20 rounded-xl border border-red-600/30 text-red-500">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              Logistics Rate Engine
              <span className="text-[10px] uppercase bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800/60 font-bold">
                IATA (L×B×H)/5000
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Deterministic pricing engine with auto zone detection & volumetric weight verification
            </p>
          </div>
        </div>

        {/* Live sync pill */}
        <div className="flex items-center gap-1.5 bg-green-950 border border-green-800/50 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Verified Rates
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Section (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Order & Payment Segment Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Shipment Category
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setOrderType('B2C')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    orderType === 'B2C'
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  B2C Retail
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('B2B')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    orderType === 'B2B'
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  B2B Bulk
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Payment Type
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setPaymentType('PREPAID')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    paymentType === 'PREPAID'
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  Prepaid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('COD')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    paymentType === 'COD'
                      ? 'bg-red-600 text-white shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  COD
                </button>
              </div>
            </div>
          </div>

          {/* Postal Route / Pincodes */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-red-600" />
                Origin & Destination Pincodes
              </span>
              {calcResult && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    calcResult.charges.zoneRelation === 'INTRA'
                      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border border-green-300 dark:border-green-800'
                      : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  {calcResult.charges.zoneRelation === 'INTRA'
                    ? '● INTRA-ZONE (Fastest SLA)'
                    : '○ INTER-ZONE (Hub Corridor)'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                  Pickup Pincode (Origin)
                </label>
                <input
                  type="text"
                  value={pickupPincode}
                  onChange={(e) => setPickupPincode(e.target.value)}
                  placeholder="e.g. 560001"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {calcResult && (
                  <p className="text-[11px] text-zinc-500 mt-1 truncate">
                    Zone: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{calcResult.pickupZone.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                  Drop Pincode (Destination)
                </label>
                <input
                  type="text"
                  value={dropPincode}
                  onChange={(e) => setDropPincode(e.target.value)}
                  placeholder="e.g. 560034"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {calcResult && (
                  <p className="text-[11px] text-zinc-500 mt-1 truncate">
                    Zone: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{calcResult.dropZone.name}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dimensions & Weights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Box size={14} className="text-red-600" />
                Package Dimensions & Actual Weight
              </label>
              <span className="text-[11px] text-zinc-500">
                Formula: (L × B × H) ÷ 5000
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] text-zinc-500 block mb-1">Length (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 block mb-1">Breadth (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={breadthCm}
                  onChange={(e) => setBreadthCm(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(1, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 block mb-1">Actual (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={actualWeightKg}
                  onChange={(e) => setActualWeightKg(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-red-500 rounded-lg text-sm text-center focus:ring-2 focus:ring-red-500 focus:outline-none font-bold text-red-600 dark:text-red-400"
                />
              </div>
            </div>

            {/* If COD, show COD amount collector */}
            {paymentType === 'COD' && (
              <div className="pt-2">
                <label className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium block mb-1">
                  Cash on Delivery Amount to Collect (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={codValue}
                    onChange={(e) => setCodValue(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Interactive 3D Package Box Projection */}
          {calcResult && (
            <Package3DVisualizer
              lengthCm={lengthCm}
              breadthCm={breadthCm}
              heightCm={heightCm}
              actualWeightKg={calcResult.dimensions.actualWeightKg}
              volumetricWeightKg={calcResult.dimensions.volumetricWeightKg}
              billableWeightKg={calcResult.charges.billableWeightKg}
              weightBasis={calcResult.charges.weightBasis}
            />
          )}
        </div>

        {/* Right Output Section: Itemized Receipt & Pricing Summary (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-950 text-white rounded-2xl p-6 flex flex-col justify-between border border-zinc-800 shadow-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Rate Quotation
              </span>
              <span className="text-xs bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/50 font-bold">
                {orderType} · {calcResult?.charges.zoneRelation || 'INTRA'}
              </span>
            </div>

            {/* Estimated SLA */}
            <div className="my-4 p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-zinc-300 font-medium">
                <Clock size={15} className="text-red-400" />
                Guaranteed SLA Window
              </span>
              <span className="font-bold text-white">
                ~{calcResult?.estimatedDeliveryHours || 4} Hours
              </span>
            </div>

            {/* Itemized Lines */}
            <div className="space-y-3 text-xs text-zinc-300 pt-1">
              <div className="flex justify-between items-center">
                <span>
                  Base Freight ({calcResult?.rateCard?.baseWeightKg ?? 1}kg slab)
                </span>
                <span className="text-white font-bold">
                  ₹{(calcResult?.charges?.baseFreightCharge ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>
                  Extra Weight (
                  {Math.max(
                    0,
                    (calcResult?.charges?.billableWeightKg ?? 0) -
                      (calcResult?.rateCard?.baseWeightKg ?? 0)
                  ).toFixed(2)}
                  kg @ ₹{calcResult?.rateCard?.additionalPerKgRate ?? 0}/kg)
                </span>
                <span className="text-white font-bold">
                  ₹{(calcResult?.charges?.extraWeightCharge ?? 0).toFixed(2)}
                </span>
              </div>

              {paymentType === 'COD' && (
                <div className="flex justify-between items-center text-red-300">
                  <span>COD Collection Surcharge</span>
                  <span className="font-bold">
                    +₹{(calcResult?.charges?.codSurcharge ?? 0).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-zinc-400">
                <span>Handling & Protection Fee</span>
                <span className="text-zinc-300">
                  ₹{(calcResult?.charges?.handlingFee ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-6 mt-6 border-t border-zinc-800">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                  Total Calculated Rate
                </p>
                <p className="text-[10px] text-zinc-500">Includes all taxes & fuel surcharge</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black tracking-tight text-white">
                  ₹{(calcResult?.charges?.totalCharge ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-300 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
              <ShieldCheck size={16} className="text-green-400 shrink-0" />
              <span>Exact price guaranteed upon instant order submission.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
