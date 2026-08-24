import React, { useState } from 'react';
import { UserRole, NotificationLog, ActiveUser } from '../../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  Truck,
  Bell,
  X,
  ChevronDown,
  LogIn,
  LogOut,
  Building2,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  currentUser: ActiveUser;
  onRoleChange: (role: UserRole) => void;
  notifications?: NotificationLog[];
  isWsConnected?: boolean;
  onOpenAuth: (mode?: 'login' | 'signup', role?: UserRole) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentUser,
  onRoleChange,
  notifications = [],
  isWsConnected = true,
  onOpenAuth,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/80 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Phase Indicator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onRoleChange('guest')}
            className="flex items-center gap-2.5 cursor-pointer group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform font-bold">
              <Truck size={19} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                RELAY
                <span className="text-[10px] uppercase font-bold bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-800/60">
                  Logistics OS
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Central Role Switcher Badges */}
        <div className="hidden lg:flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px]">
          <button
            type="button"
            onClick={() => onRoleChange('guest')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentRole === 'guest'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('customer')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentRole === 'customer'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('merchant')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentRole === 'merchant'
                ? 'bg-zinc-800 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Merchant</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('agent')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentRole === 'agent'
                ? 'bg-green-600 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Courier</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('admin')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              currentRole === 'admin'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Admin HQ</span>
          </button>
        </div>

        {/* Right Controls: Dark/Light Mode, Notifications, Auth */}
        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} className="text-red-400" /> : <Moon size={16} />}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition-colors"
              title="Notifications"
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in">
                <div className="p-3.5 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Live Notifications ({notifications.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{n.title}</span>
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded font-bold">
                          {n.trackingNumber}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-snug">{n.message}</p>
                      <span className="text-[10px] text-zinc-400 block">
                        Channel: {n.channel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Authenticated User Menu (shown when in an active role) */}
          {currentRole !== 'guest' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-black text-white">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-zinc-200 hidden sm:inline truncate max-w-[90px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      currentRole === 'agent'
                        ? 'bg-green-950 text-green-300 border-green-800/40'
                        : 'bg-red-950 text-red-300 border-red-800/40'
                    }`}
                  >
                    {currentRole}
                  </span>
                </div>
                <ChevronDown size={13} className="text-zinc-400 group-hover:text-white transition-transform" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in">
                  <div className="p-3.5 bg-zinc-950 text-white border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-xs font-black text-white">
                          {currentUser.name.charAt(0)}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1 text-xs">
                    {currentUser.companyName && (
                      <div className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 text-[11px] flex items-center gap-2">
                        <Building2 size={13} className="text-zinc-400 shrink-0" />
                        <span className="truncate">{currentUser.companyName}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onRoleChange('guest');
                      }}
                      className="w-full px-2.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-left text-zinc-700 dark:text-zinc-300 flex items-center gap-2 transition-colors font-medium"
                    >
                      <Globe size={14} className="text-zinc-500" />
                      <span>Public Landing Page</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuth('login', currentRole);
                      }}
                      className="w-full px-2.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-left text-zinc-700 dark:text-zinc-300 flex items-center gap-2 transition-colors font-medium"
                    >
                      <LogIn size={14} className="text-zinc-500" />
                      <span>Switch Persona</span>
                    </button>

                    <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full px-2.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-left text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors font-semibold"
                      >
                        <LogOut size={14} className="text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
