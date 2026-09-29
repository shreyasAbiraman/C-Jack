import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Radio, 
  Ambulance, 
  MapPin, 
  FileCheck2,
  RefreshCw
} from 'lucide-react';

/**
 * ResponderStateStepper
 * 
 * Implements the 6-state responder lifecycle:
 * AVAILABLE -> ASSIGNED -> ACKNOWLEDGED -> EN_ROUTE -> ARRIVED -> HANDOVER_COMPLETE
 */
export const ResponderStateStepper = ({
  currentState = 'EN_ROUTE',
  onTransitionState
}) => {
  const steps = [
    {
      id: 'AVAILABLE',
      label: 'AVAILABLE',
      icon: Radio,
      desc: 'Unit on standby at sub-station, ready for emergency dispatch',
      badge: 'STANDBY'
    },
    {
      id: 'ASSIGNED',
      label: 'ASSIGNED',
      icon: Clock,
      desc: 'Municipal dispatch assigned unit ALS-MED-04 to cardiac arrest',
      badge: 'DISPATCHED'
    },
    {
      id: 'ACKNOWLEDGED',
      label: 'ACKNOWLEDGED',
      icon: CheckCircle2,
      desc: 'Paramedic crew verified incident details and armed telemetry',
      badge: 'CREW ACK'
    },
    {
      id: 'EN_ROUTE',
      label: 'EN_ROUTE',
      icon: Ambulance,
      desc: 'Rolling with sirens and beacon (Code 3); live GPS trajectory',
      badge: 'CODE 3'
    },
    {
      id: 'ARRIVED',
      label: 'ARRIVED',
      icon: MapPin,
      desc: 'On scene at patient coordinates; establishing direct clinical contact',
      badge: 'ON SCENE'
    },
    {
      id: 'HANDOVER_COMPLETE',
      label: 'HANDOVER_COMPLETE',
      icon: FileCheck2,
      desc: 'Patient and telemetry log formally handed over to hospital trauma bay',
      badge: 'TRANSFERRED'
    }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentState);
  const activeIndex = currentIndex !== -1 ? currentIndex : 3;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              6-State Responder Progression Machine
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-950 text-amber-300 border border-amber-800/50 font-mono">
              ALS DISPATCH
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ambulance operational lifecycle from dispatch allocation to clinical hospital handover.
          </p>
        </div>

        {/* Quick Transition Advance Button */}
        {onTransitionState && (
          <div className="flex items-center gap-2">
            {activeIndex < steps.length - 1 && (
              <button
                onClick={() => onTransitionState(steps[activeIndex + 1].id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-sm"
              >
                <span>Advance to {steps[activeIndex + 1].label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onTransitionState('AVAILABLE')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Reset to Available"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 6 Stepper Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = idx === activeIndex;
          const isPast = idx < activeIndex;
          const isFuture = idx > activeIndex;

          return (
            <div
              key={step.id}
              onClick={() => onTransitionState && onTransitionState(step.id)}
              className={`p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 flex flex-col justify-between ${
                isCurrent
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50 scale-[1.02]'
                  : isPast
                  ? 'bg-slate-900/90 border-slate-700/60 hover:border-slate-600'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-60 hover:opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isCurrent 
                      ? 'bg-amber-500 text-slate-950' 
                      : isPast
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : 'bg-slate-900 text-slate-500'
                  }`}>
                    0{idx + 1}
                  </span>

                  {isCurrent && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                  {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`p-1.5 rounded-lg ${
                    isCurrent 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : isPast 
                      ? 'bg-slate-800 text-emerald-400' 
                      : 'bg-slate-900 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-wide font-mono">
                    {step.label}
                  </h4>
                </div>

                <p className="text-[10px] text-slate-400 leading-snug line-clamp-3">
                  {step.desc}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                <span className={`text-[9px] font-mono uppercase tracking-wider block ${
                  isCurrent ? 'text-amber-300 font-bold' : isPast ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {step.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
