import React from 'react';
import { normalizeStatus } from './statusTokens';
import { Clock, Check } from 'lucide-react';

export const AlertCard = ({
  id,
  title,
  message,
  severity = 'WARNING',
  category = 'CLINICAL',
  timestamp,
  acknowledged = false,
  onAcknowledge,
  className = ''
}) => {
  const statusConfig = normalizeStatus(severity);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      role="alert"
      className={`bg-surface-light dark:bg-surface-dark rounded-lg border p-4 transition-all ${
        severity === 'CRITICAL'
          ? 'border-red-500 shadow-sm shadow-red-500/10'
          : severity === 'WARNING'
          ? 'border-amber-400'
          : 'border-surface-borderLight dark:border-surface-borderDark'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className={`p-1.5 rounded mt-0.5 shrink-0 ${statusConfig.badgeClass}`}>
            <StatusIcon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                {category}
              </span>
              <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${statusConfig.badgeClass}`}>
                {statusConfig.label}
              </span>
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
              {title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {onAcknowledge && (
          <button
            onClick={() => onAcknowledge(id)}
            disabled={acknowledged}
            className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors shrink-0 ${
              acknowledged
                ? 'bg-surface-mutedLight dark:bg-surface-mutedDark text-gray-400 border-surface-borderLight dark:border-surface-borderDark cursor-default'
                : 'bg-surface-light dark:bg-surface-dark border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark'
            }`}
          >
            {acknowledged ? (
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Acked</span>
            ) : (
              'Acknowledge'
            )}
          </button>
        )}
      </div>

      {timestamp && (
        <div className="mt-3 pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center gap-1 text-[11px] font-mono text-gray-400 dark:text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{new Date(timestamp).toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
};

export default AlertCard;
