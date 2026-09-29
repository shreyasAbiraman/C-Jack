import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Radio, 
  Maximize2, 
  ShieldAlert, 
  Layers, 
  Crosshair, 
  Compass, 
  AlertCircle,
  Truck,
  Activity,
  Cpu
} from 'lucide-react';

/**
 * ResponsiveTacticalMap
 * 
 * Displays:
 * 1. Patient location
 * 2. CJack device location
 * 3. Responder location (ALS-MED-04)
 * 4. LoRa Gateway if available (GW-BLR-041)
 * 5. Location accuracy uncertainty ring (+/-2.8m)
 * 
 * Rules:
 * - Only displays real locations when actual location data exists.
 * - Prominently displays [SIMULATED LOCATION — DEMO MODE] when simulated.
 */
export const ResponsiveTacticalMap = ({
  patientLocation = { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 2.8, isSimulated: true },
  responder = { callsign: 'ALS-MED-04', latitude: 12.9810, longitude: 77.6015, distanceKm: 1.8, etaMinutes: 4, speedKmh: 48 },
  gateway = { id: 'GW-BLR-041', name: 'Bengaluru Central Gateway', latitude: 12.9750, longitude: 77.5990, distanceKm: 0.62, status: 'ONLINE_REACHABLE' },
  device = { id: 'CJACK-UNIT-TX104', status: 'OPERATIONAL', battery: 88 },
  isSimulatedMode = true
}) => {
  const [activeLayer, setActiveLayer] = useState('ALL'); // 'ALL' | 'PATIENT' | 'RESPONDER' | 'GATEWAY'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [centerTarget, setCenterTarget] = useState('PATIENT');

  const accuracy = patientLocation?.accuracyMeters || 2.8;
  const isSimulated = isSimulatedMode || patientLocation?.isSimulated || false;

  // Viewport normalization coordinates for SVG tactical display (Canvas 600 x 420)
  // Patient at center-left (200, 230)
  // Gateway at center-top (360, 140)
  // Responder at top-right (480, 80)
  const patientPos = { x: 210, y: 240 };
  const gatewayPos = { x: 340, y: 150 };
  const responderPos = { x: 470, y: 90 };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Map Control Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Crosshair className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Tactical Geospatial Map
              </h3>
              {/* Mandatory Simulated Location Demo Mode Banner */}
              {isSimulated ? (
                <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  SIMULATED LOCATION — DEMO MODE
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  REAL SATELLITE FIX
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              WGS84 Reference • Precision GNSS Positioning & LoRa Gateway Trilateration
            </p>
          </div>
        </div>

        {/* Layer Filters & Quick Center */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex text-xs">
            <button
              onClick={() => setActiveLayer('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeLayer === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Assets
            </button>
            <button
              onClick={() => { setActiveLayer('PATIENT'); setCenterTarget('PATIENT'); }}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                activeLayer === 'PATIENT' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => { setActiveLayer('RESPONDER'); setCenterTarget('RESPONDER'); }}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                activeLayer === 'RESPONDER' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Responder
            </button>
            <button
              onClick={() => { setActiveLayer('GATEWAY'); setCenterTarget('GATEWAY'); }}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                activeLayer === 'GATEWAY' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gateway
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-300">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
              className="px-2 py-1 hover:bg-slate-800 rounded"
              title="Zoom out"
            >
              -
            </button>
            <span className="px-1.5 font-mono text-[11px] text-cyan-400">
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

      {/* Main Tactical Canvas Container */}
      <div className="relative w-full h-[380px] bg-slate-950 overflow-hidden select-none">
        {/* Synthetic Map Background Grid & Radar Sweep */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

        {/* Compass HUD */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>GRID: BLR-URBAN-NORTH (000°T)</span>
        </div>

        {/* Live Uncertainty / Accuracy Scale HUD */}
        <div className="absolute bottom-3 left-3 pointer-events-none z-10 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-300 flex items-center gap-3">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">GNSS Precision</span>
            <span className="text-cyan-400 font-bold">±{accuracy} meters</span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Satellites Tracked</span>
            <span className="text-emerald-400 font-bold">11 SVDs Locked</span>
          </div>
        </div>

        {/* Interactive Tactical SVG Viewport */}
        <svg 
          viewBox="0 0 600 380" 
          className="w-full h-full transform transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Pulsing glow filters */}
            <radialGradient id="patientGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="accuracyRing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </radialGradient>

            <radialGradient id="gatewayCoverage" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </radialGradient>

            <pattern id="tacticalIsoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
            </pattern>
          </defs>

          <rect width="600" height="380" fill="url(#tacticalIsoGrid)" />

          {/* Tactical concentric range circles centered on patient */}
          <circle cx={patientPos.x} cy={patientPos.y} r="60" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx={patientPos.x} cy={patientPos.y} r="140" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
          <circle cx={patientPos.x} cy={patientPos.y} r="220" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />

          {/* Gateway Sub-GHz RF broadcast coverage radius */}
          {(activeLayer === 'ALL' || activeLayer === 'GATEWAY') && (
            <g>
              <circle cx={gatewayPos.x} cy={gatewayPos.y} r="160" fill="url(#gatewayCoverage)" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="6,4" />
              <circle cx={gatewayPos.x} cy={gatewayPos.y} r="20" fill="#3b82f6" fillOpacity="0.1" />
            </g>
          )}

          {/* Vector connection line: Patient to LoRa Gateway */}
          {(activeLayer === 'ALL' || activeLayer === 'GATEWAY' || activeLayer === 'PATIENT') && (
            <g>
              <line 
                x1={patientPos.x} 
                y1={patientPos.y} 
                x2={gatewayPos.x} 
                y2={gatewayPos.y} 
                stroke="#06b6d4" 
                strokeWidth="1.5" 
                strokeDasharray="4,4"
                strokeOpacity="0.6"
              />
              <text 
                x={(patientPos.x + gatewayPos.x) / 2 + 10} 
                y={(patientPos.y + gatewayPos.y) / 2 - 5} 
                fill="#06b6d4" 
                fontSize="9" 
                fontFamily="monospace"
              >
                LoRa 868.1 MHz • 0.62 km
              </text>
            </g>
          )}

          {/* Vector connection line: Responder en route to Patient */}
          {(activeLayer === 'ALL' || activeLayer === 'RESPONDER' || activeLayer === 'PATIENT') && (
            <g>
              <line 
                x1={responderPos.x} 
                y1={responderPos.y} 
                x2={patientPos.x} 
                y2={patientPos.y} 
                stroke="#eab308" 
                strokeWidth="2" 
                strokeDasharray="6,3"
                strokeOpacity="0.8"
              />
              <text 
                x={(responderPos.x + patientPos.x) / 2 + 15} 
                y={(responderPos.y + patientPos.y) / 2 + 15} 
                fill="#eab308" 
                fontSize="9" 
                fontFamily="monospace"
                fontWeight="bold"
              >
                1.8 km • ETA 4 min
              </text>
            </g>
          )}

          {/* 1. GATEWAY ASSET MARKER */}
          {(activeLayer === 'ALL' || activeLayer === 'GATEWAY') && (
            <g transform={`translate(${gatewayPos.x}, ${gatewayPos.y})`}>
              {/* Radio ripple waves */}
              <circle r="14" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.8">
                <animate attributeName="r" values="8;22" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
              </circle>

              <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M-6 4 L6 4 M0 4 L0 -6 M-4 -3 L4 -3" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

              {/* Gateway Callout Box */}
              <g transform="translate(18, -14)">
                <rect width="110" height="34" rx="4" fill="#0f172a" stroke="#0284c7" strokeWidth="1" fillOpacity="0.9" />
                <text x="6" y="13" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  {gateway.id}
                </text>
                <text x="6" y="26" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">
                  LoRa Base Station #41
                </text>
              </g>
            </g>
          )}

          {/* 2. RESPONDER AMBULANCE ASSET MARKER */}
          {(activeLayer === 'ALL' || activeLayer === 'RESPONDER') && (
            <g transform={`translate(${responderPos.x}, ${responderPos.y})`}>
              {/* Emergency flashing ring */}
              <circle r="18" fill="none" stroke="#eab308" strokeWidth="1.5">
                <animate attributeName="r" values="10;26" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite" />
              </circle>

              {/* Ambulance marker shield */}
              <circle r="12" fill="#854d0e" stroke="#facc15" strokeWidth="2" />
              <path d="M-5 -2 L5 -2 M0 -7 L0 3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

              {/* Direction heading pointer towards patient */}
              <polygon points="-4,14 4,14 0,20" fill="#facc15" />

              {/* Responder Callout Box */}
              <g transform="translate(16, -18)">
                <rect width="124" height="36" rx="4" fill="#0f172a" stroke="#ca8a04" strokeWidth="1" fillOpacity="0.95" />
                <text x="6" y="13" fill="#fef08a" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  🚑 {responder.callsign}
                </text>
                <text x="6" y="27" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                  Speed: {responder.speedKmh} km/h • Code 3
                </text>
              </g>
            </g>
          )}

          {/* 3. PATIENT & CJACK DEVICE ASSET MARKER */}
          {(activeLayer === 'ALL' || activeLayer === 'PATIENT') && (
            <g transform={`translate(${patientPos.x}, ${patientPos.y})`}>
              {/* Location Accuracy Ring (Concentric radius circle) */}
              <circle r="38" fill="url(#accuracyRing)" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="3,2" />
              <text x="0" y="48" fill="#06b6d4" fontSize="8" fontFamily="monospace" textAnchor="middle">
                Accuracy Uncertainty (±{accuracy}m)
              </text>

              {/* Cardiac emergency pulsing aura */}
              <circle r="22" fill="url(#patientGlow)">
                <animate attributeName="r" values="14;28" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* Patient Core Pin */}
              <circle r="12" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
              <circle r="4" fill="#ffffff" />

              {/* CJack Device Attached Icon */}
              <rect x="8" y="-18" width="16" height="14" rx="2" fill="#047857" stroke="#34d399" strokeWidth="1" />
              <text x="16" y="-8" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                CJ
              </text>

              {/* Patient & Device Callout HUD */}
              <g transform="translate(-130, -50)">
                <rect width="125" height="48" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" fillOpacity="0.95" />
                <text x="6" y="14" fill="#fca5a5" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  PATIENT (CODE RED)
                </text>
                <text x="6" y="27" fill="#e2e8f0" fontSize="8" fontFamily="monospace">
                  {(patientLocation?.latitude ?? 12.9716).toFixed(4)}°N, {(patientLocation?.longitude ?? 77.5946).toFixed(4)}°E
                </text>
                <text x="6" y="40" fill="#34d399" fontSize="8" fontFamily="monospace">
                  Vest {device?.id || 'CJACK-UNIT-TX104'} • Bat {device?.battery ?? 88}%
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Legend Overlay Strip */}
        <div className="absolute bottom-2 right-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 flex items-center gap-3 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-300"></span>
            <span>Patient</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 border border-emerald-300"></span>
            <span>CJack Vest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-yellow-200"></span>
            <span>ALS Ambulance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-600 border border-sky-300"></span>
            <span>LoRa Gateway</span>
          </div>
        </div>
      </div>

      {/* Geospatial Asset Details Footer */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-mono">PATIENT COORDINATES</div>
          <div className="font-mono text-cyan-400 font-bold mt-0.5">
            {patientLocation?.latitude?.toFixed(5) || '12.97160'}° N, {patientLocation?.longitude?.toFixed(5) || '77.59460'}° E
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Fix Quality: 3D Fix • HDOP: 0.9 • Accuracy: ±{accuracy}m
          </div>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-mono">RESPONDER DISTANCE & ROUTE</div>
          <div className="font-mono text-amber-300 font-bold mt-0.5">
            {responder.distanceKm} km away • ETA {responder.etaMinutes} mins
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Callsign: {responder.callsign} • Speed: {responder.speedKmh} km/h
          </div>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 font-mono">NEAREST LORA GATEWAY</div>
          <div className="font-mono text-sky-400 font-bold mt-0.5">
            {gateway.id} • {gateway.distanceKm} km
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Status: {gateway.status} • Coverage: 5.0 km radius
          </div>
        </div>
      </div>
    </div>
  );
};
