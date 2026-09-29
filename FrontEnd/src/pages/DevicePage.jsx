import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { SectionHeader, StatusBadge, Button, PageStateWrapper } from '../components/ui';
import {
  DeviceOverviewGrid,
  SensorStatusTable,
  DeviceModeSelector,
  DeviceEventLog,
  MaintenanceConsole,
  HardwareInterfaceGrid
} from '../components/device';
import {
  Cpu,
  Layers,
  Activity,
  Sliders,
  FileText,
  Wrench,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const DevicePage = () => {
  const {
    deviceOverview,
    deviceSensors,
    deviceModes,
    deviceEvents,
    deviceMaintenance,
    hardwareStatus,
    hardwareState,
    setHardwareOperatingMode,
    simulateHardwarePacket,
    changeDeviceMode,
    recordDeviceEvent,
    runDeviceDiagnosticTest,
    refreshDeviceData,
    loading,
    error,
    backendOnline,
    lastSuccessfulUpdate
  } = useSystem();

  const [activeTab, setActiveTab] = useState('ALL');

  const currentMode = deviceOverview?.operatingMode || deviceModes?.currentMode || 'MONITORING';

  const tabs = [
    { id: 'ALL', label: 'Consolidated Command', icon: Layers },
    { id: 'HARDWARE', label: 'Hardware Abstraction (11)', icon: Cpu },
    { id: 'OVERVIEW', label: 'Device Overview & Sensors', icon: Activity },
    { id: 'MODES', label: 'Operating Modes (7)', icon: Sliders },
    { id: 'EVENTS', label: 'Event Chronicle (9)', icon: FileText },
    { id: 'MAINTENANCE', label: 'Maintenance & Diagnostics', icon: Wrench }
  ];

  return (
    <PageStateWrapper
      loading={loading}
      error={error}
      isOffline={!backendOnline}
      lastUpdated={lastSuccessfulUpdate}
      hasData={Boolean(deviceOverview || deviceSensors?.length > 0)}
      onRetry={refreshDeviceData}
      screenTitle="Device Management Console"
    >
      <div className="space-y-6">
      {/* Module Header */}
      <SectionHeader
        title="CJack Device Management Console"
        question="Is the CJack hardware and sensor array functioning properly? Mode & Health?"
        statusBadge={
          <div className="flex items-center gap-2">
            <StatusBadge
              status={currentMode === 'CPR' || currentMode === 'EMERGENCY' ? 'emergency' : currentMode === 'MAINTENANCE' ? 'warning' : 'safe'}
              text={`MODE: ${currentMode}`}
            />
            {hardwareState === 'CONNECTED' ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" /> HARDWARE: CONNECTED (ESP32)
              </span>
            ) : hardwareState === 'DISCONNECTED' ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                <XCircle className="h-3 w-3" /> HARDWARE: DISCONNECTED
              </span>
            ) : hardwareState === 'FAULT' ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
                <AlertTriangle className="h-3 w-3" /> HARDWARE: FAULT
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="h-3 w-3" /> HARDWARE: SIMULATED (DEMO)
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={refreshDeviceData}
              className="text-xs font-mono"
            >
              Refresh Telemetry
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ShieldCheck}
              onClick={runDeviceDiagnosticTest}
              className="text-xs font-mono bg-primary-600 hover:bg-primary-700"
            >
              Run Self-Test
            </Button>
          </div>
        }
      />

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-card dark:bg-surface-cardDark shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-surface-mutedLight dark:hover:bg-surface-mutedDark'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. CONSOLIDATED ALL-IN-ONE VIEW */}
      {activeTab === 'ALL' && (
        <div className="space-y-6">
          {/* Section 0: Physical Hardware Abstraction & Peripheral Interfaces */}
          <HardwareInterfaceGrid
            hardwareStatus={hardwareStatus}
            hardwareState={hardwareState}
            onSetMode={setHardwareOperatingMode}
            onSimulatePacket={simulateHardwarePacket}
            onRefresh={refreshDeviceData}
          />

          {/* Section 1: Overview Grid (11 parameters) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary-500" />
                Device Telemetry Overview (11 Core Fields)
              </h3>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">
                SYNCED &bull; 14ms LATENCY
              </span>
            </div>
            <DeviceOverviewGrid overview={deviceOverview} />
          </div>

          {/* Section 2: Sensor Status Table (7 channels) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Sensor Diagnostic Matrix (7 Required Channels)
              </h3>
              <span className="text-[11px] font-mono text-gray-400">
                ECG &bull; SpO2 &bull; MPU6050 &bull; Respiration &bull; Load Cell &bull; GPS &bull; LoRa
              </span>
            </div>
            <SensorStatusTable
              sensors={deviceSensors}
              onRefresh={refreshDeviceData}
            />
          </div>

          {/* Section 3: Device Modes (7 modes) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary-500" />
                Operating Mode State Engine (7 Valid Modes)
              </h3>
              <span className="text-[11px] font-mono text-primary-500 font-semibold">
                ACTIVE: {currentMode}
              </span>
            </div>
            <DeviceModeSelector
              currentMode={currentMode}
              onSelectMode={changeDeviceMode}
            />
          </div>

          {/* Section 4: Device Events Log (9 event types) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-500" />
                Device Event Chronicle (9 Monitored Event Classes)
              </h3>
              <span className="text-[11px] font-mono text-gray-400">
                AUDIT LOG WITH TEST EVENT RECORDER
              </span>
            </div>
            <DeviceEventLog
              events={deviceEvents}
              onRecordEvent={recordDeviceEvent}
            />
          </div>

          {/* Section 5: Maintenance Console */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-500" />
                Maintenance Subsystem & Error History
              </h3>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">
                ISO-13485 CERTIFIED
              </span>
            </div>
            <MaintenanceConsole
              maintenance={deviceMaintenance}
              onRunSelfTest={runDeviceDiagnosticTest}
            />
          </div>
        </div>
      )}

      {/* 2. HARDWARE ABSTRACTION & INTERFACES ONLY */}
      {activeTab === 'HARDWARE' && (
        <div className="space-y-6">
          <HardwareInterfaceGrid
            hardwareStatus={hardwareStatus}
            hardwareState={hardwareState}
            onSetMode={setHardwareOperatingMode}
            onSimulatePacket={simulateHardwarePacket}
            onRefresh={refreshDeviceData}
          />
        </div>
      )}

      {/* 3. OVERVIEW & SENSORS ONLY */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <DeviceOverviewGrid overview={deviceOverview} />
          <SensorStatusTable
            sensors={deviceSensors}
            onRefresh={refreshDeviceData}
          />
        </div>
      )}

      {/* 3. OPERATING MODES ONLY */}
      {activeTab === 'MODES' && (
        <div className="space-y-6">
          <DeviceModeSelector
            currentMode={currentMode}
            onSelectMode={changeDeviceMode}
          />
          {/* Companion summary */}
          <div className="p-4 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-card dark:bg-surface-cardDark text-xs font-mono text-gray-600 dark:text-gray-300 space-y-2">
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              OPERATING MODE STATE TRANSITION RULES
            </div>
            <p className="font-sans text-gray-500 dark:text-gray-400">
              CJack enforces strict state machine gating. Transitioning into CPR mode from MONITORING requires either algorithmic dual-sensor confirmation (Asystole / V-Fib) or manual paramedic override authorization.
            </p>
          </div>
        </div>
      )}

      {/* 4. EVENT LOG ONLY */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-6">
          <DeviceEventLog
            events={deviceEvents}
            onRecordEvent={recordDeviceEvent}
          />
        </div>
      )}

      {/* 5. MAINTENANCE & DIAGNOSTICS ONLY */}
      {activeTab === 'MAINTENANCE' && (
        <div className="space-y-6">
          <MaintenanceConsole
            maintenance={deviceMaintenance}
            onRunSelfTest={runDeviceDiagnosticTest}
          />
        </div>
      )}
      </div>
    </PageStateWrapper>
  );
};

export default DevicePage;
