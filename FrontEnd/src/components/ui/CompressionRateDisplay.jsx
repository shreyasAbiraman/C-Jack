import React from 'react';
import { Activity } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const CompressionRateDisplay = ({
  rate = 108,
  targetMin = 100,
  targetMax = 120,
  className = ''
}) => {
  const status = rate === 0
    ? 'OFFLINE'
    : rate >= targetMin && rate <= targetMax
    ? 'NORMAL'
    : rate >= 90 && rate <= 130
    ? 'WARNING'
    : 'CRITICAL';

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Activity className="h-4 w-4 text-cjack-accent" />
          <span>Compression Rate</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-gray-950 dark:text-white">
          {rate}
        </span>
        <span className="text-sm font-mono font-bold text-gray-500">CPM</span>
      </div>

      <div className="mt-3 pt-2.5 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] font-mono">
        <span className="text-gray-500">AHA Target: <strong className="text-gray-800 dark:text-gray-200">{targetMin} - {targetMax} CPM</strong></span>
        <span className={status === 'NORMAL' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
          {status === 'NORMAL' ? 'ON TARGET' : 'ADJUSTING'}
        </span>
      </div>
    </div>
  );
};

export default CompressionRateDisplay;
