import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  User,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send
} from 'lucide-react';
import ConfirmationDialog from '../ui/ConfirmationDialog';

export const EmergencyContactCard = ({
  contact = {},
  onSimulateNotify,
  className = ''
}) => {
  const [isConfirmingSimulatedAlert, setIsConfirmingSimulatedAlert] = useState(false);

  const handleNotifyClick = () => {
    setIsConfirmingSimulatedAlert(true);
  };

  const handleConfirmNotify = () => {
    setIsConfirmingSimulatedAlert(false);
    if (onSimulateNotify) {
      onSimulateNotify();
    }
  };

  const name = contact.name || 'Sarah Doe';
  const relationship = contact.relationship || 'Spouse (Primary Emergency Contact)';
  const phone = contact.phone || '+91 98765 43210';
  const smsStatus = contact.smsStatus || 'STANDBY';
  const callStatus = contact.callStatus || 'STANDBY';

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-surface-borderLight dark:border-surface-borderDark p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-cjack-accent" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Emergency Contact & Next-of-Kin
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              Automated Telephony & Cellular SMS Alert Protocol
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          <span>Real Calls Blocked in Simulation</span>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs mb-4 flex items-start gap-2.5 font-sans leading-relaxed">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>Safety Restriction:</strong> CJack does not automatically place real emergency phone calls or carrier SMS messages during simulation. Any real-world dispatch action requires explicit operator authentication and confirmation.
        </div>
      </div>

      {/* Contact Details & Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Info Box */}
        <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-gray-500">
              Designated Primary Contact:
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300">
              CONFIRMED NOK
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              {name}
            </h4>
            <p className="text-xs text-gray-500 font-sans">
              {relationship}
            </p>
          </div>

          <div className="pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-xs font-mono">
            <span className="text-gray-500">Telephone:</span>
            <strong className="text-gray-900 dark:text-white">{phone}</strong>
          </div>
        </div>

        {/* Communication Status Box */}
        <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2 text-xs font-mono">
              <span className="font-bold uppercase text-gray-700 dark:text-gray-300">
                Cellular SMS Delivery:
              </span>
              <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                smsStatus.includes('DELIVERED')
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300'
              }`}>
                {smsStatus}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold uppercase text-gray-700 dark:text-gray-300">
                Automated Voice Synthesizer:
              </span>
              <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                callStatus.includes('QUEUED')
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300'
              }`}>
                {callStatus}
              </span>
            </div>
          </div>

          {/* Trigger Simulated Notification Button */}
          <button
            onClick={handleNotifyClick}
            className="w-full py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-cjack-accent" />
            <span>Simulate Contact Notification (Requires Confirmation)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Simulated Notification */}
      <ConfirmationDialog
        isOpen={isConfirmingSimulatedAlert}
        onClose={() => setIsConfirmingSimulatedAlert(false)}
        onConfirm={handleConfirmNotify}
        title="Confirm Simulated Family Contact Alert"
        message={`Are you sure you wish to trigger a simulated emergency transmission to ${name} (${phone})? This will generate a synthetic SMS log and test dispatch packet in the audit trail without dialing real telephone networks.`}
        confirmText="Confirm Simulated Alert"
        cancelText="Cancel"
        severity="WARNING"
      />
    </div>
  );
};

export default EmergencyContactCard;
