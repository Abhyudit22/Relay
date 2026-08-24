import React from 'react';
import { Truck, Bike, Package, MapPin, Zap, Navigation, CheckCircle } from 'lucide-react';

export const DeliveryBackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-30 dark:opacity-25 transition-opacity">
      {/* Embedded CSS Keyframes for smooth continuous movement */}
      <style>{`
        @keyframes moveRightFast {
          0% { transform: translateX(-220px); }
          100% { transform: translateX(calc(100vw + 220px)); }
        }
        @keyframes moveRightSlow {
          0% { transform: translateX(-280px); }
          100% { transform: translateX(calc(100vw + 280px)); }
        }
        @keyframes moveLeftMedium {
          0% { transform: translateX(calc(100vw + 220px)); }
          100% { transform: translateX(-220px); }
        }
        @keyframes moveLeftSlow {
          0% { transform: translateX(calc(100vw + 300px)); }
          100% { transform: translateX(-300px); }
        }
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }

        .anim-move-right-fast {
          animation: moveRightFast 14s linear infinite;
        }
        .anim-move-right-slow {
          animation: moveRightSlow 25s linear infinite;
        }
        .anim-move-left-medium {
          animation: moveLeftMedium 18s linear infinite;
        }
        .anim-move-left-slow {
          animation: moveLeftSlow 30s linear infinite;
        }
        .anim-float {
          animation: floatGentle 5s ease-in-out infinite;
        }
        .anim-pulse {
          animation: pulseGlow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Decorative Road / Lane Lines in Background */}
      <div className="absolute top-[15%] left-0 right-0 border-b border-dashed border-red-400/30 dark:border-red-500/20" />
      <div className="absolute top-[35%] left-0 right-0 border-b border-dashed border-emerald-400/30 dark:border-emerald-500/20" />
      <div className="absolute top-[60%] left-0 right-0 border-b border-dashed border-blue-400/30 dark:border-blue-500/20" />
      <div className="absolute top-[82%] left-0 right-0 border-b border-dashed border-amber-400/30 dark:border-amber-500/20" />

      {/* Background GPS Nodes / Hub Beacons */}
      <div className="absolute top-[10%] left-[6%] flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-red-300/40 dark:border-red-800/40 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 anim-pulse">
        <MapPin size={14} className="text-red-500 shrink-0" />
        <span className="font-bold">Koramangala Hub</span>
      </div>
      <div className="absolute top-[30%] right-[8%] flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-emerald-300/40 dark:border-emerald-800/40 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 anim-pulse" style={{ animationDelay: '1.2s' }}>
        <MapPin size={14} className="text-emerald-500 shrink-0" />
        <span className="font-bold">Indiranagar Hub</span>
      </div>
      <div className="absolute top-[55%] left-[18%] flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-blue-300/40 dark:border-blue-800/40 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 anim-pulse" style={{ animationDelay: '2.5s' }}>
        <MapPin size={14} className="text-blue-500 shrink-0" />
        <span className="font-bold">Whitefield Hub</span>
      </div>

      {/* 🚚 Lane 1 (Top Road - 12%): Heavy Delivery Truck heading Right */}
      <div
        className="absolute top-[12%] left-0 anim-move-right-slow flex items-center gap-2"
        style={{ animationDelay: '0s' }}
      >
        <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-2xl shadow-md border border-red-200 dark:border-red-900/50 backdrop-blur-md">
          <div className="p-1.5 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400">
            <Truck size={20} className="shrink-0" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              RELAY Express Cargo
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </span>
            <span className="text-[9px] font-mono font-semibold text-red-600 dark:text-red-400">In Transit · Zone A → B</span>
          </div>
        </div>
      </div>

      {/* 🏍️ Lane 1 (Top Road - 18%): EV Scooter heading Left */}
      <div
        className="absolute top-[18%] left-0 anim-move-left-medium flex items-center gap-2"
        style={{ animationDelay: '4s' }}
      >
        <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-2xl shadow-md border border-emerald-200 dark:border-emerald-900/50 backdrop-blur-md">
          <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
            <Bike size={18} className="shrink-0" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              EV Scooter #42
              <Zap size={11} className="text-emerald-500" />
            </span>
            <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Rapid Dispatch</span>
          </div>
        </div>
      </div>

      {/* 📦 Lane 2 (Middle Road - 32%): Quick-Commerce Delivery Bike heading Right */}
      <div
        className="absolute top-[32%] left-0 anim-move-right-fast flex items-center gap-2"
        style={{ animationDelay: '1.5s' }}
      >
        <div className="flex items-center gap-2.5 bg-white/85 dark:bg-zinc-900/85 px-3.5 py-1.5 rounded-2xl shadow-lg border border-amber-300 dark:border-amber-800/60 backdrop-blur-md">
          <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
            <Bike size={20} className="shrink-0 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Instant Delivery Bike
              <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded text-[8px] font-mono font-bold">10 MIN</span>
            </span>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-extrabold">₹ COD Collection En Route</span>
          </div>
        </div>
      </div>

      {/* 🚁 Top Sky (42%): Delivery Drone Floating */}
      <div
        className="absolute top-[42%] left-0 anim-move-right-slow flex items-center gap-2"
        style={{ animationDelay: '8s' }}
      >
        <div className="anim-float flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-xl shadow-md border border-purple-300 dark:border-purple-800/60 backdrop-blur-md">
          <Navigation size={16} className="text-purple-600 dark:text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
          <Package size={14} className="text-amber-500" />
          <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">Air Drop Drone #09</span>
        </div>
      </div>

      {/* 🚚 Lane 3 (57%): Inter-Zone Heavy Freight Truck heading Left */}
      <div
        className="absolute top-[57%] left-0 anim-move-left-slow flex items-center gap-2"
        style={{ animationDelay: '9s' }}
      >
        <div className="flex items-center gap-2.5 bg-white/80 dark:bg-zinc-900/80 px-3.5 py-2 rounded-2xl shadow-md border border-blue-200 dark:border-blue-900/50 backdrop-blur-md">
          <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
            <Truck size={22} className="shrink-0" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">Inter-State Logistics Truck</span>
            <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-semibold">B2B Heavy Parcel Freight</span>
          </div>
        </div>
      </div>

      {/* 🛵 Lane 4 (78%): Hyperlocal Delivery Scooter heading Right */}
      <div
        className="absolute top-[78%] left-0 anim-move-right-fast flex items-center gap-2"
        style={{ animationDelay: '5s' }}
      >
        <div className="flex items-center gap-2 bg-white/85 dark:bg-zinc-900/85 px-3 py-1.5 rounded-2xl shadow-lg border border-red-300 dark:border-red-800/60 backdrop-blur-md">
          <div className="p-1.5 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400">
            <Bike size={18} className="shrink-0" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-extrabold text-zinc-900 dark:text-zinc-100">Courier Delivery Rider</span>
              <CheckCircle size={12} className="text-emerald-500" />
            </div>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">OTP Handshake Active</span>
          </div>
        </div>
      </div>

      {/* 🚚 Lane 4 (85%): Last-Mile Delivery Van heading Left */}
      <div
        className="absolute top-[85%] left-0 anim-move-left-medium flex items-center gap-2"
        style={{ animationDelay: '12s' }}
      >
        <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-2xl shadow-md border border-amber-200 dark:border-amber-900/50 backdrop-blur-md">
          <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
            <Truck size={18} className="shrink-0" />
          </div>
          <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">Last-Mile Dispatch Van</span>
        </div>
      </div>
    </div>
  );
};
