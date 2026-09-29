import React from 'react';
import { Heart, Activity } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const HeartRateDisplay = ({
  heartRate = 74,
  rhythm = 'Normal Sinus Rhythm',
  className = ''
}) => {
  const isArrest = heartRate === 0 || rhythm.includes('Fibrillation') || rhythm.includes('Asystole');
  const status = isArrest
    ? 'CRITICAL'
    : heartRate < 50 || heartRate > 120
    ? 'WARNING'
    : 'NORMAL';

  return (
    <div
      role="region"
      aria-label={`Heart Rate: ${heartRate} BPM. Rhythm: ${rhythm}. Status: ${status}`}
      className={`bg-surface-light dark:bg-surface-dark rounded-lg border p-4 ${
        status === 'CRITICAL'
          ? 'border-red-500 shadow-lg shadow-red-500/10'
          : 'border-surface-borderLight dark:border-surface-borderDark'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Heart className={`h-4 w-4 ${status === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-red-500'}`} />
          <span>Heart Rate (Lead-II)</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-gray-950 dark:text-white">
          {heartRate !== undefined && heartRate !== null ? heartRate : '--'}
        </span>
        <span className="text-sm font-mono font-bold text-gray-500">BPM</span>
      </div>

      <div className="mt-3 pt-2.5 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] font-mono">
        <span className="text-gray-500">Rhythm: <strong className="text-gray-800 dark:text-gray-200">{rhythm}</strong></span>
        <span className="text-gray-500">Target: 60 - 100</span>
      </div>
    </div>
  );
};

export default HeartRateDisplay;
