import React, { useState } from 'react';
import { Navigation, Satellite, Copy, Check, Compass } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const GPSIndicator = ({
  latitude = 12.9716,
  longitude = 77.5946,
  altitude = 920,
  accuracy = 2.8,
  satellites = 11,
  locked = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const status = !locked ? 'OFFLINE' : satellites >= 6 ? 'NORMAL' : 'WARNING';

  const handleCopy = () => {
    navigator.clipboard.writeText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="region"
      aria-label={`GPS Beacon: ${latitude}, ${longitude}. ${satellites} satellites locked.`}
      className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Navigation className="h-4 w-4 text-cjack-accent" />
          <span>GNSS / GPS Beacon</span>
        </div>

        <StatusBadge status={status} size="sm" text={locked ? '3D FIX' : 'NO FIX'} />
      </div>

      {/* Coordinate Display */}
      <div className="flex items-baseline justify-between mt-1">
        <div className="font-mono">
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {latitude.toFixed(5)}°, {longitude.toFixed(5)}°
          </div>
          <span className="text-[11px] text-gray-500 font-sans">
            WGS 84 • Altitude: {altitude}m MSL
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40"
          title="Copy exact coordinates"
          aria-label="Copy coordinates"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Satellite and Accuracy Footer */}
      <div className="mt-3 pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] font-mono text-gray-500">
        <span className="flex items-center gap-1.5">
          <Satellite className="h-3.5 w-3.5 text-cjack-accent" />
          Satellites: <strong className="text-gray-800 dark:text-gray-200">{satellites} Locked</strong>
        </span>
        <span>
          Accuracy: <strong className="text-emerald-600 dark:text-emerald-400">±{accuracy}m</strong>
        </span>
      </div>
    </div>
  );
};

export default GPSIndicator;
