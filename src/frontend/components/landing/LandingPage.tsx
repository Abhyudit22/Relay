import React from 'react';
import { UserRole } from '../../../types';
import {
  LogIn,
  UserPlus,
  Truck,
  ShieldCheck,
  Package,
  ArrowRight,
  User,
  Navigation,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth?: (mode?: 'login' | 'signup', role?: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
            Welcome to Relay
          </h1>
        </div>

        {/* Primary Action Card: Login & Sign Up */}
        <div className="p-6 sm:p-8 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              id="landing-login-btn"
              onClick={() => onOpenAuth?.('login', 'customer')}
              className="py-3.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <LogIn size={16} />
              <span>Log In</span>
            </button>

            <button
              type="button"
              id="landing-signup-btn"
              onClick={() => onOpenAuth?.('signup', 'customer')}
              className="py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <UserPlus size={16} />
              <span>Sign Up</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white/90 dark:bg-zinc-900/90 px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider absolute">
              Or Choose Your Role
            </span>
          </div>

          {/* Quick Direct Role Sign In */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onOpenAuth?.('login', 'merchant')}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400">
                  <Package size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Merchant Shipper</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Book consignments & thermal AWB</div>
                </div>
              </div>
              <ArrowRight size={15} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth?.('login', 'customer')}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                  <Navigation size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Package Recipient</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Live ETA, Doorstep OTP & Reschedule</div>
                </div>
              </div>
              <ArrowRight size={15} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth?.('login', 'agent')}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  <Truck size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Delivery Courier</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Manage route runs & OTPs</div>
                </div>
              </div>
              <ArrowRight size={15} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth?.('login', 'admin')}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Ops & Dispatch Hub</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Fleet, rates & SLA control</div>
                </div>
              </div>
              <ArrowRight size={15} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
          <User size={13} />
          <span>Secure authentication enabled for all logistics portals</span>
        </div>
      </div>
    </div>
  );
};
