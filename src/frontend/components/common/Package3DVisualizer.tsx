import React from 'react';
import { Box, Scale, Layers } from 'lucide-react';

interface Package3DVisualizerProps {
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  actualWeightKg: number;
  volumetricWeightKg: number;
  billableWeightKg: number;
  weightBasis: 'ACTUAL' | 'VOLUMETRIC';
}

export const Package3DVisualizer: React.FC<Package3DVisualizerProps> = ({
  lengthCm,
  breadthCm,
  heightCm,
  actualWeightKg,
  volumetricWeightKg,
  billableWeightKg,
  weightBasis,
}) => {
  // Normalize visual dimensions for SVG isometric projection
  const maxDim = Math.max(lengthCm, breadthCm, heightCm, 30);
  const scale = 110 / maxDim;

  const w = Math.max(25, Math.min(130, lengthCm * scale));
  const d = Math.max(20, Math.min(100, breadthCm * scale));
  const h = Math.max(20, Math.min(100, heightCm * scale));

  // Isometric projection constants
  const isoAngle = Math.PI / 6; // 30 degrees
  const cos = Math.cos(isoAngle);
  const sin = Math.sin(isoAngle);

  // Center coordinate
  const cx = 130;
  const cy = 135;

  // Isometric vertices
  // Front Bottom
  const p0 = { x: cx, y: cy };
  // Right Bottom
  const p1 = { x: cx + w * cos, y: cy - w * sin };
  // Back Bottom
  const p2 = { x: cx + (w - d) * cos, y: cy - (w + d) * sin };
  // Left Bottom
  const p3 = { x: cx - d * cos, y: cy - d * sin };

  // Top vertices (shifted up by h)
  const p4 = { x: p0.x, y: p0.y - h };
  const p5 = { x: p1.x, y: p1.y - h };
  const p6 = { x: p2.x, y: p2.y - h };
  const p7 = { x: p3.x, y: p3.y - h };

  return (
    <div className="bg-zinc-900 text-white rounded-xl p-4 border border-zinc-800 relative overflow-hidden flex flex-col justify-between">
      {/* Background grid accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-500/20 text-red-400 rounded-md border border-red-500/30">
            <Box size={14} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
              Volumetric Box Engine
            </span>
            <span className="text-xs font-bold text-white">
              {lengthCm || 0} × {breadthCm || 0} × {heightCm || 0} cm
            </span>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
              weightBasis === 'VOLUMETRIC'
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {weightBasis === 'VOLUMETRIC' ? 'Volumetric Billed' : 'Scale Wt. Billed'}
          </span>
        </div>
      </div>

      {/* Isometric 3D SVG Renderer */}
      <div className="flex items-center justify-center py-2 relative z-10">
        <svg viewBox="0 0 260 170" className="w-full max-w-[240px] h-[140px] drop-shadow-lg">
          <defs>
            <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="boxRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="boxLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
          </defs>

          {/* Isometric Ground Shadow */}
          <polygon
            points={`${p0.x},${p0.y + 8} ${p1.x},${p1.y + 8} ${p2.x},${p2.y + 8} ${p3.x},${p3.y + 8}`}
            fill="#09090b"
            opacity="0.8"
          />

          {/* Left Face */}
          <polygon
            points={`${p0.x},${p0.y} ${p3.x},${p3.y} ${p7.x},${p7.y} ${p4.x},${p4.y}`}
            fill="url(#boxLeft)"
            stroke="#fca5a5"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* Right Face */}
          <polygon
            points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p5.x},${p5.y} ${p4.x},${p4.y}`}
            fill="url(#boxRight)"
            stroke="#fecaca"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* Top Face */}
          <polygon
            points={`${p4.x},${p4.y} ${p5.x},${p5.y} ${p6.x},${p6.y} ${p7.x},${p7.y}`}
            fill="url(#boxTop)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />

          {/* Parcel Sealing Tape Lines on Top */}
          <line
            x1={(p4.x + p7.x) / 2}
            y1={(p4.y + p7.y) / 2}
            x2={(p5.x + p6.x) / 2}
            y2={(p5.y + p6.y) / 2}
            stroke="#10b981"
            strokeWidth="2.5"
            strokeOpacity="0.9"
          />

          {/* Dimension Dimension Overlay Annotations */}
          {/* Length (Right Side) */}
          <text
            x={(p0.x + p1.x) / 2 + 8}
            y={(p0.y + p1.y) / 2 + 12}
            fill="#fca5a5"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            L: {lengthCm || 0}cm
          </text>

          {/* Breadth (Left Side) */}
          <text
            x={(p0.x + p3.x) / 2 - 28}
            y={(p0.y + p3.y) / 2 + 12}
            fill="#fca5a5"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            B: {breadthCm || 0}cm
          </text>

          {/* Height (Vertical Front) */}
          <text
            x={p0.x - 22}
            y={(p0.y + p4.y) / 2}
            fill="#f4f4f5"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            H: {heightCm || 0}cm
          </text>
        </svg>
      </div>

      {/* Metric Breakdown comparison footer */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-[10px] font-mono z-10">
        <div className="bg-zinc-800/70 p-1.5 rounded text-center border border-zinc-700">
          <span className="text-zinc-400 block">Actual Scale</span>
          <span className="font-bold text-white text-xs">{(actualWeightKg ?? 0).toFixed(2)} kg</span>
        </div>

        <div className="bg-zinc-800/70 p-1.5 rounded text-center border border-zinc-700">
          <span className="text-zinc-400 block">IATA Divisor 5k</span>
          <span className="font-bold text-zinc-300 text-xs">
            {(volumetricWeightKg ?? 0).toFixed(2)} kg
          </span>
        </div>

        <div
          className={`p-1.5 rounded text-center border ${
            weightBasis === 'VOLUMETRIC'
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <span className="block opacity-80">Billable Weight</span>
          <span className="font-bold text-xs">{(billableWeightKg ?? 0).toFixed(2)} kg</span>
        </div>
      </div>
    </div>
  );
};
