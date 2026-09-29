import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export const EmptyState = ({
  title = "No Telemetry Data Available",
  description = "No active sensor stream detected on this channel. Verify vest electrode connection.",
  icon: Icon = Activity,
  actionText,
  onAction,
  className = ""
}) => {
  return (
    <div className={`p-8 text-center rounded-lg border border-dashed border-surface-borderLight dark:border-surface-borderDark text-gray-500 dark:text-gray-400 bg-surface-mutedLight/20 dark:bg-surface-mutedDark/20 ${className}`}>
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-60 text-cjack-accent" aria-hidden="true" />
      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-200">
        {title}
      </h4>
      {description && (
        <p className="text-[11px] mt-1 text-gray-500 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <div className="mt-4">
          <button
            onClick={onAction}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-cjack-primary text-white hover:bg-cjack-primaryHover transition-colors shadow-sm"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
