import React from 'react';
import { normalizeStatus } from './statusTokens';

export const VitalCard = ({
  title,
  value,
  unit,
  status = 'NORMAL',
  icon: Icon,
  targetRange,
  source,
  trend,
  className = ''
}) => {
  const statusConfig = normalizeStatus(status);
  const StatusIcon = statusConfig.icon;
  const isCritical = statusConfig.key === 'CRITICAL';

  return (
    <div
      role="region"
      aria-label={`${title}: ${value} ${unit || ''}. Status is ${statusConfig.label}`}
      className={`relative bg-surface-light dark:bg-surface-dark rounded-lg border p-4 transition-all ${
        isCritical
          ? 'border-red-500 shadow-md shadow-red-500/10'
          : statusConfig.key === 'WARNING'
          ? 'border-amber-400'
          : 'border-surface-borderLight dark:border-surface-borderDark'
      } ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          {Icon && <Icon className="h-4 w-4 text-cjack-accent" aria-hidden="true" />}
          <span>{title}</span>
        </div>

        {/* Semantic Status Indicator */}
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${statusConfig.badgeClass}`}
        >
          <StatusIcon className="h-3 w-3 shrink-0" />
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* Primary Value Display */}
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-gray-950 dark:text-white">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        {unit && (
          <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        )}
        {trend && (
          <span className="text-xs font-mono text-gray-500 ml-auto">
            {trend}
          </span>
        )}
      </div>

      {/* Footer Info: Clinical Target & Hardware Source */}
      <div className="mt-3 pt-2.5 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] text-gray-500 font-mono">
        {targetRange ? (
          <span>Target: <strong className="text-gray-700 dark:text-gray-300">{targetRange}</strong></span>
        ) : <span />}
        {source && (
          <span className="truncate max-w-[140px] text-gray-400 dark:text-gray-500" title={source}>
            {source}
          </span>
        )}
      </div>
    </div>
  );
};

export default VitalCard;
