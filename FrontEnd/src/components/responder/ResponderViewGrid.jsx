import React from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Activity, 
  Zap, 
  Droplet, 
  ShieldAlert, 
  FileText, 
  Cpu, 
  Navigation, 
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

/**
 * ResponderViewGrid
 * 
 * Displays the 10 operational parameters immediately needed by the responder:
 * 1. Emergency severity
 * 2. Patient location
 * 3. Patient vitals
 * 4. CPR status
 * 5. Blood group
 * 6. Allergies
 * 7. Emergency notes
 * 8. Device status
 * 9. Distance
 * 10. Communication status
 */
export const ResponderViewGrid = ({
  severity = 'LEVEL 1 — CARDIAC ARREST (CODE RED)',
  location = { latitude: 12.9716, longitude: 77.5946, landmark: 'Near Gate 3, Cubbon Tech Hub', accuracyMeters: 2.8 },
  vitals = { heartRate: 0, rhythm: 'Ventricular Fibrillation', spo2: 78, etco2: 18 },
  cpr = { state: 'CPR_ACTIVE', rateCPM: 108, depthMM: 52, feedbackStatus: 'ACTIVE_CLOSED_LOOP' },
  bloodGroup = 'O+',
  allergies = ['Penicillin', 'Sulfa Drugs', 'Latex (Mild)'],
  emergencyNotes = 'Prior MI (2023); dual-chamber stent; on Warfarin. DNR: NONE (Full Resuscitation Requested).',
  device = { id: 'CJACK-UNIT-TX104', batteryLevel: 88, status: 'OPERATIONAL' },
  distanceKm = 1.8,
  etaMinutes = 4,
  communication = { loraStatus: 'ACTIVE_TRANSMITTING', gatewayId: 'GW-BLR-041', rssi: -72, backendStatus: 'CONNECTED' }
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            10-Point Operational Responder View
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
          PRIORITY TRIAGE MATRIX
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Emergency severity */}
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-300 text-[10px] font-mono uppercase">
            <span>1. Severity</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="my-1">
            <span className="text-xs font-black font-mono text-red-200 block truncate">
              {severity}
            </span>
            <span className="text-[10px] text-red-300/80 font-mono">Code Red Arrest</span>
          </div>
        </div>

        {/* 2. Patient location */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>2. Patient Location</span>
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1">
            <span className="text-xs font-bold font-mono text-white block truncate">
              {location.latitude?.toFixed(4)}°N, {location.longitude?.toFixed(4)}°E
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate block" title={location.landmark}>
              {location.landmark || 'Cubbon Tech Hub'}
            </span>
          </div>
        </div>

        {/* 3. Patient vitals */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>3. Patient Vitals</span>
            <Activity className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="my-1">
            <span className="text-xs font-bold font-mono text-red-400 block">
              HR: {vitals.heartRate ?? 0} bpm | SpO2: {vitals.spo2 ?? 78}%
            </span>
            <span className="text-[10px] text-amber-300 font-mono truncate block" title={vitals.rhythm}>
              {vitals.rhythm || 'V-Fib'}
            </span>
          </div>
        </div>

        {/* 4. CPR status */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>4. CPR Status</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-1">
            <span className="text-xs font-bold font-mono text-cyan-400 block truncate">
              {cpr.state || 'CPR_ACTIVE'}
            </span>
            <span className="text-[10px] text-slate-300 font-mono">
              {cpr.rateCPM || 108} CPM • {cpr.depthMM || 52} mm
            </span>
          </div>
        </div>

        {/* 5. Blood group */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>5. Blood Group</span>
            <Droplet className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="my-1">
            <span className="text-sm font-black font-mono text-red-400 block">
              {bloodGroup || 'O+'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Universal Donor Cross</span>
          </div>
        </div>

        {/* 6. Allergies */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>6. Allergies</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1">
            <span className="text-xs font-bold font-mono text-amber-300 block truncate" title={allergies.join(', ')}>
              {allergies.join(', ')}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Contraindication Warning</span>
          </div>
        </div>

        {/* 7. Emergency notes */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between lg:col-span-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>7. Emergency Notes</span>
            <FileText className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="my-1">
            <span className="text-xs text-slate-200 line-clamp-2 leading-tight" title={emergencyNotes}>
              {emergencyNotes}
            </span>
          </div>
        </div>

        {/* 8. Device status */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>8. Device Status</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1">
            <span className="text-xs font-bold font-mono text-emerald-400 block">
              {device.status || 'OPERATIONAL'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Bat {device.batteryLevel ?? 88}% • Vest {device.id || 'TX104'}
            </span>
          </div>
        </div>

        {/* 9. Distance */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>9. Distance & ETA</span>
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1">
            <span className="text-sm font-black font-mono text-amber-300 block">
              {distanceKm} km
            </span>
            <span className="text-[10px] text-slate-300 font-mono">
              ETA: ~{etaMinutes} min (Code 3)
            </span>
          </div>
        </div>

        {/* 10. Communication status */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between lg:col-span-5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>10. Communication Status</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-1 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-bold">
                LoRa 868.1 MHz ({communication.loraStatus || 'ACTIVE'})
              </span>
              <span className="text-slate-400">
                Gateway: {communication.gatewayId || 'GW-BLR-041'} (RSSI: {communication.rssi ?? -72} dBm)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400 text-[11px] font-bold">
                {communication.backendStatus || 'DISPATCH API ONLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
