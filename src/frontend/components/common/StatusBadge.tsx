import React from 'react';
import { OrderStatus } from '../../../types';
import {
  Clock,
  PackageCheck,
  Truck,
  Navigation,
  CheckCircle2,
  AlertOctagon,
  CalendarClock,
  Ban,
} from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showPulse = false,
}) => {
  const getStatusConfig = (st: OrderStatus) => {
    switch (st) {
      case 'PENDING':
        return {
          label: 'Pending Pickup',
          bg: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200',
          iconBg: 'text-zinc-500',
          dot: 'bg-zinc-400',
          Icon: Clock,
        };
      case 'PICKED_UP':
        return {
          label: 'Picked Up',
          bg: 'bg-green-50 dark:bg-green-950/60 border-green-300 dark:border-green-800 text-green-900 dark:text-green-300',
          iconBg: 'text-green-600',
          dot: 'bg-green-500',
          Icon: PackageCheck,
        };
      case 'IN_TRANSIT':
        return {
          label: 'In Transit',
          bg: 'bg-zinc-900 text-white border-zinc-700',
          iconBg: 'text-red-400',
          dot: 'bg-red-500',
          Icon: Truck,
        };
      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Out for Delivery',
          bg: 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-900 dark:text-red-300',
          iconBg: 'text-red-600',
          dot: 'bg-red-500',
          Icon: Navigation,
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          bg: 'bg-green-100 dark:bg-green-950 border-green-400 dark:border-green-700 text-green-950 dark:text-green-200 font-bold',
          iconBg: 'text-green-600',
          dot: 'bg-green-500',
          Icon: CheckCircle2,
        };
      case 'FAILED':
        return {
          label: 'Delivery Failed',
          bg: 'bg-red-100 dark:bg-red-950 border-red-400 dark:border-red-700 text-red-950 dark:text-red-200 font-bold',
          iconBg: 'text-red-600',
          dot: 'bg-red-500',
          Icon: AlertOctagon,
        };
      case 'RESCHEDULED':
        return {
          label: 'Rescheduled',
          bg: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200',
          iconBg: 'text-zinc-600',
          dot: 'bg-zinc-500',
          Icon: CalendarClock,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          bg: 'bg-zinc-200 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400',
          iconBg: 'text-zinc-500',
          dot: 'bg-zinc-400',
          Icon: Ban,
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.Icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs tracking-tight ${config.bg} ${sizeClasses[size]}`}
    >
      {showPulse ? (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          ></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
        </span>
      ) : (
        <IconComponent size={iconSizes[size]} className={config.iconBg} />
      )}
      <span>{config.label}</span>
    </span>
  );
};
