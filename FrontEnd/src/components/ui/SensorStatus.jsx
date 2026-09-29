import React from 'react';
import { Activity, Zap, Gauge, Heart, Wind, ShieldCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const SensorStatus = ({
  sensors = [
    { id: 'ecg', name: 'Dual-Lead ECG (AD8232)', metric: 'Lead-II Active', status: 'NORMAL', explanation: 'Continuous electrode contact verified' },
    { id: 'ppg', name: 'Pulse Oximeter (MAX30102)', metric: 'Optical SNR 42dB', status: 'NORMAL', explanation: 'Red/IR pulsatile signal optimal' },
    { id: 'encoder', name: 'Linear Depth Encoder', metric: 'Stroke 52mm', status: 'NORMAL', explanation: 'Optical quadrature feedback calibrated' },
    { id: 'loadcell', name: 'Sternal Load Cells', metric: 'Peak 410 N', status: 'NORMAL', explanation: 'Dual wheatstone bridge balanced' },
    { id: 'pneumatic', name: 'Pressure Transducer', metric: '5.2 BAR', status: 'NORMAL', explanation: 'Actuator chamber within nominal bounds' },
    { id: 'resp', name: 'Thoracic Accelerometer', metric: '16 BPM', status: 'NORMAL', explanation: 'Respiratory motion continuous' }
  ],
  className = ''
}) => {
  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <ShieldCheck className="h-4 w-4 text-cjack-accent" />
          <span>Biometric & Actuator Sensor Array</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">6 CHANNELS ONLINE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className="p-3 rounded border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 flex flex-col justify-between text-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white truncate">
                  {sensor.name}
                </span>
                <StatusBadge status={sensor.status} size="sm" />
              </div>
              <div className="text-xs font-mono font-bold text-cjack-accent">
                {sensor.metric}
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 font-sans leading-tight">
              {sensor.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorStatus;
