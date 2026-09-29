import React from 'react';
import { ShieldCheck, Wifi, WifiOff, AlertTriangle, Activity, Zap, Gauge, Heart, Wind } from 'lucide-react';

export const SensorHealthPanel = ({
  sensors = [
    { id: 'ecg_lead2', name: 'Lead-II ECG (AD8232)', type: 'Electrodes', status: 'Simulated', source: 'Simulation', details: 'Impedance 48 kΩ' },
    { id: 'max30102', name: 'Pulse Oximeter (MAX30102)', type: 'Optical PPG', status: 'Simulated', source: 'Simulation', details: 'PI 4.2% • SNR 42dB' },
    { id: 'piezo_resp', name: 'Thoracic Respiration', type: 'Piezo Strain', status: 'Simulated', source: 'Simulation', details: 'Continuous Waveform' },
    { id: 'imu_motion', name: '6-Axis IMU (MPU6050)', type: 'Motion Sensor', status: 'Simulated', source: 'Simulation', details: 'Resting Vector Stable' },
    { id: 'depth_encoder', name: 'Sternal Depth Encoder', type: 'Optical Quadrature', status: 'Simulated', source: 'Simulation', details: 'Zero-Point Calibrated' },
    { id: 'load_cells', name: 'Compression Load Cells', type: 'Wheatstone Transducer', status: 'Simulated', source: 'Simulation', details: 'Dual Channels Balanced' }
  ],
  overallHealth = 'OPTIMAL (100%)',
  className = ''
}) => {
  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'connected') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Connected
        </span>
      );
    }
    if (s === 'disconnected') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
          Disconnected
        </span>
      );
    }
    if (s === 'signal weak') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Signal Weak
        </span>
      );
    }
    if (s === 'signal invalid') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          Signal Invalid
        </span>
      );
    }
    // Default simulated
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        Simulated
      </span>
    );
  };

  const getSourceBadge = (source) => {
    if (source === 'Hardware') {
      return (
        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Hardware
        </span>
      );
    }
    if (source === 'Unavailable') {
      return (
        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300">
          Unavailable
        </span>
      );
    }
    return (
      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
        Simulation
      </span>
    );
  };

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 ${className}`}>
      {/* Header with Overall Health Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-cjack-accent" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Sensor Health & Integrity Surveillance
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              6 Biometric & Mechanical Channels Supervised
            </span>
          </div>
        </div>

        {/* Overall Sensor Health Indicator */}
        <div className="flex items-center gap-2 bg-surface-mutedLight dark:bg-surface-mutedDark px-3 py-1.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark self-start sm:self-auto font-mono text-xs">
          <span className="text-gray-500 uppercase">Overall Array Health:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {overallHealth}
          </span>
        </div>
      </div>

      {/* Grid of Sensors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sensors.map((s) => (
          <div
            key={s.id}
            className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 flex flex-col justify-between text-xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white leading-tight">
                  {s.name}
                </h4>
                <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                  Type: {s.type}
                </span>
              </div>
              <div className="shrink-0">
                {getStatusBadge(s.status)}
              </div>
            </div>

            <div className="pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] font-mono">
              <span className="text-gray-500 truncate max-w-[140px]" title={s.details}>
                {s.details || 'Continuous Sampling'}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400">Source:</span>
                {getSourceBadge(s.source || 'Simulation')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorHealthPanel;
