import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const ErrorState = ({
  title = "Telemetry Stream Disconnected",
  message = "Failed to establish communication with CJack hardware node.",
  status = "CRITICAL",
  onRetry,
  className = ""
}) => {
  return (
    <div
      role="alert"
      className={`p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-lg text-center max-w-md mx-auto my-6 ${className}`}
    >
      <div className="flex justify-center mb-3">
        <StatusBadge status={status} size="sm" />
      </div>

      <AlertTriangle className="h-9 w-9 text-red-600 dark:text-red-400 mx-auto mb-2" aria-hidden="true" />
      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-xs text-gray-600 dark:text-gray-300 font-mono mb-4 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 text-xs font-semibold rounded bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark transition-colors inline-flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Hardware Telemetry Link</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
