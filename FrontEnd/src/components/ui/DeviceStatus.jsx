import React from 'react';
import { Cpu, Gauge, Wind, Thermometer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const DeviceStatus = ({
  device = {
    deviceId: 'CJACK-UNIT-TX104',
    firmwareVersion: 'v0.9.4-alpha',
    hardwareModel: 'CJack Wearable Vest rev.3',
    actuatorPressureBar: 5.2,
    ambientAirPumpStatus: 'Standby',
    internalTempCelsius: 32.4,
    selfTestPassed: true
  },
  className = ''
}) => {
  const status = device.selfTestPassed ? 'NORMAL' : 'WARNING';

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Cpu className="h-4 w-4 text-cjack-accent" />
          <span>Vest Hardware Diagnostics</span>
        </div>
        <StatusBadge status={status} size="sm" text={device.selfTestPassed ? 'SELF-TEST OK' : 'ATTENTION'} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
        <div className="p-2 rounded bg-surface-mutedLight/50 dark:bg-surface-mutedDark/40">
          <span className="text-[10px] text-gray-500 block uppercase">Pneumatic Chamber</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Gauge className="h-3.5 w-3.5 text-cjack-accent" />
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {device.actuatorPressureBar} BAR
            </span>
          </div>
        </div>

        <div className="p-2 rounded bg-surface-mutedLight/50 dark:bg-surface-mutedDark/40">
          <span className="text-[10px] text-gray-500 block uppercase">Ambient Air Assist</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Wind className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {device.ambientAirPumpStatus}
            </span>
          </div>
        </div>

        <div className="p-2 rounded bg-surface-mutedLight/50 dark:bg-surface-mutedDark/40">
          <span className="text-[10px] text-gray-500 block uppercase">MCU Temperature</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Thermometer className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {device.internalTempCelsius}°C
            </span>
          </div>
        </div>

        <div className="p-2 rounded bg-surface-mutedLight/50 dark:bg-surface-mutedDark/40">
          <span className="text-[10px] text-gray-500 block uppercase">Firmware / Model</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cjack-accent" />
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
              {device.firmwareVersion}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatus;
