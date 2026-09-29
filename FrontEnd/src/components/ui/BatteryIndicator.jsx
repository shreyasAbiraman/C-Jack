import React from 'react';
import { Battery, BatteryCharging, BatteryWarning, Zap } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const BatteryIndicator = ({
  level = 88,
  voltage = 14.8,
  health = 'Optimal',
  isCharging = false,
  estimatedHours = 4.2,
  showDetails = true,
  className = ''
}) => {
  const status = level <= 15 ? 'CRITICAL' : level <= 30 ? 'WARNING' : 'NORMAL';

  const barColor = level <= 15
    ? 'bg-red-500'
    : level <= 30
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <div
      role="region"
      aria-label={`Vest Battery Level: ${level}%, Status: ${status}`}
      className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          {isCharging ? (
            <BatteryCharging className="h-4 w-4 text-emerald-500" />
          ) : level <= 20 ? (
            <BatteryWarning className="h-4 w-4 text-red-500 animate-pulse" />
          ) : (
            <Battery className="h-4 w-4 text-cjack-accent" />
          )}
          <span>Battery System</span>
        </div>

        <StatusBadge status={status} size="sm" />
      </div>

      {/* Main Percentage Display */}
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-mono font-extrabold text-gray-900 dark:text-white">
          {level}%
        </span>
        <span className="text-xs font-mono text-gray-500">
          {voltage}V LiFePO4
        </span>
      </div>

      {/* Charge Level Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, level))}%` }}
        />
      </div>

      {/* Footer Info */}
      {showDetails && (
        <div className="mt-3 pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>Est. Runtime: <strong className="text-gray-700 dark:text-gray-300">{estimatedHours} hrs</strong></span>
          <span>Health: <strong className="text-emerald-600 dark:text-emerald-400">{health}</strong></span>
        </div>
      )}
    </div>
  );
};

export default BatteryIndicator;
