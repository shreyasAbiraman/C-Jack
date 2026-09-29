// Canonical Semantic Status Definitions
export * from './statusTokens';

// Reusable Medical IoT Component Suite
export { default as StatusBadge } from './StatusBadge';
export { default as VitalCard } from './VitalCard';
export { default as MetricCard } from './VitalCard'; // Alias for compatibility
export { default as EmergencyBanner } from './EmergencyBanner';
export { default as PatientCard } from './PatientCard';
export { default as DeviceStatus } from './DeviceStatus';
export { default as ConnectionStatus } from './ConnectionStatus';
export { default as BatteryIndicator } from './BatteryIndicator';
export { default as GPSIndicator } from './GPSIndicator';
export { default as CPRStatus } from './CPRStatus';
export { default as CompressionCounter } from './CompressionCounter';
export { default as HeartRateDisplay } from './HeartRateDisplay';
export { default as SpO2Display } from './SpO2Display';
export { default as CompressionRateDisplay } from './CompressionRateDisplay';
export { default as CompressionDepthDisplay } from './CompressionDepthDisplay';
export { default as AlertCard } from './AlertCard';
export { default as Timeline } from './Timeline';
export { default as MapContainer } from './MapContainer';
export { default as SensorStatus } from './SensorStatus';
export { default as VoiceGuidancePanel } from './VoiceGuidancePanel';
export { default as Modal } from './Modal';
export { default as ConfirmationDialog } from './ConfirmationDialog';
export { default as LoadingState } from './LoadingState';
export { default as LoadingSpinner } from './LoadingState'; // Alias for compatibility
export { default as EmptyState } from './EmptyState';
export { default as ErrorState } from './ErrorState';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as TrendGraph } from './TrendGraph';
export { default as PageStateWrapper } from './PageStateWrapper';
// Base UI Primitives (Card, Button, SectionHeader, etc. for backward compatibility)

import React from 'react';
import { Info, RefreshCw } from 'lucide-react';

export const Card = ({ children, className = '', highlight = false }) => (
  <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border ${highlight
      ? 'border-red-500 shadow-md shadow-red-500/10'
      : 'border-surface-borderLight dark:border-surface-borderDark shadow-xs'
    } p-4 sm:p-5 transition-all ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-surface-borderLight dark:border-surface-borderDark pb-3 mb-4 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, icon: Icon, className = '' }) => (
  <h3 className={`text-sm sm:text-base font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2 ${className}`}>
    {Icon && <Icon className="h-4 w-4 text-cjack-accent" />}
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`${className}`}>{children}</div>
);

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  id,
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2.5',
  };

  const variants = {
    primary: 'bg-cjack-primary hover:bg-cjack-primaryHover text-white shadow-xs',
    emergency: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
    safe: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
    outline: 'border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-surface-dark hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark text-gray-800 dark:text-gray-200',
    ghost: 'hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark text-gray-700 dark:text-gray-300',
  };

  return (
    <button
      type={type}
      id={id}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      className={`${base} ${sizes[size]} ${variants[variant]} focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cjack-primary dark:focus-visible:ring-blue-400 ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
};

export const SimulationDisclaimer = () => (
  <div
    className="bg-slate-950 text-slate-300 text-[11px] font-mono px-4 py-1 flex items-center justify-between border-b border-slate-800/80"
    role="note"
    aria-label="Simulation mode disclaimer"
  >
    <div className="flex items-center gap-2">
      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
        SIMULATED
      </span>
      <span className="truncate max-w-[220px] sm:max-w-md text-slate-400">
        Prototype: Synthetic telemetry only — not real patient data.
      </span>
    </div>
    <div className="hidden lg:flex items-center gap-3 text-slate-500 text-[10px]">
      <span>ESP32 + T-BEAM LORA</span>
      <span>FW v0.9.4</span>
    </div>
  </div>
);

export const SectionHeader = ({
  title,
  question,
  statusBadge,
  actions,
  as: HeadingTag = 'h2',
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 mb-5 border-b border-surface-borderLight dark:border-surface-borderDark">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <HeadingTag className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
          {title}
        </HeadingTag>
        {statusBadge && <div className="shrink-0">{statusBadge}</div>}
      </div>
      {question && (
        <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Info className="h-3 w-3 shrink-0 text-cjack-accent" aria-hidden="true" />
          <span className="uppercase tracking-wider font-semibold text-[10px]">Query:</span>
          <span className="truncate">{question}</span>
        </p>
      )}
    </div>
    {actions && (
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        {actions}
      </div>
    )}
  </div>
);

