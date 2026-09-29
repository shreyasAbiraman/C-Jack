/**
 * CJack Telemetry Simulation Service
 * 
 * NOTICE:
 * This is a prototype/software simulation platform.
 * All data produced by this service is strictly SIMULATED for testing,
 * algorithm verification, and demonstration. It must NEVER be treated
 * as real medical diagnosis or clinical measurement.
 */

class SimulationService {
  constructor() {
    this.isSimulated = true;
    this.systemState = {
      patientId: 'CJ-PATIENT-8829',
      status: 'NORMAL', // All states supported
      cardiacArrestDetected: false,
      cprActive: false,
      motorizedAirActive: false,
      alertSent: false,
      alertTime: null,
      responderEnRoute: false,
      responderDistanceKm: 1.8,
      responderEtaMinutes: 4,
      lastUpdated: new Date().toISOString()
    };

    this.patient = {
      name: 'John Doe',
      age: 58,
      gender: 'Male',
      bloodGroup: 'O Positive',
      emergencyContact: {
        name: 'Sarah Doe (Spouse)',
        phone: '+91 98765 43210',
        provenance: 'REAL'
      },
      allergies: ['Penicillin'],
      allergiesProvenance: 'REAL',
      medicalNotes: 'Known CAD (Triple Vessel Disease s/p Stent 2021), Hypertension, Hyperlipidemia. Daily Aspirin and Atorvastatin.',
      medicalNotesProvenance: 'REAL',
      demographicsProvenance: 'SIMULATED'
    };

    this.vitals = {
      heartRate: 74,
      spo2: 98,
      respirationRate: 16,
      perfusionIndex: 4.2,
      etco2: 38,
      ecgRhythm: 'Normal Sinus Rhythm',
      motionState: 'Stationary / Resting', // 'Stationary / Resting', 'Convulsive / Tremor', 'Ambulatory'
      temperature: 36.8,
      isSimulated: true,
      lastUpdated: new Date().toISOString()
    };

    this.cprMetrics = {
      active: false,
      mode: 'Automated Pneumatic Vest (Closed-Loop)',
      compressionRate: 108, // Target 100-120
      targetRate: [100, 120],
      totalCompressions: 42,
      currentDepthMm: 52, // 5.2 cm
      targetDepthMm: [50, 60],
      chestRecoilPercentage: 96,
      appliedForceNewtons: 410,
      closedLoopActive: true,
      motorState: 'Standby',
      elapsedSeconds: 0,
      fractionPercentage: 92,
      isSimulated: true
    };

    this.deviceHealth = {
      deviceId: 'CJACK-UNIT-TX104',
      firmwareVersion: 'v0.9.4-alpha',
      hardwareModel: 'CJack Wearable Vest rev.3',
      batteryLevel: 88,
      batteryVoltage: 14.8,
      batteryHealth: 'Optimal',
      actuatorPressureBar: 5.2,
      ambientAirPumpStatus: 'Standby',
      internalTempCelsius: 32.4,
      selfTestPassed: true,
      motorHealth: 'Nominal (Duty 0%)',
      sensorsHealth: 'All 6 Channels Nominal',
      systemHealth: '100% Operational',
      isOffline: false,
      isSimulated: true
    };

    this.emergencyCommunication = {
      alertStatus: 'STANDBY', // 'STANDBY', 'SOS BROADCASTING', 'ACKNOWLEDGED BY DISPATCH'
      alertSentTimestamp: null,
      gpsTransmissionConfirmed: true,
      responderAcknowledged: false,
      responderCallsign: 'ALS-MED-04',
      networkPath: 'LoRa Primary (868.1 MHz) + 4G LTE-M Backup',
      packetAcks: 1420
    };

    this.location = {
      latitude: 12.9716,
      longitude: 77.5946,
      altitudeMeters: 920,
      accuracyMeters: 2.8,
      speedKmh: 0,
      addressHint: 'Bengaluru Central Emergency Sector 4 (MG Road Cross)',
      responderLocation: {
        latitude: 12.9810,
        longitude: 77.6015,
        callsign: 'ALS-MED-04'
      },
      hasActualRoutingData: false, // Strictly false until responder en route
      isSimulated: true,
      timestamp: new Date().toISOString()
    };

    this.connectivity = {
      lora: {
        connected: true,
        frequency: '868.1 MHz',
        rssi: -72,
        snr: 9.5,
        packetLossRate: '0.2%',
        gatewayId: 'GW-BLR-041'
      },
      cellular: {
        connected: true,
        technology: '4G LTE-M / NB-IoT',
        signalDbm: -68,
        carrier: 'Emergency Net Direct'
      },
      gps: {
        locked: true,
        satellites: 11
      },
      isSimulated: true
    };
  }

  getSystemStatus() {
    return {
      simulationMode: true,
      dataSource: '[SIMULATED PLATFORM DATA]',
      systemState: this.systemState,
      patient: this.patient,
      vitals: this.vitals,
      cpr: this.cprMetrics,
      deviceHealth: this.deviceHealth,
      emergencyCommunication: this.emergencyCommunication,
      location: this.location,
      connectivity: this.connectivity,
      timestamp: new Date().toISOString()
    };
  }

  getVitals() {
    // Generate slight natural physiological jitter for realistic UI testing
    const jitterHR = Math.floor((Math.random() - 0.5) * 3);
    const jitterSpO2 = Math.floor((Math.random() - 0.5) * 2);

    return {
      simulationMode: true,
      dataSource: '[SIMULATED PHYSIOLOGICAL MODEL]',
      vitals: {
        ...this.vitals,
        heartRate: this.vitals.heartRate === 0 ? 0 : Math.max(0, this.vitals.heartRate + jitterHR),
        spo2: Math.min(100, Math.max(65, this.vitals.spo2 + jitterSpO2)),
        lastUpdated: new Date().toISOString()
      }
    };
  }

  getCprMetrics() {
    if (this.cprMetrics.active) {
      this.cprMetrics.totalCompressions += 1;
      this.cprMetrics.elapsedSeconds += 2;
    }
    return {
      simulationMode: true,
      dataSource: '[SIMULATED COMPRESSION SENSOR DATA]',
      cpr: {
        ...this.cprMetrics,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  getLocation() {
    return {
      simulationMode: true,
      dataSource: '[SIMULATED GPS TELEMETRY]',
      location: {
        ...this.location,
        timestamp: new Date().toISOString()
      }
    };
  }

  getConnectivity() {
    return {
      simulationMode: true,
      dataSource: '[SIMULATED TELEMETRY RADIO]',
      connectivity: this.connectivity
    };
  }

  triggerSimulatedEmergency(state = 'CARDIAC ARREST SUSPECTED') {
    const s = state.toUpperCase();
    this.systemState.status = s;
    this.systemState.lastUpdated = new Date().toISOString();

    if (s === 'NORMAL') {
      this.systemState.cardiacArrestDetected = false;
      this.systemState.cprActive = false;
      this.systemState.alertSent = false;
      this.systemState.responderEnRoute = false;
      this.vitals.heartRate = 74;
      this.vitals.spo2 = 98;
      this.vitals.etco2 = 38;
      this.vitals.respirationRate = 16;
      this.vitals.ecgRhythm = 'Normal Sinus Rhythm';
      this.vitals.motionState = 'Stationary / Resting';
      this.cprMetrics.active = false;
      this.cprMetrics.motorState = 'Standby';
      this.deviceHealth.isOffline = false;
      this.deviceHealth.systemHealth = '100% Operational';
      this.emergencyCommunication.alertStatus = 'STANDBY';
      this.location.hasActualRoutingData = false;
    } else if (s === 'MONITORING') {
      this.systemState.cardiacArrestDetected = false;
      this.systemState.cprActive = false;
      this.vitals.heartRate = 78;
      this.vitals.spo2 = 97;
      this.vitals.ecgRhythm = 'Sinus Rhythm with Minor Artifact';
      this.vitals.motionState = 'Ambulatory / Walking';
      this.cprMetrics.active = false;
      this.deviceHealth.isOffline = false;
      this.location.hasActualRoutingData = false;
    } else if (s === 'WARNING') {
      this.systemState.cardiacArrestDetected = false;
      this.systemState.cprActive = false;
      this.vitals.heartRate = 138; // Tachycardia
      this.vitals.spo2 = 91;      // Desaturation
      this.vitals.ecgRhythm = 'Sinus Tachycardia / PVCs';
      this.vitals.motionState = 'Tremor Detected';
      this.cprMetrics.active = false;
      this.deviceHealth.isOffline = false;
      this.emergencyCommunication.alertStatus = 'STANDBY WARNING';
      this.location.hasActualRoutingData = false;
    } else if (s === 'CARDIAC ARREST SUSPECTED') {
      this.systemState.cardiacArrestDetected = true;
      this.systemState.cprActive = false;
      this.systemState.alertSent = true;
      this.systemState.alertTime = new Date().toISOString();
      this.vitals.heartRate = 0;
      this.vitals.spo2 = 78;
      this.vitals.etco2 = 18;
      this.vitals.respirationRate = 0;
      this.vitals.ecgRhythm = 'Ventricular Fibrillation';
      this.vitals.motionState = 'Loss of Posture / Collapse';
      this.cprMetrics.active = false;
      this.cprMetrics.motorState = 'Arming Closed-Loop';
      this.deviceHealth.isOffline = false;
      this.emergencyCommunication.alertStatus = 'SOS BROADCASTING';
      this.emergencyCommunication.alertSentTimestamp = new Date().toISOString();
      this.location.hasActualRoutingData = false;
    } else if (s === 'CPR ACTIVE') {
      this.systemState.cardiacArrestDetected = true;
      this.systemState.cprActive = true;
      this.systemState.alertSent = true;
      this.vitals.heartRate = 108;
      this.vitals.spo2 = 86;
      this.vitals.etco2 = 26;
      this.vitals.respirationRate = 12;
      this.vitals.ecgRhythm = 'CPR Motion Artifact';
      this.vitals.motionState = 'Controlled Mechanical Cycling';
      this.cprMetrics.active = true;
      this.cprMetrics.closedLoopActive = true;
      this.cprMetrics.motorState = 'Active Closed-Loop Pulsing';
      this.cprMetrics.compressionRate = 108;
      this.cprMetrics.currentDepthMm = 52;
      this.cprMetrics.appliedForceNewtons = 410;
      this.deviceHealth.motorHealth = 'Cycling @ 108 CPM';
      this.deviceHealth.isOffline = false;
      this.emergencyCommunication.alertStatus = 'SOS BROADCASTING';
      this.location.hasActualRoutingData = false;
    } else if (s === 'EMERGENCY ALERT SENT') {
      this.systemState.alertSent = true;
      this.systemState.alertTime = new Date().toISOString();
      this.emergencyCommunication.alertStatus = 'SOS BROADCAST CONFIRMED';
      this.emergencyCommunication.responderAcknowledged = false;
      this.location.hasActualRoutingData = false;
    } else if (s === 'RESPONDER EN ROUTE') {
      this.systemState.alertSent = true;
      this.systemState.responderEnRoute = true;
      this.emergencyCommunication.alertStatus = 'ACKNOWLEDGED BY DISPATCH';
      this.emergencyCommunication.responderAcknowledged = true;
      this.location.hasActualRoutingData = true; // Telemetry routing exists!
      this.systemState.responderDistanceKm = 1.8;
      this.systemState.responderEtaMinutes = 4;
    } else if (s === 'PATIENT STABLE' || s === 'PULSE DETECTED') {
      this.systemState.status = 'PATIENT STABLE';
      this.systemState.cardiacArrestDetected = false;
      this.systemState.cprActive = false;
      this.vitals.heartRate = 84;
      this.vitals.spo2 = 96;
      this.vitals.etco2 = 36;
      this.vitals.respirationRate = 15;
      this.vitals.ecgRhythm = 'Normal Sinus Rhythm (ROSC Confirmed)';
      this.vitals.motionState = 'Spontaneous Respiration';
      this.cprMetrics.active = false;
      this.cprMetrics.motorState = 'Standby (ROSC Hold)';
      this.deviceHealth.isOffline = false;
    } else if (s === 'DEVICE OFFLINE') {
      this.deviceHealth.isOffline = true;
      this.deviceHealth.systemHealth = 'Hardware Disconnected';
      this.connectivity.lora.connected = false;
      this.connectivity.cellular.connected = false;
      this.connectivity.gps.locked = false;
    }

    return this.getSystemStatus();
  }

  generateSimulatedVitals(params = {}) {
    const jitterHR = Math.floor((Math.random() - 0.5) * 4);
    const jitterSpO2 = Math.floor((Math.random() - 0.5) * 2);

    this.vitals = {
      ...this.vitals,
      heartRate: params.heartRate !== undefined ? params.heartRate : Math.max(0, 74 + jitterHR),
      spo2: params.spo2 !== undefined ? params.spo2 : Math.min(100, Math.max(70, 98 + jitterSpO2)),
      respirationRate: params.respirationRate || this.vitals.respirationRate,
      perfusionIndex: params.perfusionIndex || this.vitals.perfusionIndex,
      etco2: params.etco2 || this.vitals.etco2,
      ecgRhythm: params.ecgRhythm || this.vitals.ecgRhythm,
      motionState: params.motionState || this.vitals.motionState,
      temperature: params.temperature || this.vitals.temperature,
      isSimulated: true,
      lastUpdated: new Date().toISOString()
    };

    return {
      success: true,
      isSimulated: true,
      simulation: true,
      dataSource: '[DEMO GENERATED SIMULATION VITALS]',
      data: this.vitals
    };
  }

  generateSimulatedCPR(params = {}) {
    this.cprMetrics = {
      ...this.cprMetrics,
      active: params.active !== undefined ? params.active : true,
      compressionRate: params.compressionRate || params.rate || 108,
      currentDepthMm: params.currentDepthMm || params.depth || 52,
      chestRecoilPercentage: params.chestRecoilPercentage || params.recoil || 96,
      appliedForceNewtons: params.appliedForceNewtons || params.force || 410,
      totalCompressions: params.totalCompressions || (this.cprMetrics.totalCompressions + 1),
      motorState: params.active ? 'Active Closed-Loop Pulsing' : 'Standby',
      isSimulated: true,
      lastUpdated: new Date().toISOString()
    };

    return {
      success: true,
      isSimulated: true,
      simulation: true,
      dataSource: '[DEMO GENERATED SIMULATION CPR]',
      data: this.cprMetrics
    };
  }

  generateSimulatedSensors(params = {}) {
    const status = params.status || 'Connected (Simulated)';
    const channels = [
      { id: 'ecg_lead2', name: 'Lead-II ECG (AD8232)', status, isSimulated: true, impedanceKohm: params.ecgImpedance || 48 },
      { id: 'max30102', name: 'Pulse Oximeter (MAX30102)', status, isSimulated: true, perfusionIndex: params.perfusionIndex || 4.2 },
      { id: 'piezo_resp', name: 'Thoracic Respiration Sensor', status, isSimulated: true },
      { id: 'imu_motion', name: '6-Axis IMU (MPU6050)', status, isSimulated: true },
      { id: 'depth_encoder', name: 'Sternal Depth Encoder', status, isSimulated: true },
      { id: 'load_cells', name: 'Compression Load Cells', status, isSimulated: true }
    ];

    return {
      success: true,
      isSimulated: true,
      simulation: true,
      dataSource: '[DEMO GENERATED SENSOR ARRAY]',
      data: {
        overallHealth: params.offline ? 'OFFLINE' : 'OPTIMAL (100%)',
        activeChannels: params.offline ? 0 : 6,
        channels
      }
    };
  }

  generateSimulatedDevice(params = {}) {
    this.deviceHealth = {
      ...this.deviceHealth,
      batteryLevel: params.batteryLevel !== undefined ? params.batteryLevel : 88,
      batteryVoltage: params.batteryVoltage || 14.8,
      actuatorPressureBar: params.actuatorPressureBar || 5.2,
      internalTempCelsius: params.internalTempCelsius || 32.4,
      isOffline: params.isOffline !== undefined ? params.isOffline : false,
      isSimulated: true,
      lastUpdated: new Date().toISOString()
    };

    return {
      success: true,
      isSimulated: true,
      simulation: true,
      dataSource: '[DEMO GENERATED DEVICE HEALTH]',
      data: this.deviceHealth
    };
  }

  generateSimulatedEmergency(params = {}) {
    const targetState = params.state || 'CARDIAC ARREST SUSPECTED';
    const updated = this.triggerSimulatedEmergency(targetState);
    return {
      success: true,
      isSimulated: true,
      simulation: true,
      dataSource: '[DEMO GENERATED EMERGENCY SEQUENCE]',
      state: targetState,
      data: updated
    };
  }

  generateSimulatedGPS(params = {}) {
    const latJitter = (Math.random() - 0.5) * 0.002;
    const lngJitter = (Math.random() - 0.5) * 0.002;

    this.location = {
      ...this.location,
      latitude: params.latitude !== undefined ? params.latitude : (12.9716 + latJitter),
      longitude: params.longitude !== undefined ? params.longitude : (77.5946 + lngJitter),
      altitudeMeters: params.altitudeMeters || 920,
      accuracyMeters: params.accuracyMeters || (2.5 + Math.random() * 0.5),
      speedKmh: params.speedKmh || 0,
      satellites: params.satellites || 11,
      isSimulated: true,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      isSimulated: true,
      simulation: true,
      dataSource: '[DEMO GENERATED GNSS TELEMETRY]',
      data: this.location
    };
  }

  /**
   * Apply a named clinical scenario by ID (1–12).
   * Each scenario sets a complete atomic state bundle across all subsystems.
   */
  applyScenarioState(scenarioId) {
    const id = parseInt(scenarioId, 10);
    const ts = new Date().toISOString();

    const SCENARIOS = {
      1: { // Normal Monitoring
        systemState: { status: 'NORMAL', cardiacArrestDetected: false, cprActive: false, alertSent: false, responderEnRoute: false, responderDistanceKm: 1.8, responderEtaMinutes: 4 },
        vitals: { heartRate: 74, spo2: 98, respirationRate: 16, perfusionIndex: 4.2, etco2: 38, ecgRhythm: 'Normal Sinus Rhythm', motionState: 'Stationary / Resting', temperature: 36.8 },
        cpr: { active: false, compressionRate: 108, motorState: 'Standby', closedLoopActive: true, totalCompressions: 0, elapsedSeconds: 0 },
        device: { batteryLevel: 88, batteryVoltage: 14.8, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Nominal (Duty 0%)' },
        comm: { alertStatus: 'STANDBY', responderAcknowledged: false, alertSentTimestamp: null },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true, satellites: 11 } },
        location: { hasActualRoutingData: false }
      },
      2: { // Abnormal Vital
        systemState: { status: 'WARNING', cardiacArrestDetected: false, cprActive: false, alertSent: false, responderEnRoute: false },
        vitals: { heartRate: 138, spo2: 91, respirationRate: 22, perfusionIndex: 2.1, etco2: 32, ecgRhythm: 'Sinus Tachycardia / PVCs', motionState: 'Tremor Detected', temperature: 37.4 },
        cpr: { active: false, motorState: 'Standby', totalCompressions: 0 },
        device: { batteryLevel: 85, batteryVoltage: 14.6, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Nominal (Duty 0%)' },
        comm: { alertStatus: 'STANDBY WARNING', responderAcknowledged: false },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: false }
      },
      3: { // Suspected Cardiac Arrest
        systemState: { status: 'CARDIAC ARREST SUSPECTED', cardiacArrestDetected: true, cprActive: false, alertSent: true, alertTime: ts, responderEnRoute: false },
        vitals: { heartRate: 0, spo2: 78, respirationRate: 0, perfusionIndex: 0, etco2: 18, ecgRhythm: 'Ventricular Fibrillation', motionState: 'Loss of Posture / Collapse', temperature: 36.4 },
        cpr: { active: false, motorState: 'Arming Closed-Loop', totalCompressions: 0 },
        device: { batteryLevel: 83, batteryVoltage: 14.5, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Armed — Awaiting Trigger' },
        comm: { alertStatus: 'SOS BROADCASTING', responderAcknowledged: false, alertSentTimestamp: ts },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: false }
      },
      4: { // Cardiac Arrest Confirmed
        systemState: { status: 'CARDIAC ARREST SUSPECTED', cardiacArrestDetected: true, cprActive: false, alertSent: true, alertTime: ts },
        vitals: { heartRate: 0, spo2: 72, respirationRate: 0, perfusionIndex: 0, etco2: 12, ecgRhythm: 'Pulseless Electrical Activity (PEA)', motionState: 'No Motion — Unresponsive', temperature: 36.1 },
        cpr: { active: false, motorState: 'Final Arming — Compression Imminent', totalCompressions: 0 },
        device: { batteryLevel: 82, batteryVoltage: 14.4, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Armed — Initiating in 3s' },
        comm: { alertStatus: 'SOS BROADCAST CONFIRMED', responderAcknowledged: false, alertSentTimestamp: ts },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: false }
      },
      5: { // CPR Active
        systemState: { status: 'CPR ACTIVE', cardiacArrestDetected: true, cprActive: true, alertSent: true },
        vitals: { heartRate: 108, spo2: 86, respirationRate: 12, perfusionIndex: 1.4, etco2: 26, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.0 },
        cpr: { active: true, compressionRate: 108, currentDepthMm: 52, chestRecoilPercentage: 96, appliedForceNewtons: 410, totalCompressions: 68, elapsedSeconds: 38, motorState: 'Active Closed-Loop Pulsing', closedLoopActive: true },
        device: { batteryLevel: 80, batteryVoltage: 14.2, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
        comm: { alertStatus: 'SOS BROADCASTING', responderAcknowledged: false },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: false }
      },
      6: { // Emergency Alert Sent
        systemState: { status: 'EMERGENCY ALERT SENT', cardiacArrestDetected: true, cprActive: true, alertSent: true, alertTime: ts },
        vitals: { heartRate: 108, spo2: 88, respirationRate: 12, perfusionIndex: 1.5, etco2: 28, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.0 },
        cpr: { active: true, compressionRate: 108, totalCompressions: 84, elapsedSeconds: 48, motorState: 'Active Closed-Loop Pulsing' },
        device: { batteryLevel: 79, batteryVoltage: 14.1, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
        comm: { alertStatus: 'SOS BROADCAST CONFIRMED', responderAcknowledged: false, alertSentTimestamp: ts },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: false }
      },
      7: { // Responder Acknowledged
        systemState: { status: 'RESPONDER EN ROUTE', cardiacArrestDetected: true, cprActive: true, alertSent: true, responderEnRoute: true, responderDistanceKm: 1.8, responderEtaMinutes: 4 },
        vitals: { heartRate: 108, spo2: 89, respirationRate: 12, perfusionIndex: 1.6, etco2: 30, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.0 },
        cpr: { active: true, compressionRate: 108, totalCompressions: 120, elapsedSeconds: 68, motorState: 'Active Closed-Loop Pulsing' },
        device: { batteryLevel: 77, batteryVoltage: 13.9, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
        comm: { alertStatus: 'ACKNOWLEDGED BY DISPATCH', responderAcknowledged: true, alertSentTimestamp: ts },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: false }
      },
      8: { // Responder En Route
        systemState: { status: 'RESPONDER EN ROUTE', cardiacArrestDetected: true, cprActive: true, alertSent: true, responderEnRoute: true, responderDistanceKm: 1.2, responderEtaMinutes: 3 },
        vitals: { heartRate: 108, spo2: 90, respirationRate: 12, perfusionIndex: 1.7, etco2: 32, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.1 },
        cpr: { active: true, compressionRate: 108, totalCompressions: 200, elapsedSeconds: 112, motorState: 'Active Closed-Loop Pulsing' },
        device: { batteryLevel: 75, batteryVoltage: 13.7, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
        comm: { alertStatus: 'ACKNOWLEDGED BY DISPATCH', responderAcknowledged: true },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: true }
      },
      9: { // Communication Failure
        systemState: { status: 'CPR ACTIVE', cardiacArrestDetected: true, cprActive: true, alertSent: true },
        vitals: { heartRate: 108, spo2: 86, respirationRate: 12, perfusionIndex: 1.4, etco2: 26, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.0 },
        cpr: { active: true, compressionRate: 108, totalCompressions: 155, elapsedSeconds: 88, motorState: 'Active Closed-Loop Pulsing' },
        device: { batteryLevel: 78, batteryVoltage: 14.0, isOffline: false, systemHealth: '⚠ Partial — Telemetry Disconnected', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
        comm: { alertStatus: 'RADIO LINK LOST — OFFLINE QUEUE ACTIVE', responderAcknowledged: true },
        conn: { lora: { connected: false }, cellular: { connected: false }, gps: { locked: true } },
        location: { hasActualRoutingData: false }
      },
      10: { // Sensor Failure
        systemState: { status: 'WARNING', cardiacArrestDetected: false, cprActive: false, alertSent: false },
        vitals: { heartRate: 0, spo2: 0, respirationRate: 16, perfusionIndex: 0, etco2: 0, ecgRhythm: 'Lead Off / Sensor Disconnected', motionState: 'Stationary / Resting', temperature: 36.8 },
        cpr: { active: false, motorState: 'Standby', totalCompressions: 0 },
        device: { batteryLevel: 82, batteryVoltage: 14.4, isOffline: false, systemHealth: '⚠ Degraded — 3/6 Sensors Failed', sensorsHealth: '3/6 Channels Failed (ECG, SpO2, EtCO2)', motorHealth: 'Nominal (Duty 0%)' },
        comm: { alertStatus: 'STANDBY — SENSOR ALARM', responderAcknowledged: false },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: false }
      },
      11: { // Battery Low
        systemState: { status: 'WARNING', cardiacArrestDetected: false, cprActive: false, alertSent: false },
        vitals: { heartRate: 74, spo2: 97, respirationRate: 16, perfusionIndex: 3.8, etco2: 38, ecgRhythm: 'Normal Sinus Rhythm', motionState: 'Stationary / Resting', temperature: 36.8 },
        cpr: { active: false, motorState: 'Standby — Power Limited', totalCompressions: 0 },
        device: { batteryLevel: 12, batteryVoltage: 12.1, batteryHealth: 'Critical — Replace Immediately', isOffline: false, systemHealth: '⚠ Battery Critical (12%)', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Duty Limit Applied — 60%' },
        comm: { alertStatus: 'STANDBY — BATTERY ALARM', responderAcknowledged: false },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: false }
      },
      12: { // Pulse Detected / CPR Paused (ROSC)
        systemState: { status: 'PATIENT STABLE', cardiacArrestDetected: false, cprActive: false, alertSent: true, responderEnRoute: true, responderDistanceKm: 0.4, responderEtaMinutes: 1 },
        vitals: { heartRate: 84, spo2: 96, respirationRate: 15, perfusionIndex: 3.2, etco2: 36, ecgRhythm: 'Normal Sinus Rhythm (ROSC Confirmed)', motionState: 'Spontaneous Respiration', temperature: 36.5 },
        cpr: { active: false, compressionRate: 0, totalCompressions: 312, elapsedSeconds: 177, motorState: 'Standby (ROSC Hold)', closedLoopActive: false },
        device: { batteryLevel: 68, batteryVoltage: 13.2, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Nominal — ROSC Standby' },
        comm: { alertStatus: 'ROSC CONFIRMED — RESPONDER ARRIVING', responderAcknowledged: true },
        conn: { lora: { connected: true }, cellular: { connected: true }, gps: { locked: true } },
        location: { hasActualRoutingData: true }
      }
    };

    const scenario = SCENARIOS[id];
    if (!scenario) {
      throw new Error(`Unknown scenario ID: ${id}. Valid range is 1–12.`);
    }

    // Apply atomic state bundle
    this.systemState = { ...this.systemState, ...scenario.systemState, lastUpdated: ts };
    this.vitals = { ...this.vitals, ...scenario.vitals, isSimulated: true, lastUpdated: ts };
    this.cprMetrics = { ...this.cprMetrics, ...scenario.cpr, isSimulated: true };
    this.deviceHealth = { ...this.deviceHealth, ...scenario.device, isSimulated: true, lastUpdated: ts };
    this.emergencyCommunication = { ...this.emergencyCommunication, ...scenario.comm };
    this.connectivity = {
      ...this.connectivity,
      lora: { ...this.connectivity.lora, ...scenario.conn.lora },
      cellular: { ...this.connectivity.cellular, ...scenario.conn.cellular },
      gps: { ...this.connectivity.gps, ...scenario.conn.gps }
    };
    this.location = { ...this.location, ...scenario.location, isSimulated: true };

    return {
      success: true,
      scenarioId: id,
      isSimulated: true,
      dataSource: `[SCENARIO ${id} SIMULATION STATE]`,
      data: this.getSystemStatus()
    };
  }

  /**
   * Apply a single parameter override (heartRate, spo2, batteryLevel, compressionRate).
   */
  setParameter(key, value) {
    const numVal = parseFloat(value);
    switch (key) {
      case 'heartRate':
        this.vitals.heartRate = Math.max(0, Math.min(300, numVal));
        break;
      case 'spo2':
        this.vitals.spo2 = Math.max(0, Math.min(100, numVal));
        break;
      case 'respirationRate':
        this.vitals.respirationRate = Math.max(0, Math.min(60, numVal));
        break;
      case 'etco2':
        this.vitals.etco2 = Math.max(0, Math.min(80, numVal));
        break;
      case 'batteryLevel':
        this.deviceHealth.batteryLevel = Math.max(0, Math.min(100, numVal));
        this.deviceHealth.batteryVoltage = parseFloat((10 + (numVal / 100) * 6.8).toFixed(1));
        break;
      case 'compressionRate':
        this.cprMetrics.compressionRate = Math.max(0, Math.min(200, numVal));
        break;
      case 'compressionDepth':
        this.cprMetrics.currentDepthMm = Math.max(0, Math.min(80, numVal));
        break;
      default:
        throw new Error(`Unknown parameter key: ${key}`);
    }
    this.systemState.lastUpdated = new Date().toISOString();
    return {
      success: true,
      key,
      value: numVal,
      isSimulated: true,
      data: this.getSystemStatus()
    };
  }
}

module.exports = new SimulationService();



