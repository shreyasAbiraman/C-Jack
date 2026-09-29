import React, { useState } from 'react';
import {
  AlertOctagon,
  Square,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Cpu,
  Radio,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import ConfirmationDialog from '../ui/ConfirmationDialog';

export const CprSafetyPanel = ({
  cprState = 'IDLE',
  safety = {},
  onEmergencyStop,
  onRoutineStop,
  onToggleManualOverride,
  className = ''
}) => {
  const [isConfirmingRoutineStop, setIsConfirmingRoutineStop] = useState(false);
  const [isConfirmingManualOverride, setIsConfirmingManualOverride] = useState(false);

  const isCprActive = cprState === 'CPR_ACTIVE' || cprState === 'PAUSED';
  const isManualOverride = safety?.manualOverride || cprState === 'MANUAL_OVERRIDE';
  const isEmergencyStopped = safety?.emergencyStopped;

  // Fault states
  const deviceFault = safety?.deviceFault;
  const sensorFault = safety?.sensorFault;
  const motorFault = safety?.motorFault || 'Nominal';

  const handleRoutineStopClick = () => {
    setIsConfirmingRoutineStop(true);
  };

  const handleConfirmRoutineStop = () => {
    setIsConfirmingRoutineStop(false);
    if (onRoutineStop) {
      onRoutineStop();
    }
  };

  const handleManualOverrideClick = () => {
    if (isManualOverride) {
      // Disarming manual override directly
      onToggleManualOverride && onToggleManualOverride(false);
    } else {
      // Arming manual override requires confirmation
      setIsConfirmingManualOverride(true);
    }
  };

  const handleConfirmManualOverride = () => {
    setIsConfirmingManualOverride(false);
    if (onToggleManualOverride) {
      onToggleManualOverride(true);
    }
  };

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Safety Interlocks & Actuator Controls
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              IEC 60601-1 Life Support Safety Protocols
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500 uppercase">Emergency E-Stop Status:</span>
          {isEmergencyStopped ? (
            <span className="font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded border border-red-300">
              TRIPPED
            </span>
          ) : (
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300">
              ARMED & READY
            </span>
          )}
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* =========================================================================
            1. EMERGENCY STOP BUTTON (HIGH-VISIBILITY HAZARD-STRIPED, NO CONFIRMATION)
            ========================================================================= */}
        <div className="p-4 rounded-xl border-2 border-red-600 bg-gradient-to-br from-red-600/10 via-red-500/5 to-transparent flex flex-col justify-between relative overflow-hidden">
          {/* Subtle diagonal warning stripe accent */}
          <div className="absolute top-0 right-0 w-24 h-6 bg-red-600/20 transform rotate-12 translate-x-6 -translate-y-2 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-red-600 dark:text-red-400">
                CRITICAL ZERO-LATENCY INTERLOCK
              </span>
              <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            </div>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase font-mono">
              Emergency Actuator Cutoff
            </h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 font-sans mt-1">
              Instantly severs motor power and dumps all pneumatic pressure to 0 Bar. <strong>No confirmation required.</strong>
            </p>
          </div>

          <button
            onClick={onEmergencyStop}
            className="mt-4 w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <AlertOctagon className="h-5 w-5 animate-pulse" />
            EMERGENCY STOP (E-STOP)
          </button>
        </div>

        {/* =========================================================================
            2. ROUTINE STOP / PAUSE (REQUIRES CONFIRMATION MODAL)
            ========================================================================= */}
        <div className="p-4 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                ORDERLY RESUSCITATION CESSATION
              </span>
              <Square className="h-4 w-4 text-gray-500 shrink-0" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase font-mono">
              Routine CPR Stop
            </h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 font-sans mt-1">
              Stops automated compressions in an orderly fashion at the completion of a full cycle. <strong>Confirmation required.</strong>
            </p>
          </div>

          <button
            onClick={handleRoutineStopClick}
            disabled={!isCprActive}
            className="mt-4 w-full py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Square className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            Stop CPR (Requires Confirmation)
          </button>
        </div>

        {/* =========================================================================
            3. MANUAL OVERRIDE TOGGLE
            ========================================================================= */}
        <div className="p-4 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                CLINICAL OPERATOR CONTROL
              </span>
              <Sliders className="h-4 w-4 text-purple-500 shrink-0" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase font-mono">
              Manual Override Status
            </h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 font-sans mt-1">
              Transfers full tactile control to the on-scene paramedic or clinical responder.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleManualOverrideClick}
              className={`flex-1 py-2.5 px-3 rounded-lg font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${
                isManualOverride
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700'
                  : 'bg-surface-light dark:bg-surface-dark border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <Sliders className="h-4 w-4" />
              {isManualOverride ? 'Disengage Override' : 'Engage Manual Override'}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FAULT MONITORING MATRIX
          ========================================================================= */}
      <div className="mt-4 pt-4 border-t border-surface-borderLight dark:border-surface-borderDark">
        <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase font-mono mb-2 flex items-center gap-2">
          <span>Subsystem Fault Surveillance Matrix</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Device Fault */}
          <div className={`p-3 rounded-lg border text-xs flex items-center justify-between font-mono ${
            deviceFault
              ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300'
              : 'bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 border-surface-borderLight dark:border-surface-borderDark text-gray-700 dark:text-gray-300'
          }`}>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cjack-accent" />
              <span>DEVICE BUS FAULT:</span>
            </div>
            <span className={`font-bold uppercase ${deviceFault ? 'text-red-600 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {deviceFault ? 'FAULT DETECTED' : 'NOMINAL'}
            </span>
          </div>

          {/* Sensor Fault */}
          <div className={`p-3 rounded-lg border text-xs flex items-center justify-between font-mono ${
            sensorFault
              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
              : 'bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 border-surface-borderLight dark:border-surface-borderDark text-gray-700 dark:text-gray-300'
          }`}>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cjack-accent" />
              <span>SENSOR ARRAY FAULT:</span>
            </div>
            <span className={`font-bold uppercase ${sensorFault ? 'text-amber-600 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {sensorFault ? 'FAULT / DETACHED' : 'NOMINAL'}
            </span>
          </div>

          {/* Motor Fault */}
          <div className={`p-3 rounded-lg border text-xs flex items-center justify-between font-mono ${
            motorFault !== 'Nominal'
              ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300'
              : 'bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 border-surface-borderLight dark:border-surface-borderDark text-gray-700 dark:text-gray-300'
          }`}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cjack-accent" />
              <span>MOTOR ACTUATOR FAULT:</span>
            </div>
            <span className={`font-bold uppercase ${
              motorFault === 'Stalled'
                ? 'text-red-600 animate-pulse'
                : motorFault === 'Overheated'
                ? 'text-amber-600'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {String(motorFault || 'Nominal').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Routine Stop Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmingRoutineStop}
        onClose={() => setIsConfirmingRoutineStop(false)}
        onConfirm={handleConfirmRoutineStop}
        title="Confirm Halting Automated CPR"
        message="Are you sure you wish to stop automated sternal compressions? The patient may still be in cardiac arrest. Ensure manual chest compressions or defibrillation can begin immediately."
        confirmText="Yes, Halt Compressions"
        cancelText="Cancel (Continue CPR)"
        severity="CRITICAL"
      />

      {/* Manual Override Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmingManualOverride}
        onClose={() => setIsConfirmingManualOverride(false)}
        onConfirm={handleConfirmManualOverride}
        title="Engage Manual Responder Override"
        message="Autonomous closed-loop PID control will be bypassed. The on-scene rescuer assumes full manual control of compression duty cycles. Confirm operator authorization?"
        confirmText="Engage Manual Override"
        cancelText="Maintain Automated Control"
        severity="WARNING"
      />
    </div>
  );
};

export default CprSafetyPanel;
