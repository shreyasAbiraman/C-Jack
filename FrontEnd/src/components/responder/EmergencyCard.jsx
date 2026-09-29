import React from 'react';
import { 
  AlertOctagon, 
  Heart, 
  Activity, 
  MapPin, 
  Clock, 
  User, 
  ShieldAlert, 
  Zap,
  Droplet
} from 'lucide-react';

/**
 * EmergencyCard
 * 
 * Prominent card with required fields:
 * - CARDIAC EMERGENCY
 * - Patient:
 * - Status:
 * - CPR:
 * - Heart rate:
 * - SpO2:
 * - Location:
 * - Alert time:
 */
export const EmergencyCard = ({
  patient = {},
  emergency = {},
  cpr = {},
  vitals = {}
}) => {
  const patientName = patient?.name || 'John Doe';
  const patientDetails = `${patient?.age || 58}y ${patient?.gender || 'Male'} • Blood Group: ${patient?.bloodGroup || 'O+'}`;
  const status = emergency?.severityCode || 'LEVEL 1 — CARDIAC ARREST (CODE RED)';
  const cprState = cpr?.state || emergency?.cpr?.state || 'CPR_ACTIVE';
  const cprRate = cpr?.rateCPM || cpr?.rate || emergency?.cpr?.rateCPM || 108;
  const cprDepth = cpr?.depthMM || cpr?.depth || emergency?.cpr?.depthMM || 52;
  const hr = vitals?.heartRate ?? emergency?.vitals?.heartRate ?? 0;
  const rhythm = vitals?.rhythm || emergency?.vitals?.rhythm || 'Ventricular Fibrillation (V-Fib)';
  const spo2 = vitals?.spo2 ?? emergency?.vitals?.spo2 ?? 78;
  const location = emergency?.location || {
    latitude: 12.9716,
    longitude: 77.5946,
    landmark: 'Cubbon Tech Hub, Gate 3, MG Road',
    accuracyMeters: 2.8
  };
  const alertTime = emergency?.alertTimeFormatted || '10:42:01';
  const elapsed = emergency?.elapsedSeconds 
    ? `${Math.floor(emergency.elapsedSeconds / 60).toString().padStart(2, '0')}:${(emergency.elapsedSeconds % 60).toString().padStart(2, '0')}`
    : '02:25';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/90 via-slate-900/95 to-slate-950 border-2 border-red-600/80 shadow-2xl p-5 md:p-6 text-white backdrop-blur-md">
      {/* Top Banner Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-red-700/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-wider text-red-100 uppercase drop-shadow-sm">
                CARDIAC EMERGENCY
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-black tracking-widest uppercase rounded bg-red-700 text-white">
                CODE RED
              </span>
            </div>
            <p className="text-xs text-red-300 font-mono mt-0.5">
              AUTONOMOUS CHEST COMPRESSION ACTIVATED • ALS DISPATCH CONFIRMED
            </p>
          </div>
        </div>

        {/* Live Elapsed Incident Clock */}
        <div className="flex items-center gap-2 bg-black/50 border border-red-800/60 px-3.5 py-1.5 rounded-xl font-mono self-start sm:self-auto">
          <Clock className="w-4 h-4 text-red-400 animate-spin-slow" />
          <div className="text-right">
            <span className="text-[10px] text-red-300/80 block uppercase">Elapsed Arrest Time</span>
            <span className="text-base font-black text-red-200 tracking-wider">
              {elapsed}
            </span>
          </div>
        </div>
      </div>

      {/* Structured Core 7-Field Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Field 1: Patient */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono uppercase text-[10px] mb-1">
            <User className="w-3.5 h-3.5 text-red-400" />
            <span>Patient:</span>
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-wide">
              {patientName}
            </div>
            <div className="text-[11px] text-slate-300 font-mono mt-0.5">
              {patientDetails}
            </div>
          </div>
        </div>

        {/* Field 2: Status */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono uppercase text-[10px] mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Status:</span>
          </div>
          <div>
            <div className="text-xs font-black font-mono text-red-400 uppercase tracking-tight line-clamp-1">
              {status}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Sudden Asystole & Pulseless Collapse
            </div>
          </div>
        </div>

        {/* Field 3: CPR */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono uppercase text-[10px] mb-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>CPR:</span>
          </div>
          <div>
            <div className="text-sm font-bold font-mono text-cyan-400">
              {cprState} @ {cprRate} CPM
            </div>
            <div className="text-[11px] text-slate-300 font-mono mt-0.5">
              Depth: {cprDepth} mm • Closed-Loop PID
            </div>
          </div>
        </div>

        {/* Field 4: Heart Rate & Rhythm */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono uppercase text-[10px] mb-1">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span>Heart rate:</span>
          </div>
          <div>
            <div className="text-base font-black font-mono text-red-400">
              {hr} <span className="text-xs font-normal text-slate-400">BPM</span>
            </div>
            <div className="text-[11px] text-amber-300 font-mono truncate" title={rhythm}>
              {rhythm}
            </div>
          </div>
        </div>

        {/* Field 5: SpO2 */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono uppercase text-[10px] mb-1">
            <Droplet className="w-3.5 h-3.5 text-cyan-400" />
            <span>SpO2:</span>
          </div>
          <div>
            <div className="text-base font-black font-mono text-cyan-400">
              {spo2}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Perfusion Index: 0.6 (Critical Hypoxia)
            </div>
          </div>
        </div>

        {/* Field 6: Location */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between lg:col-span-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono uppercase text-[10px] mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Location:</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white font-mono truncate">
              {location.landmark || 'Near Gate 3, Cubbon Tech Hub'}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              {location.latitude?.toFixed(4)}° N, {location.longitude?.toFixed(4)}° E (±{location.accuracyMeters || 2.8}m)
            </div>
          </div>
        </div>

        {/* Field 7: Alert time */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono uppercase text-[10px] mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Alert time:</span>
          </div>
          <div>
            <div className="text-sm font-bold font-mono text-amber-300">
              {alertTime} UTC
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Initial Dual-Sensor Trigger
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
