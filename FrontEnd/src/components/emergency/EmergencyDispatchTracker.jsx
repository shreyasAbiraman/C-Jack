import React from 'react';
import { useEmergencyDispatch } from '../../context/EmergencyDispatchContext';
import { X, PhoneCall, CheckCircle, Clock, AlertTriangle, Truck, MapPin, Activity, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const EmergencyDispatchTracker = () => {
  const { 
    showDispatchTracker, 
    setShowDispatchTracker, 
    activeEmergency, 
    cancelEmergency,
    acceptEmergency,
    rejectEmergency,
    progressStatus,
    loading 
  } = useEmergencyDispatch();
  
  const { addToast } = useToast();

  if (!showDispatchTracker) return null;

  const isComplete = activeEmergency?.status === 'COMPLETED';
  const isCancelled = activeEmergency?.status === 'CANCELLED';
  const isAssigned = ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'PATIENT_PICKED_UP', 'HOSPITAL_REACHED'].includes(activeEmergency?.status);

  const getStatusColor = () => {
    if (isComplete) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (isCancelled) return 'text-slate-500 border-slate-500/30 bg-slate-500/10';
    if (isAssigned) return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
    return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
  };

  const handleSimulateAccept = async (ambulanceId) => {
    try {
      await acceptEmergency(activeEmergency.emergencyId, ambulanceId);
    } catch (err) {
      console.warn('Accept notice:', err.message);
    }
  };

  const handleSimulateRejectAll = async () => {
    if (activeEmergency?.calledResponders) {
      for (const resp of activeEmergency.calledResponders) {
        await rejectEmergency(activeEmergency.emergencyId, resp.ambulanceId, 'ALL_RESPONDERS_BUSY');
      }
    }
  };

  const handleSimulateCallFailure = async () => {
    if (activeEmergency?.calledResponders) {
      for (const resp of activeEmergency.calledResponders) {
        await rejectEmergency(activeEmergency.emergencyId, resp.ambulanceId, 'CELLULAR_NETWORK_UNREACHABLE');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${getStatusColor()}`}>
              {isComplete ? <CheckCircle className="w-6 h-6" /> : 
               isCancelled ? <X className="w-6 h-6" /> : 
               isAssigned ? <Truck className="w-6 h-6" /> : 
               <PhoneCall className="w-6 h-6 animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Emergency Dispatch</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  SIMULATION MODE
                </span>
              </div>
              <p className="text-slate-400 text-xs font-mono mt-0.5">
                ID: {activeEmergency?.emergencyId || 'Pending...'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowDispatchTracker(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && !activeEmergency ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-mono text-sm">Connecting to dispatch service...</p>
            </div>
          ) : !activeEmergency ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-slate-500 mb-4" />
              <h3 className="text-xl text-white font-medium mb-2">No Active Dispatch</h3>
              <p className="text-slate-400 text-sm">There are currently no active emergency dispatches.</p>
            </div>
          ) : (
            <>
              {/* Status Banner */}
              <div className={`p-4 rounded-xl flex items-center justify-between border ${getStatusColor()}`}>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5" />
                  <span className="font-bold tracking-wide uppercase font-mono text-sm">
                    Status: {activeEmergency.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                {['CREATED', 'DISPATCHING', 'CALLING'].includes(activeEmergency.status) && (
                  <span className="flex items-center gap-2 text-xs font-mono text-amber-300">
                    <Clock className="w-4 h-4 animate-spin" />
                    Simultaneously calling 3 ambulances...
                  </span>
                )}
              </div>

              {/* Assignment Details */}
              {activeEmergency.assignment && (
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
                    <Truck className="w-4 h-4 text-blue-400" />
                    Assigned Primary Responder (Atomic Lock Secured)
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <p className="text-slate-400 mb-1">Ambulance Unit</p>
                      <p className="text-white font-bold">{activeEmergency.assignment.ambulanceName || activeEmergency.assignment.ambulanceId?.name || 'Ambulance Unit'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Lead Paramedic</p>
                      <p className="text-white font-bold">{activeEmergency.assignment.responderName || activeEmergency.assignment.ambulanceId?.responderName || 'Lead EMT'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Primary Hotline</p>
                      <p className="text-white font-bold">{activeEmergency.assignment.primaryPhone || activeEmergency.assignment.ambulanceId?.primaryPhone || '+91 80 4100 0201'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">ETA / Distance</p>
                      <p className="text-emerald-400 font-bold">
                        {activeEmergency.assignment.etaMinutes || 4} mins ({activeEmergency.assignment.distanceKm || 1.8} km)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Responder Call Log */}
              {activeEmergency.calledResponders?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Simultaneous Outgoing Calls (3 Ambulances)</h3>
                  <div className="space-y-2">
                    {activeEmergency.calledResponders.map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <PhoneCall className={`w-3.5 h-3.5 ${log.callStatus === 'ACCEPTED' ? 'text-emerald-400' : log.callStatus === 'RINGING' ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                          <span className="text-slate-200 font-bold">{log.ambulanceName || log.ambulanceId}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase
                          ${log.callStatus === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            log.callStatus === 'CANCELLED' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                            log.callStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'}`}
                        >
                          {log.callStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SIH Demonstration & Simulation Controls Panel */}
              <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-mono uppercase flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    SIH Demo & Simulation Controls
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Atomic assignment test</span>
                </div>

                {/* If CALLING / DISPATCHING: Show Accept buttons for each responder */}
                {['CREATED', 'DISPATCHING', 'CALLING'].includes(activeEmergency.status) && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">Simulate which responder accepts first:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleSimulateAccept('AMB-01')}
                        className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-lg transition-colors"
                      >
                        AMB-01 Accept
                      </button>
                      <button
                        onClick={() => handleSimulateAccept('AMB-02')}
                        className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-lg transition-colors"
                      >
                        AMB-02 Accept
                      </button>
                      <button
                        onClick={() => handleSimulateAccept('AMB-03')}
                        className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-lg transition-colors"
                      >
                        AMB-03 Accept
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={handleSimulateRejectAll}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-mono font-bold rounded-lg transition-colors"
                      >
                        Reject All
                      </button>
                      <button
                        onClick={handleSimulateCallFailure}
                        className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono font-bold rounded-lg transition-colors"
                      >
                        Simulate Call Failure
                      </button>
                    </div>
                  </div>
                )}

                {/* If ASSIGNED: Show progression buttons */}
                {isAssigned && !isComplete && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">Progress Responder Clinical Lifecycle:</p>
                    <div className="flex flex-wrap gap-2">
                      {activeEmergency.status === 'ASSIGNED' || activeEmergency.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => progressStatus(activeEmergency.emergencyId, 'EN_ROUTE')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-lg transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Responder En Route
                        </button>
                      ) : null}

                      {activeEmergency.status === 'EN_ROUTE' ? (
                        <button
                          onClick={() => progressStatus(activeEmergency.emergencyId, 'ARRIVED')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-lg transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Arrived at Scene
                        </button>
                      ) : null}

                      {activeEmergency.status === 'ARRIVED' ? (
                        <button
                          onClick={() => progressStatus(activeEmergency.emergencyId, 'PATIENT_PICKED_UP')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-bold rounded-lg transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Patient Picked Up
                        </button>
                      ) : null}

                      {activeEmergency.status === 'PATIENT_PICKED_UP' ? (
                        <button
                          onClick={() => progressStatus(activeEmergency.emergencyId, 'HOSPITAL_REACHED')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold rounded-lg transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          Hospital Reached
                        </button>
                      ) : null}

                      {activeEmergency.status === 'HOSPITAL_REACHED' ? (
                        <button
                          onClick={() => progressStatus(activeEmergency.emergencyId, 'COMPLETED')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Complete Emergency
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {activeEmergency && !isComplete && !isCancelled && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-mono">
              Emergency Active
            </span>
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to cancel this emergency call?")) {
                  cancelEmergency();
                }
              }}
              className="px-5 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 rounded-xl text-xs font-mono font-bold transition-colors"
            >
              Cancel Emergency
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyDispatchTracker;
