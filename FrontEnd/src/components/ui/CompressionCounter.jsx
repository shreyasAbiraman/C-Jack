import React from 'react';
import { RotateCcw, Hash } from 'lucide-react';

export const CompressionCounter = ({
  count = 0,
  cycles = 1,
  targetPerCycle = 200,
  onReset,
  className = ''
}) => {
  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
          <Hash className="h-4 w-4 text-cjack-accent" />
          <span>Compression Counter</span>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
            title="Reset counter"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-4xl sm:text-5xl font-mono font-extrabold text-gray-950 dark:text-white tracking-tight">
          {count}
        </span>
        <span className="text-xs font-mono text-gray-500 uppercase">
          Compressions
        </span>
      </div>

      <div className="mt-3 pt-2.5 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-[11px] font-mono text-gray-500">
        <span>Resuscitation Cycle: <strong className="text-gray-800 dark:text-gray-200">#{cycles}</strong></span>
        <span>Goal: 200 / cycle</span>
      </div>
    </div>
  );
};

export default CompressionCounter;
