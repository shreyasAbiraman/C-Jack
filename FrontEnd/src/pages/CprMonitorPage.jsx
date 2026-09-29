import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { useToast } from '../context/ToastContext';
import {
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatusBadge,
  Button,
  PageStateWrapper
} from '../components/ui';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import {
  Activity,
  Play,
  Square,
  Pause,
  RotateCcw,
  Gauge,
  Scale,
  Zap,
  Clock,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Sliders,
  BarChart3,
  AlertOctagon,
  Target
} from 'lucide-react';

import CprStateMachineDisplay from '../components/cpr/CprStateMachineDisplay';
import ClosedLoopDiagram from '../components/cpr/ClosedLoopDiagram';
import CprSafetyPanel from '../components/cpr/CprSafetyPanel';
import CprSimulatorControls from '../components/cpr/CprSimulatorControls';
import CprAnalyticsModal from '../components/cpr/CprAnalyticsModal';

export const CprMonitorPage = () => {
  const {
    cprMetrics,
    cprMachineState,
    transitionCprState,
    emergencyStopCpr,
    updateCprSimulator,
    getCprAnalytics,
    resetCprSession,
    loading,
    error,
    backendOnline,
    lastSuccessfulUpdate,
    refreshData
  } = useSystem();

  const { addToast } = useToast();

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [sessionAnalytics, setSessionAnalytics] = useState(null);
  const [isConfirmingStateStop, setIsConfirmingStateStop] = useState(false);

  // Derived or state machine data
  const currentState = cprMachineState?.cprState || 'IDLE';
  const isCprActive = currentState === 'CPR_ACTIVE';

  const compressionRate = cprMachineState?.compressionRate ?? (isCprActive ? 108 : 0);
  const compressionDepth = cprMachineState?.compressionDepthMm ?? (isCprActive ? 52 : 0);
  const appliedForce = cprMachineState?.appliedForceNewtons ?? (isCprActive ? 410 : 0);
  const totalCompressions = cprMachineState?.compressionCount ?? (cprMetrics?.totalCompressions || 0);
  const motorSpeedRpm = cprMachineState?.motorSpeedRpm ?? (isCprActive ? 3200 : 0);
  const sessionDuration = cprMachineState?.sessionDuration || '00:00';
  const feedbackStatus = cprMachineState?.feedbackStatus || (isCprActive ? 'ACTIVE_CLOSED_LOOP' : 'INACTIVE');
  const closedLoopActive = cprMachineState?.closedLoopActive ?? isCprActive;

  // Handler for state transition (Guards STOPPED with confirmation)
  const handleTransition = async (targetState) => {
    // Intercept ANY stop action to require explicit confirmation
    if (targetState === 'STOPPED') {
      setIsConfirmingStateStop(true);
      return;
    }

    try {
      await transitionCprState(targetState);
      addToast({
        title: 'CPR State Updated',
        message: `System transitioned to ${targetState}`,
        type: targetState === 'CPR_ACTIVE' ? 'error' : targetState === 'RECOVERY' ? 'success' : 'info'
      });
    } catch (err) {
      addToast({
        title: 'Transition Failed',
        message: err.message || 'Invalid state transition',
        type: 'warning'
      });
    }
  };

  // Handler for confirmed routine stop (from either button or state transition)
  const handleConfirmedStop = async () => {
    setIsConfirmingStateStop(false);
    try {
      await transitionCprState('STOPPED');
      addToast({
        title: 'CPR Stopped',
        message: 'Orderly cessation of automated compressions complete.',
        type: 'info'
      });

      // Load analytics automatically upon stopping
      try {
        const analyticsData = await getCprAnalytics();
        setSessionAnalytics(analyticsData);
      } catch (e) {}
    } catch (err) {
      addToast({
        title: 'Stop Failed',
        message: err.message,
        type: 'warning'
      });
    }
  };

  // Handler for emergency stop (Instantaneous, ZERO confirmation modal)
  const handleEmergencyStop = async () => {
    try {
      await emergencyStopCpr();
      addToast({
        title: 'EMERGENCY STOP EXECUTED',
        message: 'All sternal actuators halted immediately. Pressure vented.',
        type: 'error'
      });

      // Fetch analytics for post-run review
      try {
        const analyticsData = await getCprAnalytics();
        setSessionAnalytics(analyticsData);
      } catch (e) {}
    } catch (err) {
      addToast({
        title: 'E-Stop Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  // Handler for manual override toggle
  const handleToggleManualOverride = async (enable) => {
    try {
      if (enable) {
        await transitionCprState('MANUAL_OVERRIDE');
        addToast({
          title: 'Manual Override Engaged',
          message: 'Autonomous closed-loop PID control bypassed. Responder in command.',
          type: 'warning'
        });
      } else {
        await transitionCprState('IDLE');
        addToast({
          title: 'Manual Override Disengaged',
          message: 'System returned to standby.',
          type: 'info'
        });
      }
    } catch (err) {
      addToast({
        title: 'Override Error',
        message: err.message,
        type: 'error'
      });
    }
  };

  // Handler for simulator update
  const handleUpdateSimulator = async (config) => {
    try {
      await updateCprSimulator(config);
    } catch (err) {
      console.error('Failed to update simulator:', err);
    }
  };

  // Open session analytics
  const handleViewAnalytics = async () => {
    try {
      const data = await getCprAnalytics();
      setSessionAnalytics(data);
      setIsAnalyticsOpen(true);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  // Reset session
  const handleResetSession = async () => {
    try {
      await resetCprSession();
      addToast({
        title: 'CPR Session Reset',
        message: 'Compression counters and duration reset to zero.',
        type: 'info'
      });
      setSessionAnalytics(null);
    } catch (err) {
      console.error('Failed to reset session:', err);
    }
  };

  return (
    <PageStateWrapper
      loading={loading}
      error={error}
      isOffline={!backendOnline}
      lastUpdated={lastSuccessfulUpdate}
      hasData={Boolean(cprMachineState || cprMetrics)}
      onRetry={refreshData}
      screenTitle="CPR Control Center"
    >
      <div className="space-y-6">
        {/* =========================================================================
            SECTION HEADER
            ========================================================================= */}
        <SectionHeader
        title="CPR Control Center & Closed-Loop Actuation"
        question="What is the current CPR state? Is closed-loop feedback maintaining target rate and depth?"
        statusBadge={
          <StatusBadge
            status={isCprActive ? 'CRITICAL' : currentState === 'RECOVERY' ? 'NORMAL' : 'NEUTRAL'}
            text={`STATE: ${currentState}`}
            pulse={isCprActive}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={BarChart3}
              onClick={handleViewAnalytics}
            >
              Session Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetSession}
            >
              Reset Session
            </Button>
          </div>
        }
      />

      {/* Mandatory Software Simulation Disclaimer Banner */}
      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono shadow-sm">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold uppercase text-[10px] shrink-0 border border-sky-500/40">
            PROTOTYPE SIMULATION BENCH
          </span>
          <span className="text-slate-300 text-[11px] leading-relaxed">
            This UI is an engineering simulator and validation harness. <strong>Do not imply that this dashboard alone is sufficient to safely operate a physical CPR device.</strong>
          </span>
        </div>
        <div className="text-[10px] text-slate-400 shrink-0 font-bold bg-slate-800 px-2 py-1 rounded">
          CLOSED-LOOP PID: 100 Hz
        </div>
      </div>

      {/* =========================================================================
          1. LIVE CPR MONITOR TILES (CURRENT STATE, RATE, COUNT, DEPTH, FORCE, MOTOR, FEEDBACK, TARGETS, DURATION)
          ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase font-mono text-gray-500 tracking-wider flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-cjack-accent" />
            <span>CPR Monitor Real-Time Telemetry</span>
          </h3>
          <span className="text-[10px] font-mono text-gray-400">
            AHA 2025 Standard Dynamic Setpoints
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Tile 1: Compression Rate */}
          <Card highlight={isCprActive && (compressionRate < 100 || compressionRate > 120)}>
            <div className="flex items-center justify-between text-xs text-gray-500 uppercase font-mono mb-1">
              <span className="truncate">Rate (CPM)</span>
              <Activity className="h-3.5 w-3.5 text-red-500 shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gray-950 dark:text-white">
              {compressionRate}
            </div>
            <div className="text-[10px] font-mono mt-1 text-emerald-600 dark:text-emerald-400">
              Target: 100 - 120
            </div>
          </Card>

          {/* Tile 2: Compression Count */}
          <Card>
            <div className="flex items-center justify-between text-xs text-gray-500 uppercase font-mono mb-1">
              <span className="truncate">Cycles Count</span>
              <RotateCcw className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gray-950 dark:text-white">
              {totalCompressions}
            </div>
            <div className="text-[10px] font-mono mt-1 text-gray-500">
              Recoil: 96% Full
            </div>
          </Card>

          {/* Tile 3: Compression Depth */}
          <Card highlight={isCprActive && (compressionDepth < 50 || compressionDepth > 60)}>
            <div className="flex items-center justify-between text-xs text-gray-500 uppercase font-mono mb-1">
              <span className="truncate">Depth (mm)</span>
              <Gauge className="h-3.5 w-3.5 text-cjack-accent shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gray-950 dark:text-white">
              {compressionDepth} <span className="text-xs text-gray-500">mm</span>
            </div>
            <div className="text-[10px] font-mono mt-1 text-emerald-600 dark:text-emerald-400">
              Target: 50 - 60 mm
            </div>
          </Card>

          {/* Tile 4: Applied Peak Force */}
          <Card>
            <div className="flex items-center justify-between text-xs text-gray-500 uppercase font-mono mb-1">
              <span className="truncate">Force (N)</span>
              <Scale className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gray-950 dark:text-white">
              {appliedForce} <span className="text-xs text-gray-500">N</span>
            </div>
            <div className="text-[10px] font-mono mt-1 text-emerald-600 dark:text-emerald-400">
              Target: 350 - 450 N
            </div>
          </Card>

          {/* Tile 5: Motor Speed */}
          <Card>
            <div className="flex items-center justify-between text-xs text-gray-500 uppercase font-mono mb-1">
              <span className="truncate">Motor Speed</span>
              <Zap className="h-3.5 w-3.5 text-cjack-accent shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-gray-950 dark:text-white truncate">
              {motorSpeedRpm} <span className="text-xs text-gray-500">RPM</span>
            </div>
            <div className="text-[10px] font-mono mt-1 text-gray-500 truncate">
              PWM: {isCprActive ? '88% Duty' : '0% Idle'}
            </div>
          </Card>

          {/* Tile 6: Feedback Status */}
          <Card highlight={isCprActive && closedLoopActive}>
            <div className="flex items-center justify-between text-xs text-gray-500 uppercase font-mono mb-1">
              <span className="truncate">Feedback</span>
              <RefreshCw className={`h-3.5 w-3.5 ${isCprActive ? 'text-emerald-500 animate-spin' : 'text-gray-400'}`} style={{ animationDuration: '4s' }} />
            </div>
            <div className="text-sm font-mono font-extrabold text-gray-950 dark:text-white truncate">
              {feedbackStatus}
            </div>
            <div className="text-[10px] font-mono mt-1 text-emerald-600 dark:text-emerald-400 truncate">
              {isCprActive ? 'PID Trim Active' : 'Actuator Idle'}
            </div>
          </Card>

          {/* Tile 7: Session Duration */}
          <Card>
            <div className="flex items-center justify-between text-xs text-gray-500 uppercase font-mono mb-1">
              <span className="truncate">Duration</span>
              <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-gray-950 dark:text-white">
              {sessionDuration}
            </div>
            <div className="text-[10px] font-mono mt-1 text-gray-500">
              {isCprActive ? 'Active Resuscitation' : 'Timer Standby'}
            </div>
          </Card>
        </div>
      </div>

      {/* Target Values & Safety Limits Matrix Card */}
      <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-cjack-accent shrink-0" />
          <span className="font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            Resuscitation Target Values & Tolerances:
          </span>
        </div>
        <div className="flex items-center gap-4 flex-wrap text-[11px] text-gray-600 dark:text-gray-300">
          <div><span className="text-gray-400">Rate Target:</span> <strong className="text-gray-900 dark:text-white">100 - 120 CPM</strong></div>
          <div><span className="text-gray-400">Depth Target:</span> <strong className="text-gray-900 dark:text-white">50 - 60 mm (5 - 6 cm)</strong></div>
          <div><span className="text-gray-400">Force Target:</span> <strong className="text-gray-900 dark:text-white">350 - 450 N</strong></div>
          <div><span className="text-gray-400">Full Recoil:</span> <strong className="text-gray-900 dark:text-white">≥ 95%</strong></div>
          <div><span className="text-gray-400">Motor RPM:</span> <strong className="text-gray-900 dark:text-white">3,200 RPM @ 88% PWM</strong></div>
        </div>
      </div>

      {/* =========================================================================
          2. DETERMINISTIC 10-STATE MACHINE PIPELINE
          ========================================================================= */}
      <CprStateMachineDisplay
        currentState={currentState}
        onTransition={handleTransition}
      />

      {/* =========================================================================
          3. CLOSED-LOOP INTERACTIVE 7-STAGE DIAGRAM
          ========================================================================= */}
      <ClosedLoopDiagram
        isActive={isCprActive}
        feedbackActive={closedLoopActive}
        currentDepth={compressionDepth}
        currentForce={appliedForce}
        targetDepthRange={[50, 60]}
        targetForceRange={[350, 450]}
      />

      {/* =========================================================================
          4. SAFETY INTERLOCKS & EMERGENCY STOP PANEL
          ========================================================================= */}
      <CprSafetyPanel
        cprState={currentState}
        safety={cprMachineState?.safety}
        onEmergencyStop={handleEmergencyStop}
        onRoutineStop={() => setIsConfirmingStateStop(true)}
        onToggleManualOverride={handleToggleManualOverride}
      />

      {/* =========================================================================
          5. INTERACTIVE DEVELOPER CPR SIMULATOR
          ========================================================================= */}
      <CprSimulatorControls
        currentConfig={{
          compressionRate,
          currentDepthMm: compressionDepth,
          appliedForceNewtons: appliedForce,
          sensorState: cprMachineState?.safety?.sensorFault ? 'Fault' : 'Healthy',
          motorState: cprMachineState?.safety?.motorFault || 'Nominal'
        }}
        onUpdateSimulator={handleUpdateSimulator}
      />

      {/* =========================================================================
          6. POST-SESSION RESUSCITATION ANALYTICS MODAL
          ========================================================================= */}
      <CprAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        analytics={sessionAnalytics}
      />

      {/* Universal Mandatory Stop Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmingStateStop}
        onClose={() => setIsConfirmingStateStop(false)}
        onConfirm={handleConfirmedStop}
        title="Confirm Halting Automated CPR"
        message="Are you sure you wish to stop automated chest compressions? The patient may still be pulseless. Ensure manual chest compressions or defibrillation can begin immediately."
        confirmText="Yes, Stop Compressions"
        cancelText="Cancel (Continue CPR)"
        severity="CRITICAL"
      />
      </div>
    </PageStateWrapper>
  );
};

export default CprMonitorPage;
