import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../../types';
import {
  Truck,
  Bike,
  MapPin,
  Navigation,
  Phone,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Key,
  Copy,
  Check,
  Compass,
  Zap,
  Clock,
  Radio,
  Share2,
} from 'lucide-react';

interface LiveTrackingMapProps {
  order: Order;
  compact?: boolean;
}

interface Coordinates {
  x: number;
  y: number;
  label: string;
}

// Approximate coordinate map for Bangalore logistics sectors
const HUB_COORDINATES: Record<string, Coordinates> = {
  '560001': { x: 480, y: 410, label: 'Central Hub (MG Road)' },
  '560002': { x: 440, y: 440, label: 'City Market Hub' },
  '560025': { x: 490, y: 430, label: 'Richmond Town Depot' },
  '560034': { x: 520, y: 540, label: 'Koramangala 4th Block' },
  '560038': { x: 620, y: 400, label: 'Indiranagar 100ft Hub' },
  '560048': { x: 740, y: 410, label: 'Whitefield ITPL Gateway' },
  '560058': { x: 260, y: 280, label: 'Peenya Industrial Hub' },
  '560064': { x: 470, y: 200, label: 'Yelahanka North Gateway' },
  '560100': { x: 610, y: 680, label: 'Electronic City Phase 1' },
};

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ order, compact = false }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapMode, setMapMode] = useState<'street' | 'night' | 'satellite'>('night');
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);
  const [livePulse, setLivePulse] = useState<number>(0);

  // Periodic pulse tick to simulate live telemetry ping
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePulse((prev) => (prev + 1) % 100);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Determine origin and destination coordinates based on pincode
  const pickupPincode = order.senderPincode || '560001';
  const dropPincode = order.recipientPincode || '560034';

  const originCoord: Coordinates =
    HUB_COORDINATES[pickupPincode] || { x: 450, y: 380, label: order.senderAddress || 'Origin Hub' };

  const destCoord: Coordinates =
    HUB_COORDINATES[dropPincode] || { x: 530, y: 530, label: order.recipientAddress || 'Destination' };

  // Calculate waypoint for realistic curved urban path
  const midX = (originCoord.x + destCoord.x) / 2 + (destCoord.y > originCoord.y ? 35 : -35);
  const midY = (originCoord.y + destCoord.y) / 2;

  // Determine courier progress ratio based on order status
  const getProgressRatio = (status: OrderStatus): number => {
    switch (status) {
      case 'PENDING':
        return 0.05;
      case 'PICKED_UP':
        return 0.22;
      case 'IN_TRANSIT':
        return 0.54;
      case 'OUT_FOR_DELIVERY':
        return 0.85;
      case 'DELIVERED':
        return 1.0;
      case 'FAILED':
        return 0.82;
      case 'RESCHEDULED':
        return 0.45;
      default:
        return 0.1;
    }
  };

  const progress = getProgressRatio(order.status);

  // Bezier curve point calculation: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
  const t = progress;
  const courierX = Math.round((1 - t) * (1 - t) * originCoord.x + 2 * (1 - t) * t * midX + t * t * destCoord.x);
  const courierY = Math.round((1 - t) * (1 - t) * originCoord.y + 2 * (1 - t) * t * midY + t * t * destCoord.y);

  // Calculate ETA and distance
  const remainingKm = Math.max(0.4, Number(((1 - progress) * 14.5).toFixed(1)));
  const remainingMins = Math.max(3, Math.round(remainingKm * 3.8));

  // Extract OTP from tracking number or default
  const otpCode = order.trackingNumber ? order.trackingNumber.replace(/\D/g, '').slice(-4) || '8294' : '8294';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/track/${order.trackingNumber}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otpCode);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border transition-all select-none ${
        isFullscreen
          ? 'fixed inset-4 z-50 shadow-2xl bg-zinc-950 border-zinc-700'
          : 'bg-zinc-950 border-zinc-800 shadow-md'
      } ${compact ? 'h-[360px]' : 'h-[460px] sm:h-[520px]'}`}
    >
      {/* SVG Map Canvas */}
      <svg
        viewBox="0 0 1000 800"
        className="w-full h-full object-cover transition-transform duration-300"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: `${courierX / 10}% ${courierY / 8}%`,
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          <linearGradient id="lakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
          </linearGradient>

          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={mapMode === 'night' ? '#27272a' : '#e4e4e7'}
              strokeWidth="0.5"
              strokeOpacity="0.35"
            />
          </pattern>

          {/* Pulsing beacon radar */}
          <radialGradient id="beaconGlow">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Map Background */}
        <rect
          width="1000"
          height="800"
          fill={mapMode === 'night' ? '#09090b' : mapMode === 'satellite' ? '#18181b' : '#f4f4f5'}
        />

        {/* Coordinate Grid */}
        <rect width="1000" height="800" fill="url(#gridPattern)" />

        {/* Urban Zones / Sector Polygons */}
        <g opacity={mapMode === 'night' ? '0.2' : '0.12'}>
          {/* Zone A Central */}
          <polygon points="400,320 580,320 580,480 400,480" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4,4" />
          {/* Zone B East */}
          <polygon points="580,320 840,320 840,540 580,540" fill="#8b5cf6" stroke="#a78bfa" strokeWidth="1" strokeDasharray="4,4" />
          {/* Zone C North */}
          <polygon points="340,120 620,120 620,320 340,320" fill="#10b981" stroke="#34d399" strokeWidth="1" strokeDasharray="4,4" />
          {/* Zone D South */}
          <polygon points="440,480 720,480 720,740 440,740" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,4" />
        </g>

        {/* Water Bodies & Natural Landmarks (Ulsoor Lake, Bellandur, Sankey Tank) */}
        <path
          d="M 520,380 C 530,370 550,375 555,390 C 560,405 545,415 530,410 C 515,405 510,390 520,380 Z"
          fill="url(#lakeGradient)"
        />
        <path
          d="M 680,490 C 700,480 740,495 750,520 C 760,545 730,560 700,550 C 670,540 660,500 680,490 Z"
          fill="url(#lakeGradient)"
        />
        <path
          d="M 420,240 C 435,230 450,235 455,250 C 460,265 445,275 430,270 C 415,265 410,250 420,240 Z"
          fill="url(#lakeGradient)"
        />

        {/* Major Arterial Highway Network */}
        <g stroke={mapMode === 'night' ? '#27272a' : '#d4d4d8'} strokeWidth="5" fill="none" strokeLinecap="round">
          {/* Outer Ring Road (ORR) Loop */}
          <path d="M 280,260 Q 480,180 720,280 T 780,560 Q 640,720 420,680 T 260,440 Z" />
          {/* MG Road - Old Madras Road corridor */}
          <path d="M 320,420 L 860,400" />
          {/* Hosur Road Express Corridor */}
          <path d="M 480,420 L 660,740" />
          {/* Bellary Road (Airport Expressway) */}
          <path d="M 480,420 L 470,80" />
          {/* West Chord Road */}
          <path d="M 260,240 L 400,620" />
        </g>

        {/* Secondary Street Matrix */}
        <g stroke={mapMode === 'night' ? '#18181b' : '#e4e4e7'} strokeWidth="2" fill="none">
          <line x1="200" y1="360" x2="800" y2="360" />
          <line x1="200" y1="480" x2="800" y2="480" />
          <line x1="200" y1="600" x2="800" y2="600" />
          <line x1="360" y1="150" x2="360" y2="720" />
          <line x1="560" y1="150" x2="560" y2="720" />
          <line x1="700" y1="150" x2="700" y2="720" />
        </g>

        {/* Traffic Density Overlay */}
        {showTraffic && (
          <g strokeLinecap="round" fill="none">
            {/* Smooth flow segments */}
            <path d="M 320,420 L 460,415" stroke="#10b981" strokeWidth="3" strokeOpacity="0.75" />
            <path d="M 470,80 L 475,260" stroke="#10b981" strokeWidth="3" strokeOpacity="0.75" />
            <path d="M 720,280 L 780,420" stroke="#10b981" strokeWidth="3" strokeOpacity="0.75" />
            {/* Moderate congestion */}
            <path d="M 480,420 L 540,490" stroke="#f59e0b" strokeWidth="3.5" strokeOpacity="0.8" />
            <path d="M 620,400 L 700,405" stroke="#f59e0b" strokeWidth="3.5" strokeOpacity="0.8" />
            {/* Silk Board junction / heavy spot */}
            <path d="M 540,490 L 590,560" stroke="#ef4444" strokeWidth="4" strokeOpacity="0.85" />
          </g>
        )}

        {/* Planned Route Path (Full Curved Polyline) */}
        <path
          d={`M ${originCoord.x},${originCoord.y} Q ${midX},${midY} ${destCoord.x},${destCoord.y}`}
          fill="none"
          stroke="#52525b"
          strokeWidth="3"
          strokeDasharray="6,6"
          strokeOpacity="0.6"
        />

        {/* Active Covered Path (Gradient Line up to Courier) */}
        {progress > 0 && (
          <path
            d={`M ${originCoord.x},${originCoord.y} Q ${midX * (0.5 + 0.5 * progress)},${
              midY * (0.5 + 0.5 * progress)
            } ${courierX},${courierY}`}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        )}

        {/* Origin / Merchant Warehouse Marker */}
        <g transform={`translate(${originCoord.x}, ${originCoord.y})`}>
          <circle r="14" fill="#18181b" stroke="#10b981" strokeWidth="2.5" />
          <circle r="4" fill="#10b981" />
          <text
            y="26"
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            PICKUP ({pickupPincode})
          </text>
        </g>

        {/* Destination / Recipient Address Marker */}
        <g transform={`translate(${destCoord.x}, ${destCoord.y})`}>
          <circle r="14" fill="#18181b" stroke="#ef4444" strokeWidth="2.5" />
          <circle r="4" fill="#ef4444" />
          <text
            y="26"
            textAnchor="middle"
            fill="#a1a1aa"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            DROP ({dropPincode})
          </text>
        </g>

        {/* Live Courier Rider Pin with Pulsing Radar Ring */}
        {order.status !== 'DELIVERED' && (
          <g transform={`translate(${courierX}, ${courierY})`}>
            {/* Pulsing Radar Ring */}
            <circle
              r={24 + (livePulse % 20)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              opacity={1 - (livePulse % 20) / 20}
            />
            {/* Courier Vehicle Node */}
            <circle r="16" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" className="shadow-lg" />
            <circle r="8" fill="#18181b" />

            {/* Courier Label Tag */}
            <g transform="translate(0, -24)">
              <rect
                x="-55"
                y="-18"
                width="110"
                height="20"
                rx="6"
                fill="#18181b"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text
                x="0"
                y="-4"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                {order.assignedAgentName ? order.assignedAgentName.split(' ')[0] : 'Courier'} · {remainingKm}km
              </text>
            </g>
          </g>
        )}

        {/* Delivered Final Badge */}
        {order.status === 'DELIVERED' && (
          <g transform={`translate(${destCoord.x}, ${destCoord.y})`}>
            <circle r="22" fill="#10b981" stroke="#ffffff" strokeWidth="3" />
            <text y="5" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="black">
              ✓
            </text>
          </g>
        )}
      </svg>

      {/* Top Floating Overlay Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
        {/* Live GPS Telemetry Status Pill */}
        <div className="pointer-events-auto bg-zinc-900/90 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-zinc-100 font-mono">
            {order.status === 'DELIVERED'
              ? 'DELIVERED AT DOOR'
              : order.status === 'OUT_FOR_DELIVERY'
              ? 'LIVE ROUTE GPS'
              : 'SORTING TRANSIT'}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
            · {remainingKm} km away ({remainingMins} min ETA)
          </span>
        </div>

        {/* Map Layer Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-1 rounded-2xl shadow-lg">
          <button
            type="button"
            onClick={() => setShowTraffic(!showTraffic)}
            title="Toggle Traffic Density"
            className={`p-1.5 rounded-xl text-xs transition-colors ${
              showTraffic
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio size={14} />
          </button>

          <button
            type="button"
            onClick={() =>
              setMapMode((prev) => (prev === 'night' ? 'street' : prev === 'street' ? 'satellite' : 'night'))
            }
            title="Switch Map Theme"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <Layers size={14} />
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0))}
            title="Zoom In"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <ZoomIn size={14} />
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.8))}
            title="Zoom Out"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <ZoomOut size={14} />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Courier & OTP HUD Card */}
      <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10">
        <div className="pointer-events-auto bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-white">
          {/* Driver Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-zinc-950 font-black text-sm shrink-0 shadow-md">
              <Bike size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-zinc-100">
                  {order.assignedAgentName || 'Assigned Courier Rider'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-mono">
                  4.9 ★
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span>{order.itemDescription}</span>
                <span>·</span>
                <span className="font-mono text-zinc-300">{order.trackingNumber}</span>
              </p>
            </div>
          </div>

          {/* Action Hub: OTP Handshake & Calling */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Delivery Secure Handshake OTP */}
            {order.status !== 'DELIVERED' && (
              <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Key size={13} className="text-amber-400" />
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-mono">
                    Doorstep OTP
                  </span>
                  <span className="text-xs font-mono font-black text-amber-300">{otpCode}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  title="Copy Doorstep OTP"
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedOtp ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            )}

            {/* Direct Call Button */}
            {order.assignedAgentPhone && (
              <a
                href={`tel:${order.assignedAgentPhone}`}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Phone size={13} />
                <span className="hidden sm:inline">Call Rider</span>
              </a>
            )}

            {/* Share Live Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Share Live Tracking Link"
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
