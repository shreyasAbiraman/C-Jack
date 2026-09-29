import React from 'react';
import { useEmergencyDispatch } from '../../context/EmergencyDispatchContext';
import { BellRing, Check, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const IncomingDispatchAlert = () => {
  const { 
    activeEmergency, 
    activeResponders, 
    acceptEmergency, 
    rejectEmergency,
    loading
  } = useEmergencyDispatch();
  const { addToast } = useToast();

  if (loading || !activeEmergency || !['DISPATCHING', 'CALLING'].includes(activeEmergency.status)) return null;

  // For simulation purposes, we'll let the user pick WHICH responder they want to accept as
  return (
    <div className="bg-amber-900/40 border border-amber-500/50 rounded-xl p-6 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-pulse-urgent">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-amber-500/20 rounded-full">
          <BellRing className="w-6 h-6 text-amber-500 animate-wiggle" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-amber-500 uppercase tracking-widest">Incoming Emergency Dispatch</h2>
          <p className="text-amber-200/80 text-sm">Simulate responder acceptance. Select a responder to accept the dispatch.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeResponders.map(responder => {
          // Check if already rejected
          const log = activeEmergency.calledResponders?.find(r => r.ambulanceId === responder._id);
          const hasRejected = log?.status === 'REJECTED';

          return (
            <div key={responder._id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex flex-col justify-between">
              <div>
                <h3 className="text-white font-bold">{responder.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{responder.driverName} • {responder.baseLocation}</p>
              </div>
              <div className="mt-4 flex gap-2">
                {hasRejected ? (
                  <span className="text-red-500 text-xs font-bold px-2 py-1 bg-red-500/10 rounded w-full text-center">REJECTED</span>
                ) : (
                  <>
                    <button 
                      onClick={() => acceptEmergency(activeEmergency.emergencyId, responder._id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded text-sm font-bold flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => rejectEmergency(activeEmergency.emergencyId, responder._id)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-1.5 rounded text-sm font-bold flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncomingDispatchAlert;
