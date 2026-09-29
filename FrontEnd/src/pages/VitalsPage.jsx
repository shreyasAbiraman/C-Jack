import React from 'react';
import { useSystem } from '../context/SystemContext';
import {
  SectionHeader,
  StatusBadge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  TrendGraph,
  PageStateWrapper
} from '../components/ui';
import VitalHistoryChart from '../components/vitals/VitalHistoryChart';
import SensorHealthPanel from '../components/vitals/SensorHealthPanel';
import VitalAlertsPanel from '../components/vitals/VitalAlertsPanel';
import {
  Heart,
  Activity,
  Wind,
  Zap,
  Radio,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Info
} from 'lucide-react';

export const VitalsPage = () => {
  const {
    vitals,
    systemStatus,
    connectivity,
    loading,
    error,
    backendOnline,
    lastSuccessfulUpdate,
    refreshData
  } = useSystem();

  const status = systemStatus?.systemState?.status || 'NORMAL';
  const isEmergency = status === 'CARDIAC ARREST SUSPECTED' || status === 'CPR ACTIVE';

  // Helper for source tags
  const renderSourceBadge = (source = 'Simulation') => {
    const isHw = source === 'Hardware';
    const isUnavail = source === 'Unavailable';

    return (
      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border select-none ${
        isHw
          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
          : isUnavail
          ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300'
          : 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800'
      }`}>
        Source: {isHw ? 'Hardware' : isUnavail ? 'Unavailable' : 'Simulation'}
      </span>
    );
  };

  const hrValue = vitals?.heartRate ?? 74;
  const spo2Value = vitals?.spo2 ?? 98;
  const respValue = vitals?.respirationRate ?? 16;
  const etco2Value = vitals?.etco2 ?? 38;

  const hrStatus = hrValue === 0 || hrValue > 140 ? 'CRITICAL' : hrValue < 50 || hrValue > 110 ? 'WARNING' : 'NORMAL';
  const spo2Status = spo2Value < 88 ? 'CRITICAL' : spo2Value < 93 ? 'WARNING' : 'NORMAL';

  return (
    <PageStateWrapper
      loading={loading}
      error={error}
      isOffline={!backendOnline}
      lastUpdated={lastSuccessfulUpdate}
      hasData={Boolean(vitals)}
      onRetry={refreshData}
      screenTitle="Physiological Vitals Surveillance"
    >
      <div className="space-y-6">
        <SectionHeader
        title="Physiological Vitals Surveillance & Trends"
        question="What are the current vitals? What does the multi-interval time trend reveal?"
        statusBadge={
          <StatusBadge
            status={isEmergency ? 'CRITICAL' : 'NORMAL'}
            text={vitals?.ecgRhythm || 'Sinus Rhythm Nominal'}
            pulse={isEmergency}
          />
        }
      />

      {/* Advisory Banner */}
      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px]">
            NON-DIAGNOSTIC TELEMETRY
          </span>
          <span>
            Interface displays raw and filtered sensor metrics. Not an automated medical diagnostic device.
          </span>
        </div>
        <div className="hidden sm:block text-[10px] text-slate-500">
          SAMPLING: 250 Hz (ECG) / 100 Hz (PPG)
        </div>
      </div>

      {/* =========================================================================
          LIVE VITAL MONITORING CARDS (WITH EXPLICIT DATA SOURCE)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Heart Rate & Rhythm Card */}
        <Card highlight={hrStatus === 'CRITICAL'}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
              <Heart className={`h-4 w-4 ${hrStatus === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-red-500'}`} />
              <span>Heart Rate & Rhythm</span>
            </div>
            {renderSourceBadge('Simulation')}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-extrabold text-gray-950 dark:text-white">
              {hrValue}
            </span>
            <span className="text-xs font-mono font-bold text-gray-500">BPM</span>
            <StatusBadge status={hrStatus} size="sm" className="ml-auto" />
          </div>

          <div className="text-xs font-mono text-gray-600 dark:text-gray-300 mt-1">
            Rhythm: <strong>{vitals?.ecgRhythm || 'Normal Sinus Rhythm'}</strong>
          </div>

          {/* Mini dynamic sweep strip */}
          <div className="mt-3">
            <TrendGraph type="ecg" status={hrStatus} height={44} color="#EF4444" />
          </div>

          <div className="mt-2.5 pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between text-[11px] font-mono text-gray-500">
            <span>Sensor: AD8232 Lead-II</span>
            <span>Target: 60 - 100</span>
          </div>
        </Card>

        {/* Oxygen Saturation (SpO2) Card */}
        <Card highlight={spo2Status === 'CRITICAL'}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
              <Activity className="h-4 w-4 text-cjack-accent" />
              <span>Oxygen Saturation (SpO2)</span>
            </div>
            {renderSourceBadge('Simulation')}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-extrabold text-gray-950 dark:text-white">
              {spo2Value}
            </span>
            <span className="text-xs font-mono font-bold text-gray-500">%</span>
            <StatusBadge status={spo2Status} size="sm" className="ml-auto" />
          </div>

          <div className="text-xs font-mono text-gray-600 dark:text-gray-300 mt-1">
            Perfusion Index (PI): <strong>{vitals?.perfusionIndex ?? 4.2}%</strong>
          </div>

          {/* Mini dynamic sweep strip */}
          <div className="mt-3">
            <TrendGraph type="ppg" status={spo2Status} height={44} color="#06B6D4" />
          </div>

          <div className="mt-2.5 pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between text-[11px] font-mono text-gray-500">
            <span>Sensor: MAX30102 Optical</span>
            <span>Target: 95 - 100%</span>
          </div>
        </Card>

        {/* Respiration & Capnography */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
              <Wind className="h-4 w-4 text-emerald-500" />
              <span>Respiration & EtCO2</span>
            </div>
            {renderSourceBadge('Simulation')}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-extrabold text-gray-950 dark:text-white">
              {respValue}
            </span>
            <span className="text-xs font-mono font-bold text-gray-500">BPM</span>
            <span className="text-xs font-mono text-gray-500 ml-auto">
              EtCO2: <strong className="text-gray-900 dark:text-white">{etco2Value} mmHg</strong>
            </span>
          </div>

          <div className="text-xs font-mono text-gray-600 dark:text-gray-300 mt-1">
            Thoracic Impedance: <strong>Nominal Sinusoidal</strong>
          </div>

          {/* Mini dynamic sweep strip */}
          <div className="mt-3">
            <TrendGraph type="respiration" status="NORMAL" height={44} color="#10B981" />
          </div>

          <div className="mt-2.5 pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between text-[11px] font-mono text-gray-500">
            <span>Sensor: Thoracic Piezo</span>
            <span>Target: 12 - 20 BPM</span>
          </div>
        </Card>

        {/* Motion & Accelerometer */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Motion & Patient Posture</span>
            </div>
            {renderSourceBadge('Simulation')}
          </div>

          <div className="text-2xl font-mono font-extrabold text-gray-900 dark:text-white mt-1">
            {vitals?.motionState || 'Stationary / Resting'}
          </div>

          <p className="text-xs text-gray-500 font-sans mt-1">
            6-Axis IMU accelerometer filters ambulatory movement from ECG / PPG signal paths.
          </p>

          <div className="mt-4 pt-2.5 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between text-[11px] font-mono text-gray-500">
            <span>Sensor: MPU6050 6-DOF</span>
            <span className="text-status-safe font-bold">ARTIFACT-FREE</span>
          </div>
        </Card>

        {/* Sensor Array Connectivity Tile */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
              <Radio className="h-4 w-4 text-cjack-accent" />
              <span>Sensor Harness Connectivity</span>
            </div>
            {renderSourceBadge('Simulation')}
          </div>

          <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ALL 6 LEADS SECURE
          </div>

          <p className="text-xs text-gray-500 font-sans mt-1">
            Chest harness impedance balanced. Hardware ingestion ready on GPIO 34/35.
          </p>

          <div className="mt-4 pt-2.5 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between text-[11px] font-mono text-gray-500">
            <span>Hardware Target: ESP32 ADC</span>
            <span className="text-cjack-accent font-bold">ARMED</span>
          </div>
        </Card>

        {/* Core Temperature Tile */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
              <Activity className="h-4 w-4 text-amber-500" />
              <span>Body Temperature</span>
            </div>
            {renderSourceBadge('Simulation')}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-mono font-extrabold text-gray-950 dark:text-white">
              {vitals?.temperature ?? 36.8}
            </span>
            <span className="text-xs font-mono font-bold text-gray-500">°C</span>
            <StatusBadge status="NORMAL" size="sm" className="ml-auto" />
          </div>

          <p className="text-xs text-gray-500 font-sans mt-1">
            Sub-clavicular thermistor monitoring core normothermia.
          </p>

          <div className="mt-4 pt-2.5 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between text-[11px] font-mono text-gray-500">
            <span>Target: 36.5 - 37.5°C</span>
            <span className="text-status-safe font-bold">NORMOTHERMIC</span>
          </div>
        </Card>
      </div>

      {/* =========================================================================
          VITAL HISTORY TIME-BASED CHARTS (1m, 5m, 15m, session)
          ========================================================================= */}
      <VitalHistoryChart />

      {/* =========================================================================
          SENSOR HEALTH & INTEGRITY SURVEILLANCE
          ========================================================================= */}
      <SensorHealthPanel />

      {/* =========================================================================
          CLINICAL TELEMETRY WARNINGS & ALERTS MATRIX
          ========================================================================= */}
      <VitalAlertsPanel />
      </div>
    </PageStateWrapper>
  );
};

export default VitalsPage;
