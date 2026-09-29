import React from 'react';
import {
  FilePlus,
  Send,
  Radio,
  CheckCircle2,
  UserCheck,
  Ambulance,
  MapPin,
  XCircle,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

const ALERT_STATE_CONFIG = {
  CREATED: {
    label: 'CREATED',
    desc: 'Emergency event created locally in vest firmware; sensor trigger validated.',
    icon: FilePlus,
    color: 'bg-amber-500 text-white border-amber-600',
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
  },
  SENDING: {
    label: 'SENDING',
    desc: 'Formatting telemetry payload and broadcasting over LoRa SF7 / 4G LTE-M.',
    icon: Send,
    color: 'bg-sky-500 text-white border-sky-600 animate-pulse',
    badge: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 border-sky-300'
  },
  SENT: {
    label: 'SENT',
    desc: 'Packets radiated through RF stage; awaiting municipal gateway ACK token.',
    icon: Radio,
    color: 'bg-indigo-500 text-white border-indigo-600',
    badge: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300'
  },
  ACKNOWLEDGED: {
    label: 'ACKNOWLEDGED',
    desc: 'Central EMS dispatch confirmed receipt with cryptographic packet ACK.',
    icon: CheckCircle2,
    color: 'bg-emerald-600 text-white border-emerald-700',
    badge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
  },
  RESPONDER_ASSIGNED: {
    label: 'RESPONDER ASSIGNED',
    desc: 'Advanced Life Support unit ALS-MED-04 allocated to patient incident.',
    icon: UserCheck,
    color: 'bg-purple-600 text-white border-purple-700',
    badge: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-300'
  },
  EN_ROUTE: {
    label: 'EN ROUTE',
    desc: 'Ambulance code-3 high-speed transit with sirens active; GPS telemetry tracking.',
    icon: Ambulance,
    color: 'bg-blue-600 text-white border-blue-700 animate-pulse',
    badge: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
  },
  ARRIVED: {
    label: 'ARRIVED',
    desc: 'ALS paramedics physically on scene; initiating resuscitation handoff.',
    icon: MapPin,
    color: 'bg-teal-600 text-white border-teal-700',
    badge: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 border-teal-300'
  },
  CANCELLED: {
    label: 'CANCELLED',
    desc: 'Incident cancelled by on-scene clinician or verified false alarm stand-down.',
    icon: XCircle,
    color: 'bg-gray-600 text-white border-gray-700',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300'
  },
  FAILED: {
    label: 'FAILED',
    desc: 'RF link timeout or transmission failure. Fallback radio channels engaged.',
    icon: AlertTriangle,
    color: 'bg-rose-600 text-white border-rose-700 animate-pulse',
    badge: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
  }
};

const ALL_ALERT_STATES = [
  'CREATED',
  'SENDING',
  'SENT',
  'ACKNOWLEDGED',
  'RESPONDER_ASSIGNED',
  'EN_ROUTE',
  'ARRIVED',
  'CANCELLED',
  'FAILED'
];

export const AlertStateMachineDisplay = ({
  currentState = 'CREATED',
  onTransition,
  className = ''
}) => {
  const currentKey = String(currentState || 'CREATED').toUpperCase();
  const activeCfg = ALERT_STATE_CONFIG[currentKey] || ALERT_STATE_CONFIG.CREATED;
  const ActiveIcon = activeCfg.icon;

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cjack-accent" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Alert State Machine Architecture
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              Deterministic 9-State LoRaWAN / Cellular Dispatch Finite State Machine
            </span>
          </div>
        </div>

        {/* Current State Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-extrabold uppercase shadow-xs ${activeCfg.color}`}>
          <ActiveIcon className="h-4 w-4 shrink-0" />
          <span>CURRENT: {activeCfg.label}</span>
        </div>
      </div>

      {/* Active State Description */}
      <div className="p-3 rounded-lg bg-surface-mutedLight dark:bg-surface-mutedDark border border-surface-borderLight dark:border-surface-borderDark mb-4 flex items-start gap-3">
        <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${activeCfg.color}`}>
          <ActiveIcon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono">
            Alert State [{currentKey}]: {activeCfg.label}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-sans mt-0.5">
            {activeCfg.desc}
          </p>
        </div>
      </div>

      {/* 9-State Pipeline Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ALL_ALERT_STATES.map((st) => {
          const cfg = ALERT_STATE_CONFIG[st];
          const Icon = cfg.icon;
          const isActive = st === currentKey;

          return (
            <button
              key={st}
              onClick={() => onTransition && onTransition(st)}
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all select-none cursor-pointer ${
                isActive
                  ? `${cfg.color} shadow-md scale-[1.02]`
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
                {isActive ? '● CURRENT ALERT' : 'Click to Set'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlertStateMachineDisplay;
