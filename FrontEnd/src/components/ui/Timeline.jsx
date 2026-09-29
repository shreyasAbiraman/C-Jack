import React from 'react';
import { normalizeStatus } from './statusTokens';

export const Timeline = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-borderLight dark:before:bg-surface-borderDark ${className}`}>
      {items.map((item, index) => {
        const statusConfig = normalizeStatus(item.status || 'NORMAL');
        const StatusIcon = statusConfig.icon;

        return (
          <div key={item.id || index} className="relative">
            {/* Node Pin */}
            <span
              className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-surface-light dark:border-surface-dark flex items-center justify-center ${statusConfig.dotClass}`}
            />

            <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {item.title}
                </span>
                {item.time && (
                  <span className="text-[10px] font-mono text-gray-500">
                    {item.time}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 font-sans leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
