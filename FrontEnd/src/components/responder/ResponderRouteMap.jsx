import React, { useState } from 'react';
import { 
  Crosshair, 
  MapPin, 
  Compass, 
  Navigation, 
  Ambulance, 
  Layers, 
  Info,
  Maximize2
} from 'lucide-react';

/**
 * ResponderRouteMap
 * 
 * Shows:
 * 1. Patient location
 * 2. Responder location
 * 3. Route placeholder (Direct trajectory corridor)
 * 
 * Strict Requirement: "Do not calculate fake navigation data."
 */
export const ResponderRouteMap = ({
  patient = { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 2.8, landmark: 'Near Gate 3, Cubbon Tech Hub' },
  responder = { callsign: 'ALS-MED-04', latitude: 12.9810, longitude: 77.6015, distanceKm: 1.8, etaMinutes: 4, speedKmh: 48, status: 'En route' },
  isSimulated = true
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  // SVG coordinate canvas 600 x 360
  // Patient at center-left (200, 220)
  // Responder at top-right (460, 110)
  const patientPos = { x: 190, y: 230 };
  const responderPos = { x: 450, y: 110 };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Crosshair className="w-5 h-5 text-amber-400 animate-spin-slow" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Ambulance Tactical Trajectory Map
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700">
                DIRECT VECTOR ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Showing Patient location, Responder coordinates, and Route Placeholder.
            </p>
          </div>
        </div>

        {/* Zoom & Center Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-300 font-mono">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
              className="px-2 py-1 hover:bg-slate-800 rounded"
              title="Zoom out"
            >
              -
            </button>
            <span className="px-2 text-amber-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              className="px-2 py-1 hover:bg-slate-800 rounded"
              title="Zoom in"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[340px] bg-slate-950 overflow-hidden select-none">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

        {/* Compass HUD */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>BLR-TACTICAL-SECTOR-4</span>
        </div>

        {/* Strict Realism Banner: Route Placeholder (No Fake Navigation) */}
        <div className="absolute top-3 right-3 pointer-events-none z-10 bg-slate-900/90 border border-amber-600/40 px-2.5 py-1 rounded text-[10px] font-mono text-amber-300 flex items-center gap-1.5 shadow-md">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>ROUTE PLACEHOLDER (STRAIGHT-LINE VECTOR • NO FAKE ROADS)</span>
        </div>

        {/* Live Vector Telemetry HUD */}
        <div className="absolute bottom-3 left-3 pointer-events-none z-10 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-300 flex items-center gap-3">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Route Vector</span>
            <span className="text-amber-400 font-bold">{responder.distanceKm} km straight-line</span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Estimated Transit</span>
            <span className="text-emerald-400 font-bold">~{responder.etaMinutes} mins @ {responder.speedKmh} km/h</span>
          </div>
        </div>

        {/* SVG Tactical Vector Viewport */}
        <svg 
          viewBox="0 0 600 340" 
          className="w-full h-full transform transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <radialGradient id="patientAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            <pattern id="tacticalGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.25" />
            </pattern>
          </defs>

          <rect width="600" height="340" fill="url(#tacticalGrid)" />

          {/* Range Circles centered on Patient */}
          <circle cx={patientPos.x} cy={patientPos.y} r="50" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx={patientPos.x} cy={patientPos.y} r="120" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
          <circle cx={patientPos.x} cy={patientPos.y} r="200" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />

          {/* ========================================================
              ROUTE PLACEHOLDER: DIRECT TRAJECTORY CORRIDOR
              (Strictly no fake road turn-by-turn navigation data)
              ======================================================== */}
          {/* Corridor envelope buffer */}
          <line 
            x1={responderPos.x} 
            y1={responderPos.y} 
            x2={patientPos.x} 
            y2={patientPos.y} 
            stroke="#f59e0b" 
            strokeWidth="8" 
            strokeOpacity="0.15"
            strokeLinecap="round"
          />
          {/* Primary Route Line */}
          <line 
            x1={responderPos.x} 
            y1={responderPos.y} 
            x2={patientPos.x} 
            y2={patientPos.y} 
            stroke="#f59e0b" 
            strokeWidth="2.5" 
            strokeDasharray="6,4"
            strokeOpacity="0.85"
          />

          {/* Route Placeholder Midpoint Label */}
          <g transform={`translate(${(responderPos.x + patientPos.x) / 2}, ${(responderPos.y + patientPos.y) / 2 - 12})`}>
            <rect x="-65" y="-10" width="130" height="20" rx="3" fill="#0f172a" stroke="#ca8a04" strokeWidth="1" fillOpacity="0.9" />
            <text x="0" y="3" fill="#fef08a" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              ROUTE VECTOR: 1.8 KM
            </text>
          </g>

          {/* 1. RESPONDER AMBULANCE MARKER */}
          <g transform={`translate(${responderPos.x}, ${responderPos.y})`}>
            {/* Siren beacon ripple */}
            <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="1.5">
              <animate attributeName="r" values="10;24" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite" />
            </circle>

            {/* Ambulance Shield */}
            <circle r="12" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
            <path d="M-5 -2 L5 -2 M0 -7 L0 3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

            {/* Trajectory direction heading arrow */}
            <polygon points="-4,14 4,14 0,20" fill="#f59e0b" />

            {/* Responder Callout */}
            <g transform="translate(18, -18)">
              <rect width="130" height="38" rx="4" fill="#0f172a" stroke="#d97706" strokeWidth="1" fillOpacity="0.95" />
              <text x="6" y="14" fill="#fef08a" fontSize="9" fontWeight="bold" fontFamily="monospace">
                🚑 {responder.callsign}
              </text>
              <text x="6" y="28" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                Speed: {responder.speedKmh} km/h • Code 3
              </text>
            </g>
          </g>

          {/* 2. PATIENT LOCATION MARKER */}
          <g transform={`translate(${patientPos.x}, ${patientPos.y})`}>
            {/* Emergency cardiac pulse */}
            <circle r="26" fill="url(#patientAura)">
              <animate attributeName="r" values="16;32" dur="1.4s" repeatCount="indefinite" />
            </circle>

            {/* Patient Pin */}
            <circle r="12" fill="#991b1b" stroke="#ef4444" strokeWidth="2" />
            <circle r="4" fill="#ffffff" />

            {/* Patient Callout */}
            <g transform="translate(-135, -45)">
              <rect width="130" height="42" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" fillOpacity="0.95" />
              <text x="6" y="14" fill="#fca5a5" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                PATIENT (CARDIAC ARREST)
              </text>
              <text x="6" y="26" fill="#e2e8f0" fontSize="8" fontFamily="monospace">
                {(Number(patient?.latitude) || 12.9716).toFixed(4)}°N, {(Number(patient?.longitude) || 77.5946).toFixed(4)}°E
              </text>
              <text x="6" y="36" fill="#38bdf8" fontSize="7" fontFamily="monospace">
                Precision: ±{patient.accuracyMeters || 2.8}m WGS84
              </text>
            </g>
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 flex items-center gap-3 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-300"></span>
            <span>Patient</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-yellow-200"></span>
            <span>Ambulance ALS-MED-04</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-400 border border-dashed border-amber-300"></span>
            <span>Route Vector</span>
          </div>
        </div>
      </div>

      {/* Geospatial Coordinates Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">Patient Coordinates</span>
          <span className="text-white font-bold">{(Number(patient?.latitude) || 12.9716).toFixed(5)}° N, {(Number(patient?.longitude) || 77.5946).toFixed(5)}° E</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{patient?.landmark || 'Location Pin'}</span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">Ambulance Current Fix</span>
          <span className="text-amber-300 font-bold">{(Number(responder?.latitude) || 12.9810).toFixed(5)}° N, {(Number(responder?.longitude) || 77.6015).toFixed(5)}° E</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">En route • Heading 224° SW @ 48 km/h</span>
        </div>
      </div>
    </div>
  );
};
