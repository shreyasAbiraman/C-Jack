/**
 * Responder & Ambulance Service for CJack
 * 
 * Manages:
 * 1. 6-State Responder Machine:
 *    AVAILABLE -> ASSIGNED -> ACKNOWLEDGED -> EN_ROUTE -> ARRIVED -> HANDOVER_COMPLETE
 * 2. Responder Unit Telemetry (ALS-MED-04)
 * 3. 10-Point Responder Situational Overview
 * 4. Clinical Handover Data Packet:
 *    - Patient summary (demographics, blood group, allergies, emergency notes)
 *    - Vital history
 *    - CPR session metrics
 *    - Alerts & safety flags
 *    - Device events & error logs
 *    - Chronological timeline
 * 5. Session Summary Export Formatter
 * 6. Multi-Role Definitions & Capabilities:
 *    - Rider/Patient, Responder, Ambulance, Hospital, Administrator
 */

const RESPONDER_STATES = {
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  EN_ROUTE: 'EN_ROUTE',
  ARRIVED: 'ARRIVED',
  HANDOVER_COMPLETE: 'HANDOVER_COMPLETE'
};

const ROLES = {
  RIDER_PATIENT: {
    id: 'RIDER_PATIENT',
    name: 'Rider / Patient',
    badge: 'USER-WEARER',
    desc: 'Smart vest telemetry wearer with rapid SOS trigger and personal health monitoring',
    capabilities: ['VIEW_OWN_VITALS', 'TRIGGER_SOS', 'VIEW_BATTERY', 'VIEW_GUIDANCE']
  },
  RESPONDER: {
    id: 'RESPONDER',
    name: 'First Responder',
    badge: 'FIRST-AID EMT',
    desc: 'On-scene bystander / first-aid responder executing triage and CPR defibrillation clearance',
    capabilities: ['VIEW_PATIENT_SUMMARY', 'EXECUTE_TRIAGE', 'DEFIB_CLEARANCE', 'VIEW_CPR_CADENCE']
  },
  AMBULANCE: {
    id: 'AMBULANCE',
    name: 'Ambulance Paramedic',
    badge: 'ALS-MED-04',
    desc: 'In-transit Advanced Life Support crew monitoring live vitals, route placeholder, and staging handover',
    capabilities: ['ACKNOWLEDGE_DISPATCH', 'ROUTE_TRACKING', 'LIVE_VITALS_STREAM', 'EXECUTE_HANDOVER', 'EXPORT_AUDIT']
  },
  HOSPITAL: {
    id: 'HOSPITAL',
    name: 'Hospital Trauma Bay',
    badge: 'ED TRAUMA-1',
    desc: 'Emergency Department catheterization lab receiving pre-arrival telemetry and clinical handoff',
    capabilities: ['PRE_ARRIVAL_ALERT', 'BED_ALLOCATION', 'CATH_LAB_PREP', 'INGEST_HANDOVER_RECORD']
  },
  ADMINISTRATOR: {
    id: 'ADMINISTRATOR',
    name: 'System Administrator',
    badge: 'SYS-OVERRIDE',
    desc: 'Platform supervisor managing device firmware, gateway health, and calibration overrides',
    capabilities: ['SYSTEM_OVERRIDE', 'FIRMWARE_CONFIG', 'GATEWAY_HEALTH', 'GLOBAL_AUDIT_LOGS']
  }
};

class ResponderService {
  constructor() {
    this.currentState = RESPONDER_STATES.EN_ROUTE;
    this.stateUpdatedAt = new Date().toISOString();

    // Responder Unit Profile
    this.unit = {
      callsign: 'ALS-MED-04',
      agency: 'Municipal Emergency Medical Services (EMS)',
      station: 'St. John Central Trauma Sub-Station 4',
      unitType: 'Advanced Life Support Ambulance',
      vehicleModel: 'Mercedes-Benz Sprinter 319 CDI ALS Mobile ICU',
      paramedics: [
        { name: 'Capt. R. Sharma', role: 'Lead Paramedic (EMT-P)', cert: 'ACLS / PHTC' },
        { name: 'Sgt. M. Fernandes', role: 'Emergency Medical Technician', cert: 'BLS / ACLS' }
      ],
      distanceKm: 1.8,
      etaMinutes: 4,
      speedKmh: 48,
      headingDegrees: 224,
      lightsAndSirens: true,
      codeLevel: 'Code 3 (Life-Threatening Emergency)',
      coordinates: {
        latitude: 12.9810,
        longitude: 77.6015
      }
    };

    // Patient Profile & Medical History
    this.patient = {
      id: 'CJ-8829',
      name: 'John Doe',
      age: 58,
      gender: 'Male',
      weightKg: 82,
      heightCm: 178,
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Sulfa Drugs', 'Latex (Mild)'],
      emergencyNotes: 'Prior myocardial infarction (2023); dual-chamber stent implanted; on anticoagulant therapy (Warfarin 5mg daily). DNR: NONE (Full Resuscitation Protocol Requested).',
      emergencyContact: {
        name: 'Sarah Doe',
        relationship: 'Spouse (Primary)',
        phone: '+91 98765 43210',
        status: 'Notified via SMS & Municipal Dispatch IVR'
      }
    };

    // Device Status
    this.device = {
      id: 'CJACK-UNIT-TX104',
      model: 'CJack Autonomous Resuscitation Vest Mk-II',
      batteryLevel: 88,
      batteryState: 'Discharging (Nominal @ 14.8V / 4S2P LiFePO4)',
      actuatorPressureBar: 2.4,
      sensorImpedance: 'Optimal (<500 Ohm on dual Lead-II pads)',
      padPlacement: 'Mid-Thoracic Sternal Pad Centered & Airway Bladder Inflated',
      status: 'OPERATIONAL'
    };

    // Communication Status
    this.communication = {
      loraStatus: 'ACTIVE_TRANSMITTING',
      frequency: '868.1 MHz',
      rssi: -72,
      snr: 9.5,
      packetLossRate: '0.2%',
      gatewayId: 'GW-BLR-041',
      cellularBackup: '4G LTE-M (Active Standby, -68 dBm)',
      backendStatus: 'CONNECTED (Cluster BLR-API-01, 14ms)',
      lastPacketAckReceived: new Date().toISOString()
    };

    // Current Emergency Incident Context
    this.emergency = {
      severity: 'CRITICAL',
      severityCode: 'LEVEL 1 — CARDIAC ARREST (CODE RED)',
      alertTimestamp: new Date(Date.now() - 145000).toISOString(),
      alertTimeFormatted: '10:42:01',
      elapsedSeconds: 145,
      location: {
        latitude: 12.9716,
        longitude: 77.5946,
        accuracyMeters: 2.8,
        landmark: 'Near Gate 3, Cubbon Tech Hub, MG Road Inner Circle',
        isSimulated: true
      },
      vitals: {
        heartRate: 0,
        rhythm: 'Ventricular Fibrillation (Pulseless V-Fib)',
        spo2: 78,
        etco2: 18,
        respirationRate: 0,
        perfusionIndex: 0.6,
        tempCelsius: 36.4
      },
      cpr: {
        state: 'CPR_ACTIVE',
        rateCPM: 108,
        targetRateCPM: 110,
        depthMM: 52,
        targetDepthMM: 50,
        forceNewtons: 410,
        cyclesCompleted: 48,
        feedbackStatus: 'ACTIVE_CLOSED_LOOP',
        sessionDurationFormatted: '02:28',
        motorSpeedRPM: 2850
      }
    };

    // Device Events & Error Logs
    this.deviceEvents = [
      { id: 'dev-1', timestamp: new Date(Date.now() - 142000).toISOString(), code: 'DEV-PWR-OK', title: 'Main Battery Engaged', severity: 'INFO', desc: '14.8V LiFePO4 bus switch closed; 88% capacity nominal.' },
      { id: 'dev-2', timestamp: new Date(Date.now() - 138000).toISOString(), code: 'SENS-SYNC', title: 'ECG + PPG Dual Trigger Verified', severity: 'ALERT', desc: 'Lead-II asystole confirmed; pulsatile pulse absent.' },
      { id: 'dev-3', timestamp: new Date(Date.now() - 134000).toISOString(), code: 'ACT-ENGAGE', title: 'Pneumatic Actuator Armed', severity: 'ACTION', desc: 'Sternal compression bladder pre-charged to 2.4 bar.' },
      { id: 'dev-4', timestamp: new Date(Date.now() - 128000).toISOString(), code: 'PID-LOCK', title: 'Closed-Loop PID Engaged', severity: 'INFO', desc: 'Depth encoder calibrated to 52mm sternal deflection.' }
    ];

    // Historical Vital trend points (last 10 minutes)
    this.vitalHistory = this._generateVitalHistory();
  }

  _generateVitalHistory() {
    const list = [];
    const baseTime = Date.now();
    for (let i = 12; i >= 0; i--) {
      const isPreArrest = i > 3;
      list.push({
        timestamp: new Date(baseTime - i * 30000).toISOString(),
        timeFormatted: new Date(baseTime - i * 30000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        heartRate: isPreArrest ? 74 + Math.floor(Math.random() * 6) : (i === 3 ? 142 : 0),
        spo2: isPreArrest ? 98 : (i === 3 ? 91 : 78 + Math.floor(Math.random() * 4)),
        etco2: isPreArrest ? 38 : (i === 3 ? 28 : 18 + Math.floor(Math.random() * 2)),
        rhythm: isPreArrest ? 'Sinus Rhythm' : (i === 3 ? 'Ventricular Tachycardia' : 'Ventricular Fibrillation')
      });
    }
    return list;
  }

  getStatus() {
    return {
      success: true,
      state: this.currentState,
      stateUpdatedAt: this.stateUpdatedAt,
      availableStates: Object.values(RESPONDER_STATES),
      roles: ROLES,
      unit: this.unit,
      patient: this.patient,
      device: this.device,
      communication: this.communication,
      emergency: this.emergency,
      responderViewSummary: {
        emergencySeverity: this.emergency.severityCode,
        patientLocation: this.emergency.location,
        patientVitals: this.emergency.vitals,
        cprStatus: this.emergency.cpr,
        bloodGroup: this.patient.bloodGroup,
        allergies: this.patient.allergies,
        emergencyNotes: this.patient.emergencyNotes,
        deviceStatus: this.device,
        distanceKm: this.unit.distanceKm,
        etaMinutes: this.unit.etaMinutes,
        communicationStatus: this.communication
      }
    };
  }

  transitionState(targetState) {
    if (!Object.values(RESPONDER_STATES).includes(targetState)) {
      throw new Error(`Invalid responder state: ${targetState}. Valid states: ${Object.values(RESPONDER_STATES).join(', ')}`);
    }

    this.currentState = targetState;
    this.stateUpdatedAt = new Date().toISOString();

    // Contextual unit state updates
    if (targetState === RESPONDER_STATES.AVAILABLE) {
      this.unit.status = 'Standby at Sub-Station 4 (Ready for Call)';
      this.unit.distanceKm = 1.8;
      this.unit.etaMinutes = 4;
      this.unit.speedKmh = 0;
      this.unit.lightsAndSirens = false;
    } else if (targetState === RESPONDER_STATES.ASSIGNED) {
      this.unit.status = 'Unit Assigned to Incident #CJ-8829; Awaiting Paramedic ACK';
      this.unit.lightsAndSirens = false;
    } else if (targetState === RESPONDER_STATES.ACKNOWLEDGED) {
      this.unit.status = 'Dispatch Order Acknowledged by ALS-MED-04 Crew';
      this.unit.lightsAndSirens = true;
    } else if (targetState === RESPONDER_STATES.EN_ROUTE) {
      this.unit.status = 'En Route with Sirens and Beacon (Code 3)';
      this.unit.speedKmh = 48;
      this.unit.distanceKm = 1.8;
      this.unit.etaMinutes = 4;
      this.unit.lightsAndSirens = true;
    } else if (targetState === RESPONDER_STATES.ARRIVED) {
      this.unit.status = 'On Scene at Cubbon Tech Hub Gate 3 (Visual Contact Established)';
      this.unit.distanceKm = 0.05;
      this.unit.etaMinutes = 0;
      this.unit.speedKmh = 0;
      this.unit.lightsAndSirens = true;
    } else if (targetState === RESPONDER_STATES.HANDOVER_COMPLETE) {
      this.unit.status = 'Patient & Telemetry Handover Complete; Transferred to St. John Trauma Bay';
      this.unit.distanceKm = 0.0;
      this.unit.etaMinutes = 0;
      this.unit.speedKmh = 0;
      this.unit.lightsAndSirens = false;
    }

    return this.getStatus();
  }

  getHandoverPacket() {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      handoverId: `HND-${Date.now().toString(36).toUpperCase()}`,
      status: this.currentState,
      patientSummary: {
        id: this.patient.id,
        name: this.patient.name,
        age: this.patient.age,
        gender: this.patient.gender,
        bloodGroup: this.patient.bloodGroup,
        allergies: this.patient.allergies,
        medicalHistoryNotes: this.patient.emergencyNotes,
        emergencyContact: this.patient.emergencyContact
      },
      incidentSummary: {
        severity: this.emergency.severityCode,
        arrestTime: this.emergency.alertTimestamp,
        arrestTimeFormatted: this.emergency.alertTimeFormatted,
        totalArrestSeconds: this.emergency.elapsedSeconds,
        location: this.emergency.location
      },
      vitalHistory: this.vitalHistory,
      latestVitals: this.emergency.vitals,
      cprSession: {
        state: this.emergency.cpr.state,
        totalCompressions: this.emergency.cpr.cyclesCompleted,
        meanRateCPM: this.emergency.cpr.rateCPM,
        targetRateCPM: this.emergency.cpr.targetRateCPM,
        meanDepthMM: this.emergency.cpr.depthMM,
        meanForceNewtons: this.emergency.cpr.forceNewtons,
        feedbackStatus: this.emergency.cpr.feedbackStatus,
        activeDuration: this.emergency.cpr.sessionDurationFormatted
      },
      alerts: [
        { code: 'ALT-VFIB', title: 'Ventricular Fibrillation Confirmed', time: '10:42:01', level: 'CRITICAL' },
        { code: 'ALT-CPR-AUTO', title: 'Automated Vest Compression Started', time: '10:42:12', level: 'ACTION' },
        { code: 'ALT-GPS-3D', title: '3D GNSS Coordinates Locked', time: '10:42:12', level: 'INFO' },
        { code: 'ALT-EMS-ACK', title: 'Central EMS Dispatch Token #ACK-9482', time: '10:42:18', level: 'INFO' },
        { code: 'ALT-DEFIB-RDY', title: 'Defibrillator Clearance Standby', time: '10:44:10', level: 'NOTICE' }
      ],
      deviceEvents: this.deviceEvents,
      timeline: [
        { time: '10:42:01', title: 'Cardiac arrest suspected (Lead-II Asystole + PPG collapse)' },
        { time: '10:42:11', title: 'Emergency confirmed (3s verification countdown expired)' },
        { time: '10:42:12', title: 'Auto-CPR vest engaged @ 108 CPM closed loop' },
        { time: '10:42:12', title: 'GNSS location acquired (12.9716° N, 77.5946° E)' },
        { time: '10:42:13', title: 'Emergency encrypted packet transmitted via LoRa' },
        { time: '10:42:18', title: 'EMS Dispatch auto-acknowledged call' },
        { time: '10:42:25', title: 'ALS-MED-04 unit assigned and en route (Code 3)' }
      ]
    };
  }

  exportSessionSummary() {
    const handover = this.getHandoverPacket();
    return {
      success: true,
      exportedAt: new Date().toISOString(),
      format: 'CLINICAL_AUDIT_JSON_V1',
      checksum: '0x' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase(),
      data: handover
    };
  }

  async getAllResponders() {
    try {
      const { Responder } = require('../models');
      const { isConnected } = require('../config/database');
      if (isConnected()) {
        const responders = await Responder.find();
        if (responders.length > 0) return responders;
      }
    } catch (e) {}

    return [
      {
        responderId: 'RESP-ALS-04',
        callsign: this.unit.callsign,
        name: 'ALS Crew Alpha (Lead: Dr. Marcus Vance)',
        role: 'PARAMEDIC',
        unitType: 'ALS_AMBULANCE',
        status: this.state,
        contactNumber: '+91 80 2234 5678',
        vehicleId: 'KA-01-EQ-9902',
        etaMinutes: this.unit.etaMinutes,
        distanceKm: this.unit.distanceKm,
        isSimulated: true,
      }
    ];
  }

  async createResponder(data) {
    try {
      const { Responder } = require('../models');
      const { isConnected } = require('../config/database');
      if (isConnected()) {
        return await Responder.create(data);
      }
    } catch (e) {}

    return {
      ...data,
      responderId: `RESP-${Date.now().toString(36).toUpperCase()}`,
      isSimulated: true,
      createdAt: new Date().toISOString(),
    };
  }
}

module.exports = new ResponderService();

