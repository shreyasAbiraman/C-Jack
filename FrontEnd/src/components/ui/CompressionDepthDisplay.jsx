import React from 'react';
import { Gauge, RotateCcw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const CompressionDepthDisplay = ({
  depthMm = 52,
  appliedForceNewtons = 410,
  chestRecoilPct = 96,
  targetMin = 50,
  targetMax = 60,
  className = ''
}) => {
  const status = depthMm === 0
    ? 'OFFLINE'
    : depthMm >= targetMin && depthMm <= targetMax
    ? 'NORMAL'
    : depthMm >= 45 && depthMm <= 65
    ? 'WARNING'
    : 'CRITICAL';

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Gauge className="h-4 w-4 text-cjack-accent" />
          <span>Compression Depth & Force</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-gray-950 dark:text-white">
          {depthMm}
        </span>
        <span className="text-sm font-mono font-bold text-gray-500">mm</span>
        <span className="text-xs font-mono text-gray-500 ml-auto">
          {appliedForceNewtons} N
        </span>
      </div>

      <div className="mt-3 pt-2.5 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] font-mono">
        <span className="text-gray-500">Target: <strong className="text-gray-800 dark:text-gray-200">{targetMin} - {targetMax} mm</strong></span>
        <span className="text-gray-500">Recoil: <strong className="text-emerald-600 dark:text-emerald-400">{chestRecoilPct}%</strong></span>
      </div>
    </div>
  );
};

export default CompressionDepthDisplay;
