import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingState = ({
  label = "Synchronizing Telemetry Stream...",
  subtext = "Polling ESP32 & TTGO T-Beam sensor channels",
  size = "md",
  className = ""
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400 ${className}`}
    >
      <RefreshCw className={`animate-spin text-cjack-primary mb-3 ${size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-10 w-10' : 'h-7 w-7'}`} />
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </p>
      {subtext && (
        <p className="text-[11px] text-gray-500 font-mono mt-1">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default LoadingState;
