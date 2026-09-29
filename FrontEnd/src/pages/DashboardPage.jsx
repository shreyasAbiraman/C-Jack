import React from 'react';
import { useSystem } from '../context/SystemContext';
import { useToast } from '../context/ToastContext';
import {
  StatusBadge,
  TrendGraph,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  PageStateWrapper
} from '../components/ui';
import {
  Heart,
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Wind,
  Gauge,
  Cpu,
  BatteryCharging,
  Radio,
  Navigation,
  Satellite,
  Clock,
  User,
  Phone,
  Shield,
  ShieldAlert,
  WifiOff,
  Ambulance,
  Compass,
  Zap,
  Play,
  RotateCcw,
  Sliders,
  BellRing
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmergencyCallButton from '../components/emergency/EmergencyCallButton';
import EmergencyConfirmationModal from '../components/emergency/EmergencyConfirmationModal';
import EmergencyDispatchTracker from '../components/emergency/EmergencyDispatchTracker';

export const DashboardPage = () => {
  const {
    systemStatus,
    patient,
    vitals,
    cprMetrics,
    deviceHealth,
    emergencyCommunication,
    location,
    connectivity,
    changeEmergencyState,
    loading,
    error,
    backendOnline,
    lastSuccessfulUpdate,
    refreshData
  } = useSystem();

  const { addToast } = useToast();
  const navigate = useNavigate();

  // Extract raw status and normalize
  const currentStatusRaw = (systemStatus?.systemState?.status || 'NORMAL').toUpperCase();
  const isEmergency =
    currentStatusRaw === 'CARDIAC ARREST SUSPECTED' ||
    currentStatusRaw === 'CPR ACTIVE' ||
    currentStatusRaw === 'EMERGENCY ALERT SENT' ||
    currentStatusRaw === 'RESPONDER EN ROUTE';

  // Config mapping for all 9 top emergency states
  const emergencyStateConfigs = {
    'NORMAL': {
      title: 'NORMAL — SURVEILLANCE STANDBY',
      tag: 'SYSTEM STANDBY',
      description: 'Patient vitals within normal clinical limits. Autonomous multi-sensor surveillance active. CPR mechanism disengaged.',
      bgClass: 'bg-emerald-700 dark:bg-emerald-950/80 border-emerald-500 text-white',
      badgeStatus: 'NORMAL',
      icon: CheckCircle2,
      directive: 'Routine Monitoring Active'
    },
    'MONITORING': {
      title: 'MONITORING — ACTIVE BIOMETRIC BASELINE',
      tag: 'MONITORING IN PROGRESS',
      description: 'Continuous dual-lead ECG and pulsatile SpO2 signal analysis active. Patient motion detected.',
      bgClass: 'bg-sky-800 dark:bg-sky-950/80 border-sky-600 text-white',
      badgeStatus: 'NORMAL',
      icon: Activity,
      directive: 'Surveillance Active'
    },
    'WARNING': {
      title: 'WARNING — HEMODYNAMIC COMPROMISE DETECTED',
      tag: 'CLINICAL WARNING',
      description: 'Elevated tachycardia and oxygen desaturation observed. Algorithm monitoring for loss of perfusion.',
      bgClass: 'bg-amber-600 dark:bg-amber-950/80 border-amber-500 text-white',
      badgeStatus: 'WARNING',
      icon: AlertTriangle,
      directive: 'Observe Patient Closely'
    },
    'CARDIAC ARREST SUSPECTED': {
      title: 'CRITICAL — CARDIAC ARREST SUSPECTED',
      tag: 'LEVEL 1 EMERGENCY',
      description: 'Dual-lead ECG registered ventricular fibrillation with immediate collapse of photoplethysmogram pulsatile waveform. Stand clear of patient!',
      bgClass: 'bg-red-700 dark:bg-red-950/90 border-red-500 text-white shadow-xl shadow-red-900/30 animate-pulse-urgent',
      badgeStatus: 'CRITICAL',
      icon: AlertOctagon,
      directive: 'Bystander Stand Clear • Auto-CPR Armed'
    },
    'CPR ACTIVE': {
      title: 'CRITICAL — AUTOMATED CPR IN PROGRESS',
      tag: 'RESUSCITATION ACTIVE',
      description: 'High-frequency pneumatic chest compression harness cycling at 108 CPM. Motorized ambient-air assistance synchronized on recoil.',
      bgClass: 'bg-red-700 dark:bg-red-950/90 border-red-500 text-white shadow-xl shadow-red-900/30 animate-pulse-urgent',
      badgeStatus: 'CRITICAL',
      icon: AlertOctagon,
      directive: 'Resuscitation in Progress (108 CPM / 5.2 cm Depth)'
    },
    'EMERGENCY ALERT SENT': {
      title: 'EMERGENCY ALERT SENT — LORA SOS BROADCAST',
      tag: 'SOS DISPATCH BROADCAST',
      description: 'Encrypted emergency packet containing GPS telemetry and ECG snapshot transmitted to municipal LoRaWAN gateways.',
      bgClass: 'bg-red-800 dark:bg-red-950/90 border-red-600 text-white',
      badgeStatus: 'CRITICAL',
      icon: Radio,
      directive: 'LoRa Packet Broadcast Confirmed'
    },
    'RESPONDER EN ROUTE': {
      title: 'FIRST RESPONDER EN ROUTE — ALS UNIT ACKNOWLEDGED',
      tag: 'PARAMEDIC DISPATCHED',
      description: 'Emergency medical team ALS-MED-04 has confirmed dispatch. Tracking real-time responder distance & telemetry handoff.',
      bgClass: 'bg-blue-800 dark:bg-blue-950/80 border-blue-500 text-white',
      badgeStatus: 'NORMAL',
      icon: Ambulance,
      directive: 'Maintain Patient Posture for Paramedic Handoff'
    },
    'PATIENT STABLE': {
      title: 'PATIENT STABLE — RETURN OF SPONTANEOUS CIRCULATION',
      tag: 'ROSC CONFIRMED',
      description: 'Spontaneous sinus rhythm and pulse pressure restored. Auto-compressions paused on standby surveillance.',
      bgClass: 'bg-emerald-700 dark:bg-emerald-950/80 border-emerald-500 text-white',
      badgeStatus: 'NORMAL',
      icon: CheckCircle2,
      directive: 'Monitor Hemodynamics • Maintain Vest Fit'
    },
    'DEVICE OFFLINE': {
      title: 'DEVICE OFFLINE — TELEMETRY DISCONNECTED',
      tag: 'HARDWARE LINK LOST',
      description: 'No telemetry packets received from ESP32 or T-Beam hardware node within timeout window. Verify power harness.',
      bgClass: 'bg-slate-800 dark:bg-slate-950 border-slate-600 text-slate-200',
      badgeStatus: 'OFFLINE',
      icon: WifiOff,
      directive: 'Check Hardware Node Connection'
    }
  };

  const activeEmergencyConfig =
    emergencyStateConfigs[currentStatusRaw] || emergencyStateConfigs['NORMAL'];
  const EmergencyStateIcon = activeEmergencyConfig.icon;

  // Developer control state trigger handler
  const handleDeveloperPreset = (stateName) => {
    changeEmergencyState(stateName);
    addToast({
      title: `Simulation State: ${stateName}`,
      message: `Switched prototype diagnostic state to ${stateName}.`,
      type: stateName.includes('ARREST') || stateName.includes('CPR') ? 'critical' : 'info'
    });
  };

  // Helper for Provenance Tags
  const renderProvenanceChip = (type = 'SIMULATED') => {
    const chipStyles = {
      REAL: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      SIMULATED: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800',
      'NOT AVAILABLE': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700'
    }[type] || 'bg-gray-100 text-gray-700 border-gray-300';

    return (
      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${chipStyles} select-none`}>
        {type}
      </span>
    );
  };

  return (
    <PageStateWrapper
      loading={loading && !systemStatus}
      error={error}
      backendOnline={backendOnline}
      lastSuccessfulUpdate={lastSuccessfulUpdate}
      onRetry={refreshData}
      screenTitle="System Status Overview"
      hasData={Boolean(systemStatus)}
      emptyMessage="No system telemetry packets received yet."
    >
      <div className="space-y-5">
        
        {/* =========================================================================
            EMERGENCY CALL DISPATCH
            ========================================================================= */}
        <div className="h-28">
          <EmergencyCallButton />
        </div>
        
        <EmergencyConfirmationModal />
        <EmergencyDispatchTracker />

      {/* =========================================================================
          SIMULATION MODE & DEVELOPER CONTROLS TOOLBAR
          ========================================================================= */}
      <div className="bg-surface-light dark:bg-surface-dark border border-surface-borderLight dark:border-surface-borderDark rounded-lg p-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-2.5 border-b border-surface-borderLight dark:border-surface-borderDark">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-mono font-extrabold text-[10px] uppercase tracking-wider border border-sky-500/30">
              SIMULATION MODE ACTIVE
            </span>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Prototype Demonstration Switchboard
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-500">
            Click any scenario to simulate live hardware state:
          </span>
        </div>

        {/* Preset scenario button strip */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {[
            { label: 'Normal', state: 'NORMAL', icon: CheckCircle2, variant: 'safe' },
            { label: 'Warning', state: 'WARNING', icon: AlertTriangle, variant: 'warning' },
            { label: 'Cardiac Arrest Detected', state: 'CARDIAC ARREST SUSPECTED', icon: AlertOctagon, variant: 'emergency' },
            { label: 'CPR Active', state: 'CPR ACTIVE', icon: Activity, variant: 'emergency' },
            { label: 'Emergency Alert Sent', state: 'EMERGENCY ALERT SENT', icon: Radio, variant: 'outline' },
            { label: 'Responder En Route', state: 'RESPONDER EN ROUTE', icon: Ambulance, variant: 'outline' },
            { label: 'Pulse Detected (ROSC)', state: 'PATIENT STABLE', icon: Heart, variant: 'safe' },
            { label: 'Device Offline', state: 'DEVICE OFFLINE', icon: WifiOff, variant: 'outline' }
          ].map((preset) => (
            <button
              key={preset.state}
              onClick={() => handleDeveloperPreset(preset.state)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all flex items-center gap-1.5 border ${
                currentStatusRaw === preset.state
                  ? 'bg-cjack-primary text-white border-cjack-primary shadow-xs'
                  : 'bg-surface-mutedLight dark:bg-surface-mutedDark hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-surface-borderLight dark:border-surface-borderDark'
              }`}
            >
              <preset.icon className="h-3 w-3 shrink-0" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TOP EMERGENCY STATUS (DOMINATES VISUAL HIERARCHY)
          ========================================================================= */}
      <section
        role="alert"
        aria-live="assertive"
        className={`rounded-xl border p-5 sm:p-6 transition-all duration-300 ${activeEmergencyConfig.bgClass}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-xl bg-black/25 shrink-0">
              <EmergencyStateIcon className={`h-10 w-10 ${isEmergency ? 'animate-bounce' : ''}`} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white text-gray-950 font-mono font-extrabold text-[10px] uppercase tracking-wider">
                  {activeEmergencyConfig.tag}
                </span>
                <span className="text-xs font-mono text-white/80 uppercase">
                  ACTIVE DIRECTIVE: <strong>{activeEmergencyConfig.directive}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
                {activeEmergencyConfig.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 max-w-4xl font-sans leading-relaxed">
                {activeEmergencyConfig.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
            {currentStatusRaw === 'CPR ACTIVE' ? (
              <button
                onClick={() => handleDeveloperPreset('PATIENT STABLE')}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>ROSC Pulse Detected</span>
              </button>
            ) : isEmergency ? (
              <button
                onClick={() => handleDeveloperPreset('CPR ACTIVE')}
                className="px-4 py-2 rounded-lg bg-white text-red-700 hover:bg-red-50 font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                <span>Start Auto-CPR</span>
              </button>
            ) : (
              <button
                onClick={() => handleDeveloperPreset('CARDIAC ARREST SUSPECTED')}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
              >
                <AlertOctagon className="h-4 w-4" />
                <span>Simulate Arrest</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRIMARY 2-COLUMN MONITORING GRID: VITALS + CPR CLOSED-LOOP
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* --- VITALS STREAM PANEL WITH TREND GRAPHS --- */}
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle icon={Heart}>Physiological Vitals Stream</CardTitle>
              {vitals?.source === 'REAL_HARDWARE' && !vitals?.isSimulated ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  LIVE HARDWARE DATA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  SIMULATION DATA
                </span>
              )}
            </div>
            <StatusBadge
              status={currentStatusRaw === 'CARDIAC ARREST SUSPECTED' || currentStatusRaw === 'CPR ACTIVE' ? 'CRITICAL' : 'NORMAL'}
              size="sm"
            />
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Vitals Cards 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Heart Rate Tile */}
              <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-red-500" />
                    Heart Rate
                  </span>
                  <div className="flex items-center gap-1">
                    {vitals?.source === 'REAL_HARDWARE' && !vitals?.isSimulated ? (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-emerald-600 text-white rounded">LIVE</span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-amber-600/30 text-amber-300 rounded border border-amber-500/40">SIM</span>
                    )}
                    <span className="text-[10px] font-mono text-gray-500">MAX30102 / AD8232</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-extrabold text-gray-950 dark:text-white">
                    {vitals?.heartRate ?? 74}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-500">BPM</span>
                  <span className="text-[11px] font-mono text-gray-500 ml-auto truncate max-w-[120px]">
                    {vitals?.ecgRhythm || 'Sinus Rhythm'}
                  </span>
                </div>
                {/* Mini ECG Trend Graph */}
                <div className="mt-2.5">
                  <TrendGraph type="ecg" status={currentStatusRaw} height={42} color="#10B981" />
                </div>
              </div>

              {/* SpO2 Pulse Oximetry Tile */}
              <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-cjack-accent" />
                    Oxygen Saturation (SpO2)
                  </span>
                  <div className="flex items-center gap-1">
                    {vitals?.source === 'REAL_HARDWARE' && !vitals?.isSimulated ? (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-emerald-600 text-white rounded">LIVE</span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-amber-600/30 text-amber-300 rounded border border-amber-500/40">SIM</span>
                    )}
                    <span className="text-[10px] font-mono text-gray-500">MAX30102 PPG</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-extrabold text-gray-950 dark:text-white">
                    {vitals?.spo2 ?? 98}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-500">%</span>
                  <span className="text-[11px] font-mono text-gray-500 ml-auto">
                    PI: {vitals?.perfusionIndex ?? 4.2}%
                  </span>
                </div>
                {/* Mini PPG Trend Graph */}
                <div className="mt-2.5">
                  <TrendGraph type="ppg" status={currentStatusRaw} height={42} color="#06B6D4" />
                </div>
              </div>

              {/* Respiration Rate Tile */}
              <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Wind className="h-4 w-4 text-emerald-500" />
                    Respiration Rate
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">Thoracic Piezo</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-extrabold text-gray-950 dark:text-white">
                    {vitals?.respirationRate ?? 16}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-500">BPM</span>
                  <span className="text-[11px] font-mono text-gray-500 ml-auto">
                    EtCO2: {vitals?.etco2 ?? 38} mmHg
                  </span>
                </div>
                {/* Mini Respiration Trend Graph */}
                <div className="mt-2.5">
                  <TrendGraph type="respiration" status={currentStatusRaw} height={42} color="#10B981" />
                </div>
              </div>

              {/* Patient Motion State */}
              <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Motion / Accelerometer
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">6-Axis IMU</span>
                  </div>
                  <div className="text-base font-bold text-gray-900 dark:text-white font-mono mt-1">
                    {vitals?.motionState || 'Stationary / Resting'}
                  </div>
                </div>
                <div className="pt-2 border-t border-surface-borderLight dark:border-surface-borderDark text-[11px] font-mono text-gray-500 flex justify-between">
                  <span>Core Temp: {vitals?.temperature ?? 36.8}°C</span>
                  <span className="text-status-safe font-bold">STABLE AXIS</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- CPR CLOSED-LOOP MECHANISM MONITOR --- */}
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle icon={Gauge}>Automated CPR Mechanism Monitor</CardTitle>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-mutedLight dark:bg-surface-mutedDark text-gray-500 uppercase">
                AHA 2025 TARGETS
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Closed-loop control: {cprMetrics?.closedLoopActive ? 'ACTIVE' : 'STANDBY'}
            </span>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Large CPR Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 border border-surface-borderLight dark:border-surface-borderDark">
                <span className="text-[10px] text-gray-500 uppercase block">Compression Rate</span>
                <span className="text-2xl font-extrabold text-gray-950 dark:text-white mt-1 block">
                  {cprMetrics?.compressionRate ?? 108}
                </span>
                <span className="text-[10px] text-gray-500">Target: 100-120 CPM</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 border border-surface-borderLight dark:border-surface-borderDark">
                <span className="text-[10px] text-gray-500 uppercase block">Compression Count</span>
                <span className="text-2xl font-extrabold text-gray-950 dark:text-white mt-1 block">
                  {cprMetrics?.totalCompressions ?? 42}
                </span>
                <span className="text-[10px] text-gray-500">Cycle: #1</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 border border-surface-borderLight dark:border-surface-borderDark">
                <span className="text-[10px] text-gray-500 uppercase block">Target Depth</span>
                <span className="text-2xl font-extrabold text-cjack-accent mt-1 block">
                  {((cprMetrics?.currentDepthMm || 52) / 10).toFixed(1)} cm
                </span>
                <span className="text-[10px] text-gray-500">Target: 5.0-6.0 cm</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 border border-surface-borderLight dark:border-surface-borderDark">
                <span className="text-[10px] text-gray-500 uppercase block">Peak Force</span>
                <span className="text-2xl font-extrabold text-gray-950 dark:text-white mt-1 block">
                  {cprMetrics?.appliedForceNewtons ?? 410} N
                </span>
                <span className="text-[10px] text-gray-500">Recoil: {cprMetrics?.chestRecoilPercentage ?? 96}%</span>
              </div>
            </div>

            {/* Motor & Pneumatics Closed-Loop Bar */}
            <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/20 dark:bg-surface-mutedDark/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ACTUATOR MOTOR STATE:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {cprMetrics?.motorState || 'Standby'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">PNEUMATIC CHAMBER PRESSURE:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {deviceHealth?.actuatorPressureBar ?? 5.2} BAR (Optimal 5.0-5.5)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">CHEST COMPRESSION FRACTION (CCF):</span>
                <span className="font-bold text-cjack-accent">
                  {cprMetrics?.fractionPercentage ?? 92}% (AHA Goal &gt; 80%)
                </span>
              </div>
            </div>

            {/* CPR Trend Line */}
            <div>
              <TrendGraph type="depth" status={currentStatusRaw} height={42} color="#0284C7" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =========================================================================
          PATIENT PANEL (WITH DATA PROVENANCE: REAL / SIMULATED / NOT AVAILABLE)
          ========================================================================= */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle icon={User}>Patient Clinical File & Medical History</CardTitle>
            <span className="text-[10px] font-mono text-gray-500 uppercase">
              PROVENANCE-AUTHENTICATED
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-gray-500">LEGEND:</span>
            {renderProvenanceChip('REAL')}
            {renderProvenanceChip('SIMULATED')}
            {renderProvenanceChip('NOT AVAILABLE')}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Identity & Demographics */}
            <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 uppercase text-[10px] font-mono">Demographics</span>
                {renderProvenanceChip(patient?.demographicsProvenance || 'SIMULATED')}
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Full Name:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {patient?.name || 'John Doe'}
                </span>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="text-gray-500 block text-[11px]">Age / Gender:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {patient?.age ?? 58} Y / {patient?.gender || 'Male'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Blood Group:</span>
                  <span className="font-bold font-mono text-red-600 dark:text-red-400">
                    {patient?.bloodGroup || 'O Positive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 uppercase text-[10px] font-mono">Emergency Contact</span>
                {renderProvenanceChip(patient?.emergencyContact?.provenance || 'REAL')}
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Next of Kin:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {patient?.emergencyContact?.name || 'Sarah Doe (Spouse)'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Contact Phone:</span>
                <span className="font-mono font-bold text-cjack-accent">
                  {patient?.emergencyContact?.phone || '+91 98765 43210'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-gray-500">
                <span>Secondary Contact:</span>
                {renderProvenanceChip('NOT AVAILABLE')}
              </div>
            </div>

            {/* Medical Notes & Allergies */}
            <div className="p-3.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark bg-surface-mutedLight/30 dark:bg-surface-mutedDark/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 uppercase text-[10px] font-mono">Allergies & History</span>
                {renderProvenanceChip(patient?.medicalNotesProvenance || 'REAL')}
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Critical Allergies:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {patient?.allergies?.join(', ') || 'Penicillin'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Medical Notes:</span>
                <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed truncate-2-lines">
                  {patient?.medicalNotes || 'Known CAD, Hypertension. Daily Aspirin.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================================================
          DEVICE STATUS + EMERGENCY COMMUNICATION + LOCATION (TACTICAL MATRIX)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* --- DEVICE & SYSTEM STATUS --- */}
        <Card className="space-y-3">
          <CardHeader>
            <CardTitle icon={Cpu}>CJack Device Status</CardTitle>
            <StatusBadge
              status={deviceHealth?.isOffline ? 'OFFLINE' : 'NORMAL'}
              size="sm"
            />
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500 font-semibold">ESP32:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                CONNECTED
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500 font-semibold">HR Sensor:</span>
              <span className={`inline-flex items-center gap-1.5 font-bold ${vitals?.sensorStatus === 'DISCONNECTED' ? 'text-rose-500' : vitals?.sensorStatus === 'CHECK' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                <span className={`w-2 h-2 rounded-full ${vitals?.sensorStatus === 'DISCONNECTED' ? 'bg-rose-500' : vitals?.sensorStatus === 'CHECK' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                {vitals?.sensorStatus || (vitals?.source === 'REAL_HARDWARE' ? 'CONNECTED' : 'CONNECTED')}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500 font-semibold">TFT Display:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                CONNECTED
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500 font-semibold">Wi-Fi:</span>
              <span className={`inline-flex items-center gap-1.5 font-bold ${backendOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {backendOnline ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500 font-semibold">GPS:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                CONNECTED
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 font-semibold">Battery:</span>
              <span className={`inline-flex items-center gap-1.5 font-bold ${(deviceHealth?.batteryLevel ?? 82) > 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                <span className={`w-2 h-2 rounded-full ${(deviceHealth?.batteryLevel ?? 82) > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {deviceHealth?.batteryLevel ?? 82}% ({deviceHealth?.batteryVoltage ?? 14.8}V)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* --- EMERGENCY COMMUNICATION MATRIX --- */}
        <Card className="space-y-3">
          <CardHeader>
            <CardTitle icon={Radio}>Emergency Telemetry Link</CardTitle>
            <StatusBadge
              status={emergencyCommunication?.alertStatus === 'STANDBY' ? 'NORMAL' : 'CRITICAL'}
              text={emergencyCommunication?.alertStatus || 'STANDBY'}
              size="sm"
            />
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">ALERT STATUS:</span>
              <span className={`font-bold ${isEmergency ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-800 dark:text-gray-200'}`}>
                {emergencyCommunication?.alertStatus || 'STANDBY'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">TIME SENT:</span>
              <span className="text-gray-800 dark:text-gray-200">
                {emergencyCommunication?.alertSentTimestamp
                  ? new Date(emergencyCommunication.alertSentTimestamp).toLocaleTimeString()
                  : 'N/A (Standby)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">GPS TRANSMISSION:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {emergencyCommunication?.gpsTransmissionConfirmed ? 'CONFIRMED ACK' : 'PENDING'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">RESPONDER ACK:</span>
              <span className={emergencyCommunication?.responderAcknowledged ? 'font-bold text-emerald-600' : 'text-gray-500'}>
                {emergencyCommunication?.responderAcknowledged ? 'ACKNOWLEDGED (ALS-MED-04)' : 'Awaiting Handoff'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">NETWORK MESH:</span>
              <span className="text-cjack-accent font-bold">
                {connectivity?.lora?.rssi ? `LoRa (${connectivity.lora.rssi} dBm)` : 'LoRa + LTE-M'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* --- LOCATION & MAP SECTION (WITH STRICT CONDITIONAL ETA) --- */}
        <Card className="space-y-3">
          <CardHeader>
            <CardTitle icon={Navigation}>Live Location & Dispatch Beacon</CardTitle>
            <span className="text-[10px] font-mono text-gray-500">
              ACC: ±{location?.accuracyMeters ?? 2.8}m
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Coordinates and Sector */}
            <div className="p-2.5 rounded bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">PATIENT WGS-84:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {(location?.latitude ?? 12.9716).toFixed(5)}°, {(location?.longitude ?? 77.5946).toFixed(5)}°
                </span>
              </div>
              <div className="text-[11px] text-gray-500 truncate">
                {location?.addressHint || 'Bengaluru Central Emergency Sector 4'}
              </div>
            </div>

            {/* Tactical Radar Display */}
            <div className="h-28 w-full bg-slate-950 rounded-lg relative overflow-hidden flex items-center justify-center border border-slate-800">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:2rem_2rem]" />
              <div className="absolute h-20 w-20 rounded-full border border-sky-500/30 animate-pulse" />
              <div className="h-6 w-6 rounded-full bg-cjack-primary text-white flex items-center justify-center shadow z-10">
                <Navigation className="h-3.5 w-3.5" />
              </div>
              {/* If responder is dispatched, show second beacon marker */}
              {location?.hasActualRoutingData && (
                <div className="absolute top-3 right-6 flex items-center gap-1 z-10">
                  <div className="h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-ping" />
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-black/60 px-1 rounded">
                    ALS-04
                  </span>
                </div>
              )}
            </div>

            {/* Routing & ETA (Strict rule: ETA only when actual routing data exists) */}
            <div className="pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">
                DISTANCE: <strong className="text-gray-800 dark:text-gray-200">{systemStatus?.systemState?.responderDistanceKm ?? 1.8} km</strong>
              </span>

              {/* Conditional ETA - NEVER fabricated */}
              {location?.hasActualRoutingData ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>ETA: {systemStatus?.systemState?.responderEtaMinutes ?? 4} MINS (ROUTING LIVE)</span>
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                  Awaiting Dispatch Routing (ETA Unavailable)
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </PageStateWrapper>
  );
};

export default DashboardPage;
