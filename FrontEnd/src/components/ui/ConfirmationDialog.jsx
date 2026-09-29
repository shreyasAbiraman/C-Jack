import React from 'react';
import Modal from './Modal';
import { AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ConfirmationDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = "Confirm Critical Action",
  message = "Are you sure you wish to initiate this clinical command?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  severity = "CRITICAL", // 'CRITICAL', 'WARNING', 'NORMAL'
  isLoading = false
}) => {
  const isCritical = severity === 'CRITICAL';
  const isWarning = severity === 'WARNING';

  const IconComponent = isCritical ? AlertOctagon : isWarning ? AlertTriangle : ShieldCheck;
  const iconColor = isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-cjack-primary';
  const confirmBtnColor = isCritical
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : isWarning
    ? 'bg-amber-600 hover:bg-amber-700 text-white'
    : 'bg-cjack-primary hover:bg-cjack-primaryHover text-white';

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-3.5 py-1.5 rounded text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark transition-colors"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className={`px-4 py-1.5 rounded text-xs font-bold transition-all shadow-sm ${confirmBtnColor}`}
      >
        {isLoading ? 'Processing...' : confirmText}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="max-w-md">
      <div className="flex items-start gap-3.5">
        <div className={`p-2 rounded-lg bg-surface-mutedLight dark:bg-surface-mutedDark shrink-0 ${iconColor}`}>
          <IconComponent className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-sans">
            {message}
          </p>
          <p className="text-[11px] text-gray-500 font-mono">
            Command will be authenticated and logged in system telemetry audit trail.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
