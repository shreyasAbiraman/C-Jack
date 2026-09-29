import React from 'react';
import {
  Power,
  Activity,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Sliders,
  AlertOctagon,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const STATE_CONFIG = {
  IDLE: {
    label: 'IDLE',
    desc: 'System disarmed on standby. Sternal actuator at home zero position.',
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    activeColor: 'bg-slate-700 text-white border-slate-600 ring-2 ring-slate-400',
    icon: Power,
    severity: 'neutral'
  },
  MONITORING: {
    label: 'MONITORING',
    desc: 'Passive biometric vitals surveillance. Algorithms scanning for cardiac arrest.',
    color: 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    activeColor: 'bg-sky-600 text-white border-sky-500 ring-2 ring-sky-400',
    icon: Activity,
    severity: 'info'
  },
  SUSPECTED_ARREST: {
    label: 'SUSPECTED ARREST',
    desc: 'ECG asystole / VFib / pulselessness trigger detected. Verification initiated.',
    color: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    activeColor: 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-400 animate-pulse',
    icon: AlertTriangle,
    severity: 'warning'
  },
  CONFIRMING: {
    label: 'CONFIRMING',
    desc: 'Dual-sensor validation countdown (3s). Pre-charging pneumatic compression valves.',
    color: 'bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    activeColor: 'bg-orange-600 text-white border-orange-500 ring-2 ring-orange-400 animate-pulse',
    icon: Clock,
    severity: 'warning'
  },
  CPR_ACTIVE: {
    label: 'CPR ACTIVE',
    desc: 'Automated closed-loop sternal compressions actively cycling at target cadence.',
    color: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800',
    activeColor: 'bg-red-600 text-white border-red-500 ring-4 ring-red-400/50 animate-pulse',
    icon: Play,
    severity: 'critical'
  },
  PAUSED: {
    label: 'PAUSED',
    desc: 'Actuators paused for ECG analysis rhythm check or manual airway ventilation.',
    color: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    activeColor: 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-400',
    icon: Pause,
    severity: 'warning'
  },
  STOPPED: {
    label: 'STOPPED',
    desc: 'Actuation halted cleanly. Pneumatic chamber pressure vented to atmosphere.',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700',
    activeColor: 'bg-gray-700 text-white border-gray-600 ring-2 ring-gray-400',
    icon: Square,
    severity: 'neutral'
  },
  RECOVERY: {
    label: 'RECOVERY (ROSC)',
    desc: 'Return of Spontaneous Circulation confirmed. Actuators disarmed to ROSC hold.',
    color: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    activeColor: 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400',
    icon: CheckCircle2,
    severity: 'safe'
  },
  MANUAL_OVERRIDE: {
    label: 'MANUAL OVERRIDE',
    desc: 'Autonomous algorithm bypassed. Sternal actuators under manual responder command.',
    color: 'bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    activeColor: 'bg-purple-700 text-white border-purple-600 ring-2 ring-purple-400',
    icon: Sliders,
    severity: 'warning'
  },
  ERROR: {
    label: 'SYSTEM ERROR',
    desc: 'Hardware fault trip, actuator stall, or lead detachment. Manual CPR required.',
    color: 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    activeColor: 'bg-rose-700 text-white border-rose-600 ring-4 ring-rose-500 animate-pulse',
    icon: AlertOctagon,
    severity: 'critical'
  }
};

export const CprStateMachineDisplay = ({
  currentState = 'IDLE',
  onTransition,
  className = ''
}) => {
  const currentKey = String(currentState || 'IDLE').toUpperCase().replace(/\s+/g, '_');
  const activeConfig = STATE_CONFIG[currentKey] || STATE_CONFIG.IDLE;
  const ActiveIcon = activeConfig.icon;

  const statesList = [
    'IDLE',
    'MONITORING',
    'SUSPECTED_ARREST',
    'CONFIRMING',
    'CPR_ACTIVE',
    'PAUSED',
    'STOPPED',
    'RECOVERY',
    'MANUAL_OVERRIDE',
    'ERROR'
  ];

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-cjack-accent" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              CPR State Machine Architecture
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              Deterministic 10-State Resuscitation Finite State Machine (FSM)
            </span>
          </div>
        </div>

        {/* Current Active State Dominant Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-extrabold uppercase shadow-xs ${activeConfig.activeColor}`}>
          <ActiveIcon className="h-4 w-4 shrink-0" />
          <span>CURRENT: {activeConfig.label}</span>
        </div>
      </div>

      {/* State Active Description Banner */}
      <div className="p-3 rounded-lg bg-surface-mutedLight dark:bg-surface-mutedDark border border-surface-borderLight dark:border-surface-borderDark mb-4 flex items-start gap-3">
        <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${activeConfig.activeColor}`}>
          <ActiveIcon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">
            State [{currentKey}]: {activeConfig.label}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-sans mt-0.5">
            {activeConfig.desc}
          </p>
        </div>
      </div>

      {/* 10-State Pipeline Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {statesList.map((st) => {
          const cfg = STATE_CONFIG[st];
          const Icon = cfg.icon;
          const isActive = st === currentKey;

          return (
            <button
              key={st}
              onClick={() => onTransition && onTransition(st)}
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all select-none ${
                isActive
                  ? `${cfg.activeColor} shadow-md scale-[1.02]`
                  : 'bg-surface-light dark:bg-surface-dark border-surface-borderLight dark:border-surface-borderDark hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full mb-1.5">
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-white animate-ping shrink-0" />
                )}
              </div>
              <span className={`text-[11px] font-mono font-bold leading-tight uppercase ${
                isActive ? 'text-white' : 'text-gray-800 dark:text-gray-200'
              }`}>
                {cfg.label}
              </span>
              <span className={`text-[9px] font-mono mt-1 ${
                isActive ? 'text-white/80' : 'text-gray-500'
              }`}>
                {isActive ? '● ACTIVE STATE' : 'Click to Shift'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CprStateMachineDisplay;
