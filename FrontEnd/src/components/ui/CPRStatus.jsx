import React from 'react';
import { Activity, Play, Square, Clock, Gauge, Wind } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const CPRStatus = ({
  active = false,
  mode = 'Automated Pneumatic Vest',
  elapsedSeconds = 0,
  compressionFraction = 92,
  onToggleActive,
  className = ''
}) => {
  const status = active ? 'CRITICAL' : 'NORMAL';
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  return (
    <div
      role="region"
      aria-label={`CPR Resuscitation Status: ${active ? 'Active' : 'Standby'}. CCF: ${compressionFraction}%.`}
      className={`bg-surface-light dark:bg-surface-dark rounded-lg border p-4 ${
        active
          ? 'border-red-500 shadow-lg shadow-red-500/10'
          : 'border-surface-borderLight dark:border-surface-borderDark'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Activity className={`h-4 w-4 ${active ? 'text-red-500 animate-pulse' : 'text-cjack-accent'}`} />
          <span>Automated CPR State</span>
        </div>
        <StatusBadge status={status} size="sm" text={active ? 'CPR ENGAGED' : 'STANDBY'} pulse={active} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
        <div className="p-2.5 rounded bg-surface-mutedLight/50 dark:bg-surface-mutedDark/40">
          <span className="text-[10px] text-gray-500 block uppercase">Elapsed Time</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="h-3.5 w-3.5 text-cjack-accent" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-surface-mutedLight/50 dark:bg-surface-mutedDark/40">
          <span className="text-[10px] text-gray-500 block uppercase">Compression Fraction</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Gauge className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {compressionFraction}%
            </span>
          </div>
        </div>
      </div>

      {onToggleActive && (
        <button
          onClick={onToggleActive}
          className={`w-full py-2 px-3 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
            active
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {active ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{active ? 'Halt Automated CPR' : 'Arm & Start Automated CPR'}</span>
        </button>
      )}
    </div>
  );
};

export default CPRStatus;
