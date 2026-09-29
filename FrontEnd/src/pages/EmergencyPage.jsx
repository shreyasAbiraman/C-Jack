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
import {
  AlertOctagon,
  ShieldAlert,
  Play,
  RotateCcw,
  User,
  MapPin,
  HeartPulse,
  Activity,
  Clock,
  Radio,
  Ambulance,
  PhoneCall,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Gauge,
  Scale
} from 'lucide-react';

import EmergencyFlowDiagram from '../components/emergency/EmergencyFlowDiagram';
import AlertStateMachineDisplay from '../components/emergency/AlertStateMachineDisplay';
import EmergencyTimeline from '../components/emergency/EmergencyTimeline';
import EmergencyContactCard from '../components/emergency/EmergencyContactCard';

export const EmergencyPage = () => {
  const {
    systemStatus,
    emergencyResponse,
    transitionAlertState,
    advanceFlowStage,
    triggerEmergency,
    resetEmergency,
    notifyEmergencyContact,
    loading,
    error,
    backendOnline,
    lastSuccessfulUpdate,
    refreshData
  } = useSystem();

  const { addToast } = useToast();

  const emerData = emergencyResponse || {};
  const alertState = emerData.alertState || 'CREATED';
  const flowStages = emerData.flowStages || [];
  const currentFlowStageIndex = emerData.currentFlowStageIndex ?? 0;
  const isEmergency = emerData.emergencyActive ?? (systemStatus?.systemState?.status === 'Suspected Arrest' || systemStatus?.systemState?.status === 'CPR Active');
  const severity = emerData.severity || (isEmergency ? 'CRITICAL' : 'NORMAL');
  const severityCode = emerData.severityCode || 'LEVEL 1 — CARDIAC ARREST (CODE RED)';
  const alertTimestamp = emerData.alertTimestampFormatted || '10:42:01';
  const elapsedTime = emerData.elapsedTime || '00:24';

  const patient = emerData.patient || systemStatus?.patient || {};
  const location = emerData.location || systemStatus?.location || {};
  const vitals = emerData.vitals || systemStatus?.vitals || {};
  const cpr = emerData.cpr || {};
  const comm = emerData.communication || {};
  const responder = emerData.responder || {};
  const contact = emerData.emergencyContact || {};
  const timeline = emerData.timeline || [];

  // Handlers
  const handleTransitionAlert = async (targetState) => {
    try {
      await transitionAlertState(targetState);
      addToast({
        title: 'Alert State Updated',
        message: `Alert state transitioned to ${targetState}`,
        type: targetState === 'CANCELLED' ? 'info' : 'warning'
      });
    } catch (err) {
      addToast({
        title: 'Transition Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const handleAdvanceStage = async (stageIndex) => {
    try {
      await advanceFlowStage(stageIndex);
      addToast({
        title: 'Emergency Flow Advanced',
        message: `Advanced to stage ${stageIndex + 1}`,
        type: 'info'
      });
    } catch (err) {
      addToast({
        title: 'Step Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const handleTriggerEmergency = async () => {
    try {
      await triggerEmergency();
      addToast({
        title: 'EMERGENCY PROTOCOL ENGAGED',
        message: 'Level 1 Cardiac Arrest Alert broadcasted across LoRa and Cellular networks.',
        type: 'error'
      });
    } catch (err) {
      addToast({
        title: 'Trigger Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  const handleReset = async () => {
    try {
      await resetEmergency();
      addToast({
        title: 'Emergency Protocol Reset',
        message: 'System returned to routine surveillance standby.',
        type: 'info'
      });
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleSimulateContactNotify = async () => {
    try {
      const res = await notifyEmergencyContact();
      addToast({
        title: 'Simulated Notification Logged',
        message: res.message,
        type: 'info'
      });
    } catch (err) {
      addToast({
        title: 'Contact Alert Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  return (
    <PageStateWrapper
      loading={loading}
      error={error}
      isOffline={!backendOnline}
      lastUpdated={lastSuccessfulUpdate}
      hasData={Boolean(emergencyResponse || systemStatus)}
      onRetry={refreshData}
      screenTitle="Emergency Protocol & Orchestration"
    >
      <div className="space-y-6">
      {/* =========================================================================
          SECTION HEADER
          ========================================================================= */}
      <SectionHeader
        title="Emergency Escalation & Response Console"
        question="Is emergency protocol triggered? What is the escalation and dispatch state?"
        statusBadge={
          <StatusBadge
            status={isEmergency ? 'emergency' : 'safe'}
            text={isEmergency ? severityCode : 'SURVEILLANCE STANDBY (NORMAL)'}
            pulse={isEmergency}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            {isEmergency ? (
              <Button
                variant="safe"
                size="sm"
                icon={RotateCcw}
                onClick={handleReset}
              >
                Stand Down Protocol
              </Button>
            ) : (
              <Button
                variant="emergency"
                size="sm"
                icon={Play}
                onClick={handleTriggerEmergency}
              >
                Simulate Cardiac Arrest
              </Button>
            )}
          </div>
        }
      />

      {/* Primary Emergency Severity Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
        isEmergency
          ? 'bg-gradient-to-r from-red-600/15 via-red-500/10 to-transparent border-red-500/50'
          : 'bg-surface-mutedLight/40 dark:bg-surface-mutedDark/40 border-surface-borderLight dark:border-surface-borderDark'
      }`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`p-2.5 rounded-lg shrink-0 ${isEmergency ? 'bg-red-600 text-white animate-bounce' : 'bg-surface-mutedLight dark:bg-surface-mutedDark text-gray-400'}`}>
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                {isEmergency ? 'ACTIVE LIFE THREAT PROTOCOL' : 'STANDBY GUARDIAN MODE'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-mutedLight dark:bg-surface-mutedDark border text-gray-500">
                ALERT STATE: {alertState}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-950 dark:text-white mt-0.5">
              {isEmergency
                ? 'OUT-OF-HOSPITAL CARDIAC ARREST (OHCA) ESCALATION'
                : 'Routine Standby — Biometric Guardian Surveillance Active'}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-sans mt-0.5">
              {isEmergency
                ? 'Dual-sensor verification confirmed ventricular fibrillation. Autonomous closed-loop chest compressions engaged. Encrypted SOS dispatch streamed to municipal EMS.'
                : 'All multi-sensor biometrics (Lead-II ECG, SpO2 photoplethysmogram, respiratory strain) within nominal baseline.'}
            </p>
          </div>
        </div>

        {/* Timestamps & Elapsed Timer */}
        <div className="flex sm:flex-col justify-between sm:text-right font-mono shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-borderLight dark:border-surface-borderDark">
          <div>
            <span className="text-[10px] text-gray-500 uppercase block">Alert Generated</span>
            <strong className="text-xs text-gray-900 dark:text-white">{alertTimestamp}</strong>
          </div>
          <div className="sm:mt-1">
            <span className="text-[10px] text-gray-500 uppercase block">Elapsed Time</span>
            <strong className="text-sm font-extrabold text-red-600 dark:text-red-400">{elapsedTime}</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          EMERGENCY SCREEN TELEMETRY SNAPSHOT GRID (PATIENT, LOCATION, VITALS, CPR, COMM, RESPONDER)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Patient Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle icon={User}>Patient Profile</CardTitle>
            <span className="text-[10px] font-mono text-gray-400 uppercase">{patient.id || 'CJ-PATIENT-8829'}</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Name / Age:</span>
              <strong className="text-gray-900 dark:text-white font-sans">{patient.name || 'John Doe'}, {patient.age || 58}y ({patient.gender || 'M'})</strong>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Blood Group:</span>
              <span className="font-bold text-red-600 dark:text-red-400">{patient.bloodGroup || 'O Positive'}</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Allergies:</span>
              <span className="text-gray-700 dark:text-gray-300">{(patient.allergies || ['Penicillin']).join(', ')}</span>
            </div>
            <div className="pt-1">
              <span className="text-[10px] text-gray-400 uppercase block mb-0.5">Clinical History:</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 font-sans line-clamp-2">
                {patient.medicalNotes || 'Known CAD (Triple Vessel Disease s/p Stent), Hypertension.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. Current Location Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle icon={MapPin}>Current Location & Beacon</CardTitle>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">11 SATS LOCKED</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">GNSS Coordinates:</span>
              <strong className="text-gray-900 dark:text-white font-mono">{location.latitude || 12.9716}° N, {location.longitude || 77.5946}° E</strong>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Fix Accuracy:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">±{location.accuracyMeters || 2.8} meters (3D Fix)</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Elevation:</span>
              <span className="text-gray-700 dark:text-gray-300">{location.altitudeMeters || 920} m ASL</span>
            </div>
            <div className="pt-1">
              <span className="text-[10px] text-gray-400 uppercase block mb-0.5">Address Landmark:</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 font-sans">
                {location.addressHint || 'Bengaluru Central Emergency Sector 4 (MG Road Cross)'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3. Vital Snapshot */}
        <Card highlight={isEmergency && vitals.heartRate === 0}>
          <CardHeader>
            <CardTitle icon={HeartPulse}>Vital Signs Snapshot</CardTitle>
            <span className="text-[10px] font-mono text-red-500 uppercase font-bold">{vitals.ecgRhythm || 'VFib'}</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2 pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <div>
                <span className="text-[10px] text-gray-500 block">HEART RATE</span>
                <span className="text-xl font-bold font-mono text-red-600 dark:text-red-400">
                  {vitals.heartRate ?? 0} <span className="text-xs">BPM</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">SPO2 SATURATION</span>
                <span className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
                  {vitals.spo2 ?? 78}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500">EtCO2:</span> <strong className="text-gray-900 dark:text-white">{vitals.etco2 ?? 18} mmHg</strong>
              </div>
              <div>
                <span className="text-gray-500">Resp Rate:</span> <strong className="text-gray-900 dark:text-white">{vitals.respirationRate ?? 0} /min</strong>
              </div>
            </div>
            <div className="pt-1 text-[11px] text-gray-600 dark:text-gray-300 font-sans flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span>ECG Lead-II: <strong>{vitals.ecgRhythm || 'Ventricular Fibrillation'}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* 4. CPR Status Snapshot */}
        <Card highlight={cpr.state === 'CPR_ACTIVE'}>
          <CardHeader>
            <CardTitle icon={Activity}>Automated CPR Status</CardTitle>
            <span className={`text-[10px] font-mono font-bold uppercase ${cpr.state === 'CPR_ACTIVE' ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
              {cpr.state || 'STANDBY'}
            </span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2 pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <div>
                <span className="text-[10px] text-gray-500 block">COMPRESSION RATE</span>
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                  {cpr.rate ?? 108} <span className="text-xs">CPM</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">DEPTH</span>
                <span className="text-xl font-bold font-mono text-cjack-accent">
                  {cpr.depth ?? 52} <span className="text-xs">mm</span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500">Peak Force:</span> <strong className="text-amber-600 dark:text-amber-400">{cpr.force ?? 410} N</strong>
              </div>
              <div>
                <span className="text-gray-500">Delivered:</span> <strong className="text-gray-900 dark:text-white">{cpr.count ?? 42} cycles</strong>
              </div>
            </div>
            <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-sans flex items-center justify-between">
              <span>Feedback: <strong>{cpr.feedbackStatus || 'ACTIVE_CLOSED_LOOP'}</strong></span>
              <span className="font-mono text-gray-500">{cpr.duration || '02:28'}</span>
            </div>
          </CardContent>
        </Card>

        {/* 5. Communication Status */}
        <Card>
          <CardHeader>
            <CardTitle icon={Radio}>Telemetry Comm Status</CardTitle>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">LORA + 4G DUAL</span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">LoRaWAN Link:</span>
              <strong className="text-gray-900 dark:text-white">{comm.frequency || '868.1 MHz'} (SF7/125kHz)</strong>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Signal (RSSI / SNR):</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{comm.rssi || -72} dBm / {comm.snr || 9.5} dB</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Cellular Fallback:</span>
              <span className="text-gray-700 dark:text-gray-300">{comm.networkTechnology || '4G LTE-M / NB-IoT'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-gray-500">Packets / ACKs:</span>
              <span className="font-bold text-gray-900 dark:text-white">{comm.packetsSent || 1422} sent / {comm.packetsAcked || 1420} ACK</span>
            </div>
          </CardContent>
        </Card>

        {/* 6. Responder Status */}
        <Card highlight={responder.assigned}>
          <CardHeader>
            <CardTitle icon={Ambulance}>EMS Responder Status</CardTitle>
            <span className={`text-[10px] font-mono font-bold uppercase ${responder.assigned ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              {responder.assigned ? 'DISPATCHED' : 'STANDBY'}
            </span>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Unit Callsign:</span>
              <strong className="text-gray-900 dark:text-white font-bold">{responder.callsign || 'ALS-MED-04'}</strong>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Estimated Arrival:</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">{responder.etaMinutes || 4} MINS ({responder.distanceKm || 1.8} km)</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-surface-borderLight dark:border-surface-borderDark">
              <span className="text-gray-500">Transit Speed:</span>
              <span className="text-gray-700 dark:text-gray-300">{responder.speedKmh || 48} km/h (Code 3 Lights/Sirens)</span>
            </div>
            <div className="pt-1 text-[11px] text-gray-600 dark:text-gray-300 font-sans">
              Crew: <strong>{(responder.paramedics || ['Capt. R. Sharma (EMT-P)']).join(', ')}</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =========================================================================
          INTENDED 10-STAGE EMERGENCY FLOW VISUALIZER
          ========================================================================= */}
      <EmergencyFlowDiagram
        stages={flowStages}
        currentStageIndex={currentFlowStageIndex}
        onSelectStage={handleAdvanceStage}
      />

      {/* =========================================================================
          9-STATE ALERT MACHINE ARCHITECTURE
          ========================================================================= */}
      <AlertStateMachineDisplay
        currentState={alertState}
        onTransition={handleTransitionAlert}
      />

      {/* =========================================================================
          CHRONOLOGICAL EVENT TIMELINE & EMERGENCY CONTACT (SIDE BY SIDE ON DESKTOP)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chronological Event Timeline (2 Columns) */}
        <div className="lg:col-span-2">
          <EmergencyTimeline events={timeline} />
        </div>

        {/* Emergency Contact & Telephony Safety Guard (1 Column) */}
        <div className="lg:col-span-1">
          <EmergencyContactCard
            contact={contact}
            onSimulateNotify={handleSimulateContactNotify}
          />
        </div>
      </div>
      </div>
    </PageStateWrapper>
  );
};

export default EmergencyPage;
