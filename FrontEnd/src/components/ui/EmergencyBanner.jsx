import React from 'react';
import { AlertOctagon, ShieldAlert, ArrowRight } from 'lucide-react';

export const EmergencyBanner = ({
  active = false,
  title = "CARDIAC ARREST DETECTED",
  message = "Multi-sensor cross validation confirmed loss of pulsatile flow. Automated CPR armed.",
  actionText = "Open Emergency Console",
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = ''
}) => {
  if (!active) return null;

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className={`bg-red-600 text-white px-4 py-3 border-b border-red-800 shadow-md ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-white/20 rounded-md shrink-0">
            <AlertOctagon className="h-6 w-6 text-white animate-pulse" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-white text-red-700 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                CRITICAL STATE
              </span>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                {title}
              </h2>
            </div>
            <p className="text-xs text-red-100 font-sans leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {secondaryActionText && (
            <button
              onClick={onSecondaryAction}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-red-700/80 hover:bg-red-800 text-white transition-colors"
            >
              {secondaryActionText}
            </button>
          )}
          {actionText && (
            <button
              onClick={onAction}
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-white text-red-700 hover:bg-red-50 shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>{actionText}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default EmergencyBanner;
