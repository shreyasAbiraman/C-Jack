import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const SpO2Display = ({
  spo2 = 98,
  perfusionIndex = 4.2,
  sensor = 'MAX30102 Optical',
  className = ''
}) => {
  const status = spo2 < 88 ? 'CRITICAL' : spo2 < 94 ? 'WARNING' : 'NORMAL';

  return (
    <div
      role="region"
      aria-label={`Blood Oxygen SpO2: ${spo2}%. Perfusion Index: ${perfusionIndex}%. Status: ${status}`}
      className={`bg-surface-light dark:bg-surface-dark rounded-lg border p-4 ${
        status === 'CRITICAL'
          ? 'border-red-500 shadow-md shadow-red-500/10'
          : 'border-surface-borderLight dark:border-surface-borderDark'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Activity className="h-4 w-4 text-cjack-accent" />
          <span>Oxygen Saturation (SpO2)</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-gray-950 dark:text-white">
          {spo2 !== undefined && spo2 !== null ? spo2 : '--'}
        </span>
        <span className="text-sm font-mono font-bold text-gray-500">%</span>
      </div>

      <div className="mt-3 pt-2.5 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] font-mono">
        <span className="text-gray-500">Perfusion (PI): <strong className="text-gray-800 dark:text-gray-200">{perfusionIndex}%</strong></span>
        <span className="text-gray-500">Target: 95 - 100%</span>
      </div>
    </div>
  );
};

export default SpO2Display;
