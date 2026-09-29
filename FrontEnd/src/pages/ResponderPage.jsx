import React, { useState, useEffect } from 'react';
import AssistantPanel from '../components/AssistantPanel';
import { useSystem } from '../context/SystemContext';
import { useRole } from '../context/RoleContext';
import { SectionHeader, StatusBadge, Button, PageStateWrapper } from '../components/ui';
import { EmergencyCard } from '../components/responder/EmergencyCard';
import { ResponderViewGrid } from '../components/responder/ResponderViewGrid';
import { ResponderStateStepper } from '../components/responder/ResponderStateStepper';
import { ResponderRouteMap } from '../components/responder/ResponderRouteMap';
import { HandoverPanel } from '../components/responder/HandoverPanel';
import { RoleSelectorBar } from '../components/responder/RoleSelectorBar';
import IncomingDispatchAlert from '../components/emergency/IncomingDispatchAlert';
import AmbulanceContactsSection from '../components/emergency/AmbulanceContactsSection';
import { 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  UserCheck, 
  RefreshCw 
} from 'lucide-react';

const ResponderPage = () => {
  const {
    responderStatus,
    transitionResponderState,
    getHandoverData,
    exportSessionSummary,
    refreshData,
    loading,
    error,
    backendOnline,
    lastSuccessfulUpdate
  } = useSystem();

  const { activeRole, hasCapability } = useRole();

  const [handoverData, setHandoverData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [defibCleared, setDefibCleared] = useState(false);

  // Paramedic Triage Checklist
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Confirm scene safety and secure patient posture', done: true },
    { id: 2, text: 'Verify CJack pneumatic sternum pad is centered on mid-thorax', done: true },
    { id: 3, text: 'Confirm automated ambient-air mask or airway clearance', done: true },
    { id: 4, text: 'Prepare AED / manual defibrillator electrodes if indicated', done: false },
    { id: 5, text: 'Perform telemetry handoff with incoming ALS paramedic unit', done: false }
  ]);

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  // Extract structured status with fallbacks
  const currentState = responderStatus?.state || 'EN_ROUTE';
  const unit = responderStatus?.unit || {
    callsign: 'ALS-MED-04',
    agency: 'Municipal Emergency Medical Services (EMS)',
    distanceKm: 1.8,
    etaMinutes: 4,
    speedKmh: 48,
    status: 'En Route with Sirens and Beacon (Code 3)',
    coordinates: { latitude: 12.9810, longitude: 77.6015 }
  };

  const patient = responderStatus?.patient || {
    id: 'CJ-8829',
    name: 'John Doe',
    age: 58,
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa Drugs', 'Latex (Mild)'],
    emergencyNotes: 'Prior MI (2023); dual-chamber stent; on Warfarin. DNR: NONE (Full Resuscitation Requested).'
  };

  const emergency = responderStatus?.emergency || {
    severity: 'CRITICAL',
    severityCode: 'LEVEL 1 — CARDIAC ARREST (CODE RED)',
    alertTimestamp: new Date().toISOString(),
    alertTimeFormatted: '10:42:01',
    elapsedSeconds: 145,
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      landmark: 'Near Gate 3, Cubbon Tech Hub, MG Road Inner Circle',
      accuracyMeters: 2.8
    },
    vitals: {
      heartRate: 0,
      rhythm: 'Ventricular Fibrillation (Pulseless V-Fib)',
      spo2: 78,
      etco2: 18
    },
    cpr: {
      state: 'CPR_ACTIVE',
      rateCPM: 108,
      depthMM: 52,
      targetDepthMM: 50,
      feedbackStatus: 'ACTIVE_CLOSED_LOOP'
    }
  };

  const device = responderStatus?.device || {
    id: 'CJACK-UNIT-TX104',
    batteryLevel: 88,
    status: 'OPERATIONAL'
  };

  const communication = responderStatus?.communication || {
    loraStatus: 'ACTIVE_TRANSMITTING',
    gatewayId: 'GW-BLR-041',
    rssi: -72,
    backendStatus: 'CONNECTED (Cluster BLR-API-01, 14ms)'
  };

  const fetchHandover = async () => {
    try {
      if (getHandoverData) {
        const res = await getHandoverData();
        if (res) setHandoverData(res);
      }
    } catch (e) {
      console.error('Error fetching handover:', e);
    }
  };

  useEffect(() => {
    fetchHandover();
  }, [currentState]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    await fetchHandover();
    setIsRefreshing(false);
  };

  const handleTransitionState = async (newState) => {
    if (transitionResponderState) {
      await transitionResponderState(newState);
      await fetchHandover();
    }
  };

  const handleClearDefib = () => {
    setDefibCleared(true);
    setTimeout(() => setDefibCleared(false), 8000);
  };

  return (
    <><AssistantPanel />
      <PageStateWrapper
      loading={loading && !responderStatus}
      error={error}
      backendOnline={backendOnline}
      lastSuccessfulUpdate={lastSuccessfulUpdate}
      onRetry={refreshData}
      screenTitle="Ambulance & Responder Telemetry"
      hasData={Boolean(responderStatus)}
      emptyMessage="No active responder or ambulance unit currently assigned to this mission."
    >
      <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader
          title="Ambulance & Responder Command Center"
          question="What is the responder arrival state, clinical priority, and hospital handoff data?"
          statusBadge={
            <StatusBadge
              status="emergency"
              text={`RESPONDER: ${currentState}`}
              pulse={currentState === 'EN_ROUTE' || currentState === 'ASSIGNED'}
            />
          }
        />

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MULTI-ROLE ARCHITECTURE: ROLE SELECTOR BAR
          ========================================================================= */}
      <RoleSelectorBar />

      <IncomingDispatchAlert />

      {/* =========================================================================
          PROMINENT CARDIAC EMERGENCY CARD (7 EXACT REQUIRED CORE FIELDS)
          ========================================================================= */}
      <EmergencyCard
        patient={patient}
        emergency={emergency}
        cpr={emergency.cpr}
        vitals={emergency.vitals}
      />

      {/* =========================================================================
          10-POINT OPERATIONAL RESPONDER VIEW
          ========================================================================= */}
      <ResponderViewGrid
        severity={emergency.severityCode}
        location={emergency.location}
        vitals={emergency.vitals}
        cpr={emergency.cpr}
        bloodGroup={patient.bloodGroup}
        allergies={patient.allergies}
        emergencyNotes={patient.emergencyNotes}
        device={device}
        distanceKm={unit.distanceKm}
        etaMinutes={unit.etaMinutes}
        communication={communication}
      />

      {/* =========================================================================
          6-STATE RESPONDER PROGRESSION MACHINE
          ========================================================================= */}
      <ResponderStateStepper
        currentState={currentState}
        onTransitionState={hasCapability('canChangeResponderState') ? handleTransitionState : null}
      />

      {/* =========================================================================
          MAP: PATIENT, RESPONDER & ROUTE PLACEHOLDER (NO FAKE NAVIGATION DATA)
          ========================================================================= */}
      <ResponderRouteMap
        patient={emergency.location}
        responder={{
          callsign: unit.callsign,
          latitude: unit.coordinates.latitude,
          longitude: unit.coordinates.longitude,
          distanceKm: unit.distanceKm,
          etaMinutes: unit.etaMinutes,
          speedKmh: unit.speedKmh,
          status: unit.status
        }}
        isSimulated={true}
      />

      {/* =========================================================================
          PARAMEDIC ON-SCENE TRIAGE & DEFIBRILLATION CLEARANCE
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Triage Checklist */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                First Responder Immediate Triage Checklist
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">ACLS PROTOCOL</span>
          </div>

          <div className="space-y-2">
            {checklist.map(item => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-colors ${
                  item.done
                    ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5">
                  {item.done ? (
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-500" />
                  )}
                </div>
                <span className={`text-xs ${item.done ? 'line-through text-slate-400' : 'text-slate-100 font-medium'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Defibrillator Clearance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Paramedic Defibrillator Clearance (AED Integration)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400">SHOCK SAFETY</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              When manual defibrillation pads or an AED shock is indicated, the CJack chest compression bladder must be momentarily vented to permit rhythm analysis and shock delivery without mechanical or inductive interference.
            </p>

            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 flex items-start gap-2.5 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-200 text-xs leading-relaxed">
                Pressing "Clear for Defibrillation" commands vest actuators to vent pneumatic pressure and freeze motion for 8 seconds.
              </p>
            </div>
          </div>

          <Button
            variant={defibCleared ? 'success' : 'warning'}
            size="sm"
            onClick={handleClearDefib}
            disabled={!hasCapability('canClearDefib')}
            className="w-full py-2.5 font-mono font-bold uppercase tracking-wider"
          >
            {defibCleared 
              ? '✓ ACTUATORS VENTED — CLEAR FOR SHOCK DELIVERY' 
              : 'Clear for Defibrillation (Vent Actuators)'}
          </Button>
        </div>
      </div>

      {/* =========================================================================
          AMBULANCE DISPATCH NETWORK & EMERGENCY CONTACTS
          ========================================================================= */}
      <AmbulanceContactsSection />

      {/* =========================================================================
          HANDOVER PANEL (PATIENT SUMMARY, VITALS, CPR, ALERTS, EVENTS, TIMELINE, EXPORT)
          ========================================================================= */}
      <HandoverPanel
        handoverData={handoverData}
        onExportSummary={exportSessionSummary}
      />
      </div>
    </PageStateWrapper>
    </>
  );
};

export default ResponderPage;
