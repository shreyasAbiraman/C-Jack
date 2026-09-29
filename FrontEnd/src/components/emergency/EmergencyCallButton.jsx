import React from 'react';
import { useEmergencyDispatch } from '../../context/EmergencyDispatchContext';
import { AlertTriangle, PhoneCall } from 'lucide-react';
import '../../index.css';

const EmergencyCallButton = () => {
  const { initiateEmergencyCall, activeEmergency, showDispatchTracker, setShowDispatchTracker } = useEmergencyDispatch();

  // If there's an active emergency or the tracker is open, show a different state
  if (activeEmergency || showDispatchTracker) {
    return (
      <button 
        className="w-full h-full relative overflow-hidden bg-red-900/40 border border-red-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-800/50"
        onClick={() => setShowDispatchTracker(true)}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-[length:200%_100%] animate-gradient-x" />
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-red-500 tracking-wider">DISPATCH ACTIVE</h3>
          <p className="text-red-400/80 text-sm mt-1">View Live Tracking</p>
        </div>
      </button>
    );
  }

  return (
    <button 
      className="w-full h-full relative overflow-hidden bg-gradient-to-br from-red-600 to-red-900 border border-red-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] active:scale-[0.98] group"
      onClick={initiateEmergencyCall}
    >
      {/* Glare effect */}
      <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-glare" />
      
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
        <PhoneCall className="w-8 h-8 text-white group-hover:animate-wiggle" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-black text-white tracking-widest drop-shadow-md">EMERGENCY CALL</h3>
        <p className="text-red-100 text-sm mt-1 font-medium opacity-90">Contact nearest available ambulance</p>
      </div>
    </button>
  );
};

export default EmergencyCallButton;
