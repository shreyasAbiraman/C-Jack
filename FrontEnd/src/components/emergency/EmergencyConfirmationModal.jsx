import React, { useState, useEffect } from 'react';
import { useEmergencyDispatch } from '../../context/EmergencyDispatchContext';
import { useSystem } from '../../context/SystemContext';
import { AlertOctagon, X, Check, Loader2, Heart, Activity, Radio, MapPin, User } from 'lucide-react';

const EmergencyConfirmationModal = () => {
  const { showConfirmation, setShowConfirmation, confirmAndDispatch, activeResponders } = useEmergencyDispatch();
  const { vitals, patient, cprMachineState, location, connectivity } = useSystem();
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (showConfirmation) {
      setIsConfirming(false);
    }
  }, [showConfirmation]);

  if (!showConfirmation) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    await confirmAndDispatch();
  };

  const hrValue = vitals?.heartRate !== undefined && vitals?.heartRate !== null ? vitals.heartRate : 78;
  const spo2Value = vitals?.spo2 !== undefined && vitals?.spo2 !== null ? vitals.spo2 : 97;
  const cprStatus = cprMachineState?.active ? 'ACTIVE' : 'INACTIVE';
  const gpsStatus = location?.gpsStatus || (connectivity?.gpsState?.status === 'SEARCHING' ? 'SEARCHING' : 'CONNECTED');
  const patientName = patient?.name || 'Rajesh Kumar (Demo Patient)';
  const responderCount = activeResponders?.length || 3;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-slate-900 border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.25)] rounded-3xl p-6 sm:p-8 max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center shrink-0 relative">
              <div className="absolute inset-0 rounded-2xl border border-red-500/40 animate-ping opacity-75" />
              <AlertOctagon className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">EMERGENCY DISPATCH</h2>
              <p className="text-red-400 text-xs font-semibold tracking-wider uppercase">Step 1 — Clinical Confirmation</p>
            </div>
          </div>

          {/* Telemetry Summary Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 mb-6 space-y-3 font-mono text-sm">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Patient:
              </span>
              <span className="text-white font-bold">{patientName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                Heart Rate:
              </span>
              <span className="text-red-400 font-bold">{hrValue > 0 ? `${hrValue} BPM` : '-- BPM'}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                SpO2:
              </span>
              <span className="text-cyan-400 font-bold">{spo2Value > 0 ? `${spo2Value}%` : '--%'}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                CPR:
              </span>
              <span className={cprStatus === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-slate-300 font-bold'}>
                {cprStatus}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                GPS:
              </span>
              <span className="text-emerald-400 font-bold">{gpsStatus}</span>
            </div>
          </div>

          {/* Dispatch Notice */}
          <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-4 mb-6">
            <p className="text-red-200 text-sm leading-relaxed text-center font-medium">
              Three configured ambulance responders will be contacted simultaneously. The first responder to accept will be assigned.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full">
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              disabled={isConfirming}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 active:scale-[0.98] disabled:opacity-50"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  DISPATCHING...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  CONFIRM EMERGENCY
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyConfirmationModal;
