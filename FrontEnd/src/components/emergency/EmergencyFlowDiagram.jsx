import React from 'react';
import {
  HeartPulse,
  Clock,
  Radio,
  Navigation,
  Activity,
  BellRing,
  CheckCircle2,
  Ambulance,
  MapPin,
  FileCheck2,
  ArrowDown,
  ArrowRight,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const STAGE_ICONS = {
  SUSPECTED: HeartPulse,
  CONFIRMATION: Clock,
  EMERGENCY_ALERT: Radio,
  GPS_LOCATION: Navigation,
  PATIENT_VITALS: Activity,
  RESPONDER_NOTIFICATION: BellRing,
  RESPONDER_ACKNOWLEDGEMENT: CheckCircle2,
  RESPONDER_EN_ROUTE: Ambulance,
  ARRIVAL: MapPin,
  HANDOVER: FileCheck2
};

export const EmergencyFlowDiagram = ({
  stages = [],
  currentStageIndex = 0,
  onSelectStage,
  className = ''
}) => {
  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Autonomous Emergency Response Sequence
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              Intended 10-Stage Resuscitation & Dispatch Lifecycle
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500 uppercase">Current Progress:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold border border-red-300 dark:border-red-800">
            Stage {currentStageIndex + 1} of 10 ({stages[currentStageIndex]?.label || 'Active'})
          </span>
        </div>
      </div>

      {/* 10-Stage Sequential Vertical / Responsive Flow */}
      <div className="space-y-1 relative max-w-2xl mx-auto py-2">
        {stages.map((stage, index) => {
          const IconComponent = STAGE_ICONS[stage.key] || Activity;
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;
          const isLast = index === stages.length - 1;

          return (
            <React.Fragment key={stage.id || index}>
              <div
                onClick={() => onSelectStage && onSelectStage(index)}
                className={`p-3 rounded-lg border transition-all cursor-pointer select-none flex items-center justify-between ${
                  isCurrent
                    ? 'bg-red-500/10 dark:bg-red-950/40 border-red-500 text-gray-900 dark:text-white shadow-sm ring-2 ring-red-400/40 scale-[1.01]'
                    : isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-gray-900 dark:text-gray-200'
                    : 'bg-surface-light dark:bg-surface-dark border-surface-borderLight dark:border-surface-borderDark text-gray-500 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Step Badge / Icon */}
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                    isCurrent
                      ? 'bg-red-600 text-white animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-surface-mutedLight dark:bg-surface-mutedDark text-gray-500'
                  }`}>
                    <IconComponent className="h-4 w-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase opacity-75">
                        Stage {index + 1}:
                      </span>
                      <h4 className="text-xs font-bold font-sans">
                        {stage.label}
                      </h4>
                    </div>
                    <p className="text-[11px] opacity-75 font-sans mt-0.5 line-clamp-1 sm:line-clamp-none">
                      {stage.desc}
                    </p>
                  </div>
                </div>

                {/* State Tag */}
                <div className="shrink-0 font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border">
                  {isCurrent ? (
                    <span className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/60 border-red-300">
                      ● IN PROGRESS
                    </span>
                  ) : isCompleted ? (
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300">
                      ✓ COMPLETE
                    </span>
                  ) : (
                    <span className="text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-300">
                      QUEUED
                    </span>
                  )}
                </div>
              </div>

              {/* Flow Connector Arrow (↓) */}
              {!isLast && (
                <div className="flex items-center justify-center py-0.5">
                  <div className={`flex items-center gap-1 font-mono text-xs font-black ${
                    isCompleted ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-red-500 animate-bounce' : 'text-gray-300 dark:text-gray-700'
                  }`}>
                    <ArrowDown className="h-4 w-4" />
                    <span className="text-[9px] uppercase font-mono tracking-widest opacity-60">Flow</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default EmergencyFlowDiagram;
