import React from 'react';
import { SEMANTIC_STATUS, normalizeStatus } from './statusTokens';

/**
 * StatusBadge Component
 * Clinical Rule: Never rely on color alone. Always renders Icon, Label, Color, and Text Explanation.
 */
export const StatusBadge = ({
  status = 'NORMAL',
  text,
  showIcon = true,
  showExplanation = false,
  pulse = false,
  size = 'md',
  className = ''
}) => {
  const config = normalizeStatus(status);
  const IconComponent = config.icon;
  const displayText = text || config.defaultText;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        role="status"
        aria-label={config.ariaLabel}
        className={`inline-flex items-center font-mono font-semibold rounded border ${config.badgeClass} ${sizeClasses} select-none transition-all`}
      >
        {showIcon && (
          <IconComponent
            className={`shrink-0 ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} ${
              pulse ? 'animate-pulse' : ''
            }`}
            aria-hidden="true"
          />
        )}
        <span className="tracking-wider uppercase font-bold">{config.label}</span>
        {displayText && !showExplanation && (
          <>
            <span className="opacity-40" aria-hidden="true">|</span>
            <span className="font-sans font-medium capitalize text-[11px] truncate max-w-[200px]">
              {displayText}
            </span>
          </>
        )}
      </span>

      {showExplanation && (
        <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-sans">
          {displayText}
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
