/**
 * Emergency Response Service for CJack
 * 
 * Implements:
 * 1. 9-State Alert Machine:
 *    CREATED, SENDING, SENT, ACKNOWLEDGED, RESPONDER_ASSIGNED, EN_ROUTE, ARRIVED, CANCELLED, FAILED
 * 2. 10-Stage Emergency Flow:
 *    Cardiac arrest suspected -> Confirmation -> Emergency alert -> GPS location ->
 *    Patient vitals -> Responder notification -> Responder acknowledgement -> Responder en route -> Arrival -> Handover
 * 3. Chronological Event Timeline with simulated timestamps
 * 4. Emergency Contact info and guarded communication status
 */

const ALERT_STATES = {
  CREATED: 'CREATED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESPONDER_ASSIGNED: 'RESPONDER_ASSIGNED',
  EN_ROUTE: 'EN_ROUTE',
  ARRIVED: 'ARRIVED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED'
};

const EMERGENCY_FLOW_STAGES = [
  { id: 'suspected', label: 'Cardiac arrest suspected', key: 'SUSPECTED', order: 1, desc: 'Dual-sensor trigger: Lead-II asystole & PPG pulsatile collapse' },
  { id: 'confirming', label: 'Confirmation', key: 'CONFIRMATION', order: 2, desc: '3-second verification countdown expired; vest armed' },
  { id: 'alert', label: 'Emergency alert', key: 'EMERGENCY_ALERT', order: 3, desc: 'Encrypted SOS broadcast generated and queued' },
  { id: 'gps', label: 'GPS location', key: 'GPS_LOCATION', order: 4, desc: 'High-precision 3D GNSS coordinates resolved (12.9716 N, 77.5946 E)' },
  { id: 'vitals', label: 'Patient vitals', key: 'PATIENT_VITALS', order: 5, desc: 'Continuous Lead-II ECG and SpO2 telemetry packet appended' },
  { id: 'responder_notify', label: 'Responder notification', key: 'RESPONDER_NOTIFICATION', order: 6, desc: 'Municipal EMS dispatch server alerted via LoRa gateway' },
  { id: 'responder_ack', label: 'Responder acknowledgement', key: 'RESPONDER_ACKNOWLEDGEMENT', order: 7, desc: 'Central EMS dispatch auto-ACK received with confirmation token' },
  { id: 'responder_en_route', label: 'Responder en route', key: 'RESPONDER_EN_ROUTE', order: 8, desc: 'ALS-MED-04 ambulance deployed; ETA 4 mins' },
  { id: 'arrival', label: 'Arrival', key: 'ARRIVAL', order: 9, desc: 'Paramedics on scene; visual contact established' },
  { id: 'handover', label: 'Handover', key: 'HANDOVER', order: 10, desc: 'Patient telemetry and clinical audit log transferred to ALS team' }
];

class EmergencyResponseService {
  constructor() {
    this.alertState = ALERT_STATES.CREATED;
    this.currentFlowStageIndex = 0; // 0 to 9
    this.emergencyActive = false;
    this.alertCreatedAt = Date.now();
    this.severity = 'NORMAL'; // 'NORMAL', 'WARNING', 'CRITICAL'
    this.severityCode = 'LEVEL 1 — CARDIAC ARREST (CODE RED)';

    // Emergency Contact Profile
    this.emergencyContact = {
      name: 'Sarah Doe',
      relationship: 'Spouse (Primary Emergency Contact)',
      phone: '+91 98765 43210',
      smsStatus: 'STANDBY', // 'STANDBY', 'QUEUED_SIMULATED', 'SENT_SIMULATED', 'DELIVERED_SIMULATED'
      callStatus: 'STANDBY', // 'STANDBY', 'QUEUED_SIMULATED', 'IN_PROGRESS_SIMULATED'
      lastNotified: null,
      provenance: 'REAL',
      simulationBlocked: true,
      requiresConfirmation: true
    };

    // Responder Telemetry Profile
    this.responder = {
      assigned: false,
      callsign: 'ALS-MED-04',
      agency: 'Municipal Emergency Medical Services (EMS)',
      unitType: 'Advanced Life Support Ambulance',
      paramedics: ['Capt. R. Sharma (EMT-P)', 'Sgt. M. Fernandes (Paramedic)'],
      distanceKm: 1.8,
      etaMinutes: 4,
      speedKmh: 48,
      status: 'Standby at Sub-Station 4',
      coordinates: { latitude: 12.9810, longitude: 77.6015 }
    };

    // Chronological Event Timeline
    this.timeline = [];

    // Initialize baseline timeline
    this._initializeDefaultTimeline();
  }

  _formatTime(timestamp) {
    const d = new Date(timestamp);
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  _initializeDefaultTimeline() {
    const base = Date.now() - 25000;
    this.timeline = [
      {
        id: 'evt-1',
        time: this._formatTime(base),
        timestamp: new Date(base).toISOString(),
        title: 'Cardiac arrest suspected',
        stage: 'SUSPECTED',
        severity: 'CRITICAL',
        description: 'Dual-sensor trigger: Lead-II asystole & PPG pulsatile waveform collapse detected.'
      },
      {
        id: 'evt-2',
        time: this._formatTime(base + 10000),
        timestamp: new Date(base + 10000).toISOString(),
        title: 'Emergency confirmed',
        stage: 'CONFIRMATION',
        severity: 'CRITICAL',
        description: 'Dual-sensor verification countdown (3s) concluded with zero false-positive motion.'
      },
      {
        id: 'evt-3',
        time: this._formatTime(base + 11000),
        timestamp: new Date(base + 11000).toISOString(),
        title: 'CPR started',
        stage: 'CPR_ACTIVE',
        severity: 'CRITICAL',
        description: 'Automated pneumatic chest compression vest cycling at 108 CPM closed-loop cadence.'
      },
      {
        id: 'evt-4',
        time: this._formatTime(base + 11500),
        timestamp: new Date(base + 11500).toISOString(),
        title: 'GPS acquired',
        stage: 'GPS_LOCATION',
        severity: 'NORMAL',
        description: 'NEO-6M 3D satellite fix resolved coordinates: 12.9716° N, 77.5946° E (Accuracy ±2.8m).'
      },
      {
        id: 'evt-5',
        time: this._formatTime(base + 12000),
        timestamp: new Date(base + 12000).toISOString(),
        title: 'Emergency packet sent',
        stage: 'EMERGENCY_ALERT',
        severity: 'WARNING',
        description: 'LoRa primary radio (868.1 MHz SF7) broadcasted encrypted SOS dispatch telemetry.'
      },
      {
        id: 'evt-6',
        time: this._formatTime(base + 17000),
        timestamp: new Date(base + 17000).toISOString(),
        title: 'Responder acknowledged',
        stage: 'RESPONDER_ACKNOWLEDGEMENT',
        severity: 'NORMAL',
        description: 'Central EMS Dispatch confirmed packet reception with cryptographic token #ACK-9482.'
      }
    ];
  }

  getStatus() {
    let simulationService;
    let cprStateMachineService;
    try {
      simulationService = require('./simulationService');
      cprStateMachineService = require('./cprStateMachineService');
    } catch (e) {}

    const simStatus = simulationService ? simulationService.getSystemStatus() : {};
    const cprState = cprStateMachineService ? cprStateMachineService.getState() : {};

    const elapsedSeconds = Math.floor((Date.now() - this.alertCreatedAt) / 1000);
    const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const secs = String(elapsedSeconds % 60).padStart(2, '0');

    return {
      success: true,
      alertState: this.alertState,
      allowedAlertTransitions: this._getAllowedAlertTransitions(this.alertState),
      flowStages: EMERGENCY_FLOW_STAGES.map((s, idx) => ({
        ...s,
        isCompleted: idx < this.currentFlowStageIndex,
        isCurrent: idx === this.currentFlowStageIndex,
        isPending: idx > this.currentFlowStageIndex
      })),
      currentFlowStage: EMERGENCY_FLOW_STAGES[this.currentFlowStageIndex],
      currentFlowStageIndex: this.currentFlowStageIndex,
      emergencyActive: this.emergencyActive,
      severity: this.severity,
      severityCode: this.severityCode,
      alertTimestamp: new Date(this.alertCreatedAt).toISOString(),
      alertTimestampFormatted: this._formatTime(this.alertCreatedAt),
      elapsedTime: `${mins}:${secs}`,
      elapsedSeconds,

      // Telemetry Snapshots
      patient: simStatus.patient || {
        name: 'John Doe',
        id: 'CJ-PATIENT-8829',
        age: 58,
        gender: 'Male',
        bloodGroup: 'O Positive',
        allergies: ['Penicillin'],
        medicalNotes: 'Known CAD (Triple Vessel Disease s/p Stent), Hypertension.'
      },
      location: simStatus.location || {
        latitude: 12.9716,
        longitude: 77.5946,
        altitudeMeters: 920,
        accuracyMeters: 2.8,
        addressHint: 'Bengaluru Central Emergency Sector 4 (MG Road Cross)'
      },
      vitals: simStatus.vitals || {
        heartRate: 0,
        spo2: 78,
        etco2: 18,
        respirationRate: 0,
        ecgRhythm: 'Ventricular Fibrillation',
        perfusionIndex: 0.6
      },
      cpr: {
        state: cprState.cprState || (this.emergencyActive ? 'CPR_ACTIVE' : 'IDLE'),
        rate: cprState.compressionRate || (this.emergencyActive ? 108 : 0),
        depth: cprState.compressionDepthMm || (this.emergencyActive ? 52 : 0),
        force: cprState.appliedForceNewtons || (this.emergencyActive ? 410 : 0),
        count: cprState.compressionCount || 42,
        feedbackStatus: cprState.feedbackStatus || 'ACTIVE_CLOSED_LOOP',
        duration: cprState.sessionDuration || '02:28'
      },
      communication: {
        loraConnected: true,
        frequency: '868.1 MHz',
        rssi: -72,
        snr: 9.5,
        packetLossRate: '0.2%',
        cellularConnected: true,
        networkTechnology: '4G LTE-M / NB-IoT',
        signalDbm: -68,
        gatewayAckReceived: this.alertState !== ALERT_STATES.CREATED && this.alertState !== ALERT_STATES.SENDING,
        packetsSent: 1422,
        packetsAcked: 1420
      },
      responder: this.responder,
      emergencyContact: this.emergencyContact,
      timeline: this.timeline
    };
  }

  _getAllowedAlertTransitions(currentState) {
    const transitions = {
      [ALERT_STATES.CREATED]: [ALERT_STATES.SENDING, ALERT_STATES.CANCELLED, ALERT_STATES.FAILED],
      [ALERT_STATES.SENDING]: [ALERT_STATES.SENT, ALERT_STATES.FAILED, ALERT_STATES.CANCELLED],
      [ALERT_STATES.SENT]: [ALERT_STATES.ACKNOWLEDGED, ALERT_STATES.FAILED, ALERT_STATES.CANCELLED],
      [ALERT_STATES.ACKNOWLEDGED]: [ALERT_STATES.RESPONDER_ASSIGNED, ALERT_STATES.EN_ROUTE, ALERT_STATES.CANCELLED],
      [ALERT_STATES.RESPONDER_ASSIGNED]: [ALERT_STATES.EN_ROUTE, ALERT_STATES.CANCELLED],
      [ALERT_STATES.EN_ROUTE]: [ALERT_STATES.ARRIVED, ALERT_STATES.CANCELLED],
      [ALERT_STATES.ARRIVED]: [ALERT_STATES.CANCELLED, ALERT_STATES.CREATED],
      [ALERT_STATES.CANCELLED]: [ALERT_STATES.CREATED],
      [ALERT_STATES.FAILED]: [ALERT_STATES.SENDING, ALERT_STATES.CANCELLED, ALERT_STATES.CREATED]
    };
    return transitions[currentState] || [];
  }

  transitionAlertState(targetState) {
    const valid = Object.values(ALERT_STATES);
    const upper = String(targetState).toUpperCase();

    if (!valid.includes(upper)) {
      throw new Error(`Invalid alert state requested: ${targetState}`);
    }

    const previous = this.alertState;
    this.alertState = upper;

    // Log event on state change
    const now = Date.now();
    const timeFormatted = this._formatTime(now);

    let title = `Alert State: ${upper}`;
    let desc = `Emergency alert transitioned from ${previous} to ${upper}.`;
    let severity = 'NORMAL';

    if (upper === ALERT_STATES.CREATED) {
      severity = 'WARNING';
      this.emergencyActive = true;
      this.severity = 'CRITICAL';
    } else if (upper === ALERT_STATES.SENDING) {
      title = 'Transmitting emergency packets';
      desc = 'Broadcasting LoRaWAN SOS beacon and GSM cellular fallback stream.';
      severity = 'WARNING';
    } else if (upper === ALERT_STATES.SENT) {
      title = 'Emergency packet broadcasted';
      desc = 'Radio packets radiating from omnidirectional antenna; awaiting gateway response.';
      severity = 'NORMAL';
    } else if (upper === ALERT_STATES.ACKNOWLEDGED) {
      title = 'Emergency acknowledged by EMS';
      desc = 'Municipal dispatch server confirmed packet integrity with response token.';
      severity = 'NORMAL';
      if (this.currentFlowStageIndex < 6) this.currentFlowStageIndex = 6; // Responder acknowledged
    } else if (upper === ALERT_STATES.RESPONDER_ASSIGNED) {
      title = 'ALS responder assigned';
      desc = `${this.responder.callsign} (${this.responder.unitType}) dispatched to coordinates.`;
      severity = 'NORMAL';
      this.responder.assigned = true;
      this.responder.status = 'Unit en route to patient location';
      if (this.currentFlowStageIndex < 7) this.currentFlowStageIndex = 7;
    } else if (upper === ALERT_STATES.EN_ROUTE) {
      title = 'Responder en route';
      desc = `${this.responder.callsign} proceeding code 3 with lights and sirens. Distance: ${this.responder.distanceKm} km.`;
      severity = 'NORMAL';
      this.responder.assigned = true;
      this.responder.status = `En route — ${this.responder.distanceKm} km away (ETA ${this.responder.etaMinutes} min)`;
      if (this.currentFlowStageIndex < 7) this.currentFlowStageIndex = 7;
    } else if (upper === ALERT_STATES.ARRIVED) {
      title = 'Responder arrived on scene';
      desc = `${this.responder.callsign} paramedics on scene. Initiating physical transfer.`;
      severity = 'NORMAL';
      this.responder.distanceKm = 0;
      this.responder.etaMinutes = 0;
      this.responder.status = 'On scene with patient';
      this.currentFlowStageIndex = 8; // Arrival
    } else if (upper === ALERT_STATES.CANCELLED) {
      title = 'Emergency protocol cancelled';
      desc = 'Clinical operator or responder verified false alarm or manual stand-down.';
      severity = 'NORMAL';
      this.emergencyActive = false;
      this.severity = 'NORMAL';
      this.responder.assigned = false;
      this.responder.status = 'Standby';
    } else if (upper === ALERT_STATES.FAILED) {
      title = 'Emergency transmission failed';
      desc = 'Radio retry limit exceeded. Retrying over backup satellite/cellular bearer.';
      severity = 'CRITICAL';
    }

    this.timeline.unshift({
      id: `evt-${Date.now()}`,
      time: timeFormatted,
      timestamp: new Date(now).toISOString(),
      title,
      stage: upper,
      severity,
      description: desc
    });

    return this.getStatus();
  }

  advanceFlowStage(targetIndexOrKey) {
    let nextIndex;
    if (typeof targetIndexOrKey === 'number') {
      nextIndex = Math.min(EMERGENCY_FLOW_STAGES.length - 1, Math.max(0, targetIndexOrKey));
    } else {
      nextIndex = EMERGENCY_FLOW_STAGES.findIndex(s => s.key === targetIndexOrKey || s.id === targetIndexOrKey);
      if (nextIndex === -1) nextIndex = this.currentFlowStageIndex + 1;
    }

    if (nextIndex >= EMERGENCY_FLOW_STAGES.length) {
      nextIndex = EMERGENCY_FLOW_STAGES.length - 1;
    }

    this.currentFlowStageIndex = nextIndex;
    const stage = EMERGENCY_FLOW_STAGES[nextIndex];

    const now = Date.now();
    const timeFormatted = this._formatTime(now);

    this.timeline.unshift({
      id: `evt-flow-${Date.now()}`,
      time: timeFormatted,
      timestamp: new Date(now).toISOString(),
      title: stage.label,
      stage: stage.key,
      severity: nextIndex <= 2 ? 'CRITICAL' : 'NORMAL',
      description: stage.desc
    });

    // Synchronize alert state machine appropriately
    if (nextIndex === 0 || nextIndex === 1) {
      this.emergencyActive = true;
      this.severity = 'CRITICAL';
      this.alertState = ALERT_STATES.CREATED;
    } else if (nextIndex === 2) {
      this.alertState = ALERT_STATES.SENDING;
    } else if (nextIndex === 3 || nextIndex === 4 || nextIndex === 5) {
      this.alertState = ALERT_STATES.SENT;
    } else if (nextIndex === 6) {
      this.alertState = ALERT_STATES.ACKNOWLEDGED;
    } else if (nextIndex === 7) {
      this.alertState = ALERT_STATES.EN_ROUTE;
      this.responder.assigned = true;
    } else if (nextIndex === 8) {
      this.alertState = ALERT_STATES.ARRIVED;
      this.responder.distanceKm = 0;
      this.responder.etaMinutes = 0;
    } else if (nextIndex === 9) {
      // Handover
      this.alertState = ALERT_STATES.ARRIVED;
    }

    return this.getStatus();
  }

  triggerCardiacArrestEmergency() {
    this.emergencyActive = true;
    this.alertCreatedAt = Date.now();
    this.severity = 'CRITICAL';
    this.severityCode = 'LEVEL 1 — CARDIAC ARREST (CODE RED)';
    this.alertState = ALERT_STATES.CREATED;
    this.currentFlowStageIndex = 0;

    // Reset timeline with active sequence
    this._initializeDefaultTimeline();

    // Notify simulationService and cprStateMachineService
    try {
      const simulationService = require('./simulationService');
      const cprStateMachineService = require('./cprStateMachineService');
      if (simulationService) {
        simulationService.triggerSimulatedEmergency('CARDIAC ARREST SUSPECTED');
      }
      if (cprStateMachineService) {
        cprStateMachineService.transitionTo('CONFIRMING', { force: true });
      }
    } catch (e) {}

    return this.getStatus();
  }

  resetEmergency() {
    this.emergencyActive = false;
    this.severity = 'NORMAL';
    this.severityCode = 'ROUTINE STANDBY (GUARDIAN MODE)';
    this.alertState = ALERT_STATES.CANCELLED;
    this.currentFlowStageIndex = 0;
    this.responder.assigned = false;
    this.responder.distanceKm = 1.8;
    this.responder.etaMinutes = 4;
    this.responder.status = 'Standby at Sub-Station 4';
    this.emergencyContact.smsStatus = 'STANDBY';
    this.emergencyContact.callStatus = 'STANDBY';

    try {
      const simulationService = require('./simulationService');
      const cprStateMachineService = require('./cprStateMachineService');
      if (simulationService) {
        simulationService.triggerSimulatedEmergency('NORMAL');
      }
      if (cprStateMachineService) {
        cprStateMachineService.transitionTo('IDLE', { force: true });
      }
    } catch (e) {}

    return this.getStatus();
  }

  notifyEmergencyContact(options = {}) {
    // Strictly simulated notification — blocks real calls
    const now = Date.now();
    this.emergencyContact.lastNotified = new Date(now).toISOString();
    this.emergencyContact.smsStatus = 'DELIVERED_SIMULATED';
    this.emergencyContact.callStatus = 'QUEUED_SIMULATED';

    this.timeline.unshift({
      id: `evt-contact-${Date.now()}`,
      time: this._formatTime(now),
      timestamp: new Date(now).toISOString(),
      title: 'Emergency contact simulated alert sent',
      stage: 'CONTACT_ALERT',
      severity: 'NORMAL',
      description: `Automated SMS sent to ${this.emergencyContact.name} (${this.emergencyContact.phone}). SIMULATION: Real telephone calls are disabled.`
    });

    return {
      success: true,
      simulated: true,
      message: `Simulated notification sent to emergency contact (${this.emergencyContact.name}). Real calls are disabled in simulation harness.`,
      contact: this.emergencyContact
    };
  }
}

module.exports = new EmergencyResponseService();
