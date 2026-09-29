import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Button } from '../ui';
import {
  Sliders,
  Shield,
  Activity,
  AlertTriangle,
  HeartPulse,
  Wrench,
  WifiOff,
  Terminal,
  Check,
  AlertCircle
} from 'lucide-react';

const MODE_CONFIG = {
  STANDBY: {
    icon: Shield,
    color: 'border-slate-500 text-slate-400 bg-slate-500/10',
    activeBadge: 'neutral',
    summary: 'Low-power background state; biometrics polled at conservative rate (50Hz); compressor valve idle.'
  },
  MONITORING: {
    icon: Activity,
    color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
    activeBadge: 'safe',
    summary: 'Continuous 250Hz biometric tracking; arrest detection algorithm and shockable rhythm classifiers armed.'
  },
  EMERGENCY: {
    icon: AlertTriangle,
    color: 'border-rose-500 text-rose-500 bg-rose-500/10',
    activeBadge: 'emergency',
    summary: 'Cardiac arrest event active; multi-channel LoRa & 4G distress packet broadcast in progress.'
  },
  CPR: {
    icon: HeartPulse,
    color: 'border-red-600 text-red-500 bg-red-600/15',
    activeBadge: 'emergency',
    summary: 'Automated pneumatic chest compression vest cycling actively at 108 CPM closed-loop feedback.'
  },
  MAINTENANCE: {
    icon: Wrench,
    color: 'border-amber-500 text-amber-400 bg-amber-500/10',
    activeBadge: 'warning',
    summary: 'Biomedical engineering service mode; calibration zeroing, actuator purge, and firmware diagnostics.'
  },
  OFFLINE: {
    icon: WifiOff,
    color: 'border-zinc-500 text-zinc-400 bg-zinc-500/10',
    activeBadge: 'neutral',
    summary: 'Radio transceivers disconnected; store-and-forward telemetry buffered into non-volatile SPI flash.'
  },
  SIMULATION: {
    icon: Terminal,
    color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10',
    activeBadge: 'info',
    summary: 'Synthetic physiological signal generator active for bench demonstration, drills, and clinical testing.'
  }
};

export const DeviceModeSelector = ({ currentMode = 'MONITORING', onSelectMode }) => {
  const [selectedPendingMode, setSelectedPendingMode] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const modes = [
    'STANDBY',
    'MONITORING',
    'EMERGENCY',
    'CPR',
    'MAINTENANCE',
    'OFFLINE',
    'SIMULATION'
  ];

  const handleModeClick = (mode) => {
    if (mode === currentMode) return;

    // Critical transitions require confirmation
    if (mode === 'CPR' || mode === 'EMERGENCY' || mode === 'MAINTENANCE') {
      setSelectedPendingMode(mode);
      setShowConfirmModal(true);
    } else {
      executeModeChange(mode);
    }
  };

  const executeModeChange = async (mode) => {
    if (!onSelectMode) return;
    try {
      setIsUpdating(true);
      await onSelectMode(mode);
    } catch (err) {
      console.error('Failed to change device mode:', err);
    } finally {
      setIsUpdating(false);
      setShowConfirmModal(false);
      setSelectedPendingMode(null);
    }
  };

  return (
    <Card className="border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary-600/10 text-primary-500 border border-primary-500/20">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Device Operating Mode Controller
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20 font-normal">
                7 MODES SUPPORTED
              </span>
            </CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select device operating state to adapt actuator behavior, sensor sampling, and telemetry broadcast
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-gray-500">Active State:</span>
          <span className="px-2.5 py-1 rounded bg-surface-mutedLight dark:bg-surface-mutedDark border border-primary-500/40 font-bold text-primary-500">
            {currentMode}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Mode Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {modes.map((mode) => {
            const config = MODE_CONFIG[mode];
            const Icon = config.icon;
            const isActive = currentMode === mode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeClick(mode)}
                disabled={isUpdating}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between group ${
                  isActive
                    ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/15 shadow-md ring-1 ring-primary-500/40'
                    : 'border-surface-borderLight dark:border-surface-borderDark bg-surface-card hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${config.color} border`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        <Check className="h-3 w-3" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 group-hover:text-primary-400">
                        SWITCH
                      </span>
                    )}
                  </div>

                  <div className="font-mono font-bold text-sm text-gray-900 dark:text-white mb-1">
                    {mode}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-sans line-clamp-2">
                    {config.summary}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-surface-borderLight/60 dark:border-surface-borderDark/60 flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>SAFETY LEVEL:</span>
                  <span className={mode === 'CPR' || mode === 'EMERGENCY' ? 'text-rose-500 font-bold' : 'text-gray-400'}>
                    {mode === 'CPR' || mode === 'EMERGENCY' ? 'RESTRICTED' : 'STANDARD'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Safety Confirmation Dialog for High-Impact Mode Changes */}
        {showConfirmModal && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                  CONFIRM OPERATING MODE CHANGE: {selectedPendingMode}
                </h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                  Transitioning to <span className="font-mono font-semibold">{selectedPendingMode}</span> will alter
                  actuator pneumatics and telemetry reporting parameters. Please confirm action.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => executeModeChange(selectedPendingMode)}
                disabled={isUpdating}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isUpdating ? 'Switching...' : `Confirm ${selectedPendingMode}`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
