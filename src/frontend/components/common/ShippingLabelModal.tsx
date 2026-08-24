import React from 'react';
import { Order } from '../../../types';
import {
  Printer,
  X,
  Package,
  QrCode,
  Truck,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle,
} from 'lucide-react';

interface ShippingLabelModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate pseudo-barcode bars from tracking string
  const barcodeBars = order.trackingNumber.split('').map((char: string, idx: number) => {
    const code = char.charCodeAt(0);
    const width = (code % 3) + 1.5;
    const isDark = (code + idx) % 2 === 0 || idx % 3 === 0;
    return { width, isDark };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Top Control Action Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer size={16} className="text-blue-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Standard 4×6 Logistics Thermal Airway Bill
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer size={13} />
              Print Label
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 4x6 Shipping Label Container (High-Contrast Thermal Format) */}
        <div className="p-6 bg-slate-100 flex justify-center">
          <div
            id="printable-shipping-label"
            className="w-full max-w-md bg-white border-2 border-slate-900 rounded-lg p-5 font-mono text-slate-950 shadow-md space-y-4 select-all"
          >
            {/* Header: Carrier Logo & Sort Routing Block */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <h2 className="text-xl font-extrabold tracking-tighter uppercase font-sans">
                  LASTMILE <span className="text-blue-700">EXPRESS</span>
                </h2>
                <p className="text-[10px] text-slate-600 font-sans">Autonomous Routing Network</p>
                <div className="mt-1 inline-block bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 rounded-xs">
                  PRIORITY {order.orderType}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase text-slate-500 block">Hub Sort Code</span>
                <span className="text-2xl font-black font-mono tracking-tight">
                  {(order.charges?.dropZoneName || 'HUB').substring(0, 3).toUpperCase()}-
                  {(order.recipientPincode || (order as any).deliveryPincode || '000').slice(-3)}
                </span>
                <span className="text-[10px] block font-bold text-slate-700">
                  {order.charges?.zoneRelation || 'INTRA'} CORRIDOR
                </span>
              </div>
            </div>

            {/* Simulated Vector Barcode */}
            <div className="text-center py-2 border-b-2 border-slate-900">
              <div className="flex items-center justify-center h-14 gap-[1.5px] px-2 bg-slate-50 border border-slate-300 py-1 mb-1">
                {barcodeBars.map((bar, i) => (
                  <div
                    key={i}
                    className="h-full bg-slate-950"
                    style={{
                      width: `${bar.width * 2}px`,
                      opacity: bar.isDark ? 1 : 0.05,
                    }}
                  />
                ))}
                {/* Fixed guard patterns */}
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={`tail-${i}`}
                    className="h-full bg-slate-950"
                    style={{
                      width: `${(i % 3) + 1.2}px`,
                      opacity: i % 2 === 0 ? 1 : 0,
                    }}
                  />
                ))}
              </div>
              <p className="text-base font-black font-mono tracking-widest text-slate-950">
                *{order.trackingNumber}*
              </p>
            </div>

            {/* Deliver To (Large Bold Recipient) */}
            <div className="border-b-2 border-slate-900 pb-3 space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">
                DELIVER TO (RECIPIENT):
              </span>
              <p className="text-base font-extrabold text-slate-950">{order.recipientName}</p>
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {order.recipientAddress}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-lg font-black font-mono">
                  PIN: {order.recipientPincode}
                </span>
                <span className="text-xs text-slate-700 font-bold font-sans">
                  TEL: {order.recipientPhone}
                </span>
              </div>
            </div>

            {/* Shipper Origin Address */}
            <div className="border-b-2 border-slate-900 pb-3 space-y-0.5 text-xs text-slate-700">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">
                SHIP FROM (SENDER):
              </span>
              <p className="font-bold text-slate-900">{order.senderName}</p>
              <p className="text-[11px] leading-tight text-slate-600">{order.senderAddress}</p>
              <p className="text-[11px]">
                PIN: <strong>{order.senderPincode}</strong> · TEL: {order.senderPhone}
              </p>
            </div>

            {/* Consignment Dimensions & COD Cash Box */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-900 p-2 space-y-0.5">
                <span className="text-[9px] uppercase text-slate-500 block font-bold">
                  WEIGHT / DIMS:
                </span>
                <p className="font-bold">
                  Billable: {order.dimensions?.billableWeightKg ?? order.dimensions?.actualWeightKg ?? 1} kg
                </p>
                <p className="text-[10px] text-slate-600">
                  {order.dimensions?.lengthCm ?? 0}×{order.dimensions?.breadthCm ?? 0}×{order.dimensions?.heightCm ?? 0} cm
                </p>
                <p className="text-[10px] text-slate-600 truncate">{order.itemDescription}</p>
              </div>

              <div
                className={`border-2 p-2 flex flex-col justify-between ${
                  order.paymentType === 'COD'
                    ? 'border-slate-900 bg-amber-50'
                    : 'border-slate-900 bg-slate-50'
                }`}
              >
                <span className="text-[9px] uppercase font-bold text-slate-700 block">
                  PAYMENT / COD:
                </span>
                {order.paymentType === 'COD' ? (
                  <div>
                    <span className="text-lg font-black text-slate-950 block">
                      ₹{((order.codAmountDue ?? (order as any).codAmount ?? 0) ?? 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 uppercase">
                      COLLECT CASH ON DROP
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-base font-black text-emerald-800 block">PREPAID</span>
                    <span className="text-[10px] text-slate-500">DO NOT COLLECT CASH</span>
                  </div>
                )}
              </div>
            </div>

            {/* Routing Footer & Security Timestamp */}
            <div className="flex items-center justify-between pt-1 text-[9px] text-slate-500 font-sans">
              <span>Verified IATA Volumetric Rate Engine</span>
              <span>Generated: {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
