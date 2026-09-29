import React from 'react';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const MapContainer = ({
  latitude = 12.9716,
  longitude = 77.5946,
  address = 'Bengaluru Central Emergency Sector 4',
  altitude = 920,
  accuracy = 2.8,
  height = 'h-72',
  className = ''
}) => {
  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="px-4 py-2.5 border-b border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
          <MapPin className="h-4 w-4 text-cjack-accent" />
          <span className="truncate max-w-xs">{address}</span>
        </div>
        <StatusBadge status="NORMAL" size="sm" text="GPS ACTIVE" />
      </div>

      {/* Visual Radar Container */}
      <div className={`w-full ${height} bg-slate-950 relative overflow-hidden flex items-center justify-center`}>
        {/* Tactical Grid Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        {/* Concentric Radar Rings */}
        <div className="absolute h-56 w-56 rounded-full border border-sky-500/20" />
        <div className="absolute h-36 w-36 rounded-full border border-sky-500/30 animate-pulse" />
        <div className="absolute h-16 w-16 rounded-full border border-sky-400/50 animate-ping" />

        {/* Center Beacon Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-cjack-primary text-white flex items-center justify-center shadow-lg shadow-blue-500/50">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="mt-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-sky-400 text-[10px] font-mono font-bold tracking-wider border border-sky-500/30">
            PATIENT BEACON
          </span>
        </div>

        {/* Tactical Readout Overlays */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-2 rounded text-[11px] font-mono text-slate-200 space-y-0.5">
          <div>LAT/LON: {latitude.toFixed(6)}°, {longitude.toFixed(6)}°</div>
          <div>ALT: {altitude}m | ACC: ±{accuracy}m</div>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
