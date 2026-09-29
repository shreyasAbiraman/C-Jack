import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className = ''
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidth} bg-surface-light dark:bg-surface-dark border border-surface-borderLight dark:border-surface-borderDark rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-borderLight dark:border-surface-borderDark">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[75vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
