import React from 'react';
import {
  Clock,
  Activity,
  Radio,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Navigation,
  Ambulance,
  PhoneCall,
  FileCheck2
} from 'lucide-react';

export const EmergencyTimeline = ({ events = [], className = '' }) => {
  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-cjack-accent" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Chronological Incident Event Timeline
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              Timestamped Audit Log of Resuscitation & Dispatch Milestones
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-gray-400 bg-surface-mutedLight dark:bg-surface-mutedDark px-2 py-0.5 rounded border border-surface-borderLight dark:border-surface-borderDark">
          Simulated Synced Timestamps
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-borderLight dark:before:bg-surface-borderDark">
        {events && events.length > 0 ? (
          events.map((event, index) => {
            const isCritical = event.severity === 'CRITICAL';
            const isWarning = event.severity === 'WARNING';

            return (
              <div key={event.id || index} className="relative group">
                {/* Node Dot */}
                <span
                  className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-surface-light dark:border-surface-dark ${
                    isCritical
                      ? 'bg-red-500 animate-pulse'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />

                <div className={`p-3 rounded-lg border transition-all ${
                  isCritical
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                    : isWarning
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                    : 'bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 border-surface-borderLight dark:border-surface-borderDark'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-extrabold text-xs text-cjack-accent">
                        {event.time}
                      </span>
                      <span className="text-gray-400 dark:text-gray-600">—</span>
                      <span className="font-bold text-xs text-gray-900 dark:text-white">
                        {event.title}
                      </span>
                    </div>

                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border self-start sm:self-auto ${
                      isCritical
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                    }`}>
                      {event.stage || 'EVENT'}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-sans leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs font-mono text-gray-400 py-3">
            No incident events recorded yet. Standby surveillance active.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyTimeline;
