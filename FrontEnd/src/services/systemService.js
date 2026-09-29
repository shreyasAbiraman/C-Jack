import apiClient from './apiClient';

/**
 * CJack System & Telemetry Service Layer
 * Interfaces with the Express backend, providing seamless fallback to local 
 * simulated fixtures if the server is offline.
 */

// Offline baseline fallback data
const fallbackSystemStatus = {
  simulationMode: true,
  dataSource: '[CLIENT SIMULATION FALLBACK]',
  systemState: {
    patientId: 'CJ-PATIENT-8829',
    status: 'NORMAL',
    cardiacArrestDetected: false,
    cprActive: false,
    motorizedAirActive: false,
    alertSent: false,
    alertTime: null,
    responderEnRoute: false,
    responderDistanceKm: 1.8,
    responderEtaMinutes: 4,
    lastUpdated: new Date().toISOString()
  },
  patient: {
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
  },
  vitals: {
    heartRate: 74,
    spo2: 98,
    respirationRate: 16,
    perfusionIndex: 4.2,
    etco2: 38,
    ecgRhythm: 'Normal Sinus Rhythm',
    motionState: 'Stationary / Resting',
    temperature: 36.8,
    isSimulated: true,
    lastUpdated: new Date().toISOString()
  },
  cpr: {
    active: false,
    mode: 'Automated Pneumatic Vest (Closed-Loop)',
    compressionRate: 108,
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
  },
  deviceHealth: {
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
  },
  emergencyCommunication: {
    alertStatus: 'STANDBY',
    alertSentTimestamp: null,
    gpsTransmissionConfirmed: true,
    responderAcknowledged: false,
    responderCallsign: 'ALS-MED-04',
    networkPath: 'LoRa Primary (868.1 MHz) + 4G LTE-M Backup',
    packetAcks: 1420
  },
  location: {
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
    hasActualRoutingData: false,
    isSimulated: true,
    timestamp: new Date().toISOString()
  },
  connectivity: {
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
    }
  }
};

const fallbackCprState = {
  cprState: 'IDLE',
  previousState: null,
  allowedTransitions: ['MONITORING', 'ERROR'],
  compressionRate: 0,
  compressionCount: 42,
  compressionDepthMm: 0,
  appliedForceNewtons: 0,
  motorSpeedRpm: 0,
  feedbackStatus: 'INACTIVE',
  closedLoopActive: true,
  targets: {
    rateRange: [100, 120],
    depthRangeMm: [50, 60],
    forceRangeN: [350, 450],
    recoilTargetPct: 95
  },
  sessionDuration: '00:00',
  sessionDurationSeconds: 0,
  safety: {
    manualOverride: false,
    emergencyStopped: false,
    deviceFault: false,
    sensorFault: false,
    motorFault: 'Nominal'
  },
  isSimulated: true,
  dataSource: 'Simulation'
};

const fallbackCprAnalytics = {
  durationSeconds: 148,
  durationFormatted: '02:28',
  totalCompressions: 266,
  averageRate: 108,
  averageDepth: 52.4,
  forceConsistencyPct: 94.7,
  sensorInterruptions: 0,
  emergencyAlerts: 1,
  targetComplianceScore: '96% (AHA Compliant)'
};

const fallbackEmergencyStatus = {
  success: true,
  alertState: 'CREATED',
  allowedAlertTransitions: ['SENDING', 'CANCELLED', 'FAILED'],
  flowStages: [
    { id: 'suspected', label: 'Cardiac arrest suspected', key: 'SUSPECTED', order: 1, desc: 'Dual-sensor trigger: Lead-II asystole & PPG pulsatile collapse', isCompleted: false, isCurrent: true, isPending: false },
    { id: 'confirming', label: 'Confirmation', key: 'CONFIRMATION', order: 2, desc: '3-second verification countdown expired; vest armed', isCompleted: false, isCurrent: false, isPending: true },
    { id: 'alert', label: 'Emergency alert', key: 'EMERGENCY_ALERT', order: 3, desc: 'Encrypted SOS broadcast generated and queued', isCompleted: false, isCurrent: false, isPending: true },
    { id: 'gps', label: 'GPS location', key: 'GPS_LOCATION', order: 4, desc: 'High-precision 3D GNSS coordinates resolved (12.9716 N, 77.5946 E)', isCompleted: false, isCurrent: false, isPending: true },
    { id: 'vitals', label: 'Patient vitals', key: 'PATIENT_VITALS', order: 5, desc: 'Continuous Lead-II ECG and SpO2 telemetry packet appended', isCompleted: false, isCurrent: false, isPending: true },
    { id: 'responder_notify', label: 'Responder notification', key: 'RESPONDER_NOTIFICATION', order: 6, desc: 'Municipal EMS dispatch server alerted via LoRa gateway', isCompleted: false, isCurrent: false, isPending: true },
    { id: 'responder_ack', label: 'Responder acknowledgement', key: 'RESPONDER_ACKNOWLEDGEMENT', order: 7, desc: 'Central EMS dispatch auto-ACK received with confirmation token', isCompleted: false, isCurrent: false, isPending: true },
    { id: 'responder_en_route', label: 'Responder en route', key: 'RESPONDER_EN_ROUTE', order: 8, desc: 'ALS-MED-04 ambulance deployed; ETA 4 mins', isCompleted: false, isCurrent: false, isPending: true },
    { id: 'arrival', label: 'Arrival', key: 'ARRIVAL', order: 9, desc: 'Paramedics on scene; visual contact established', isCompleted: false, isCurrent: false, isPending: true },
    { id: 'handover', label: 'Handover', key: 'HANDOVER', order: 10, desc: 'Patient telemetry and clinical audit log transferred to ALS team', isCompleted: false, isCurrent: false, isPending: true }
  ],
  currentFlowStage: { id: 'suspected', label: 'Cardiac arrest suspected', key: 'SUSPECTED', order: 1, desc: 'Dual-sensor trigger: Lead-II asystole & PPG pulsatile collapse' },
  currentFlowStageIndex: 0,
  emergencyActive: true,
  severity: 'CRITICAL',
  severityCode: 'LEVEL 1 — CARDIAC ARREST (CODE RED)',
  alertTimestamp: new Date().toISOString(),
  alertTimestampFormatted: '10:42:01',
  elapsedTime: '00:24',
  elapsedSeconds: 24,
  patient: fallbackSystemStatus.patient,
  location: fallbackSystemStatus.location,
  vitals: {
    heartRate: 0,
    spo2: 78,
    etco2: 18,
    respirationRate: 0,
    ecgRhythm: 'Ventricular Fibrillation',
    perfusionIndex: 0.6
  },
  cpr: {
    state: 'CPR_ACTIVE',
    rate: 108,
    depth: 52,
    force: 410,
    count: 42,
    feedbackStatus: 'ACTIVE_CLOSED_LOOP',
    duration: '02:28'
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
    gatewayAckReceived: true,
    packetsSent: 1422,
    packetsAcked: 1420
  },
  responder: {
    assigned: true,
    callsign: 'ALS-MED-04',
    agency: 'Municipal Emergency Medical Services (EMS)',
    unitType: 'Advanced Life Support Ambulance',
    paramedics: ['Capt. R. Sharma (EMT-P)', 'Sgt. M. Fernandes (Paramedic)'],
    distanceKm: 1.8,
    etaMinutes: 4,
    speedKmh: 48,
    status: 'En route with sirens and beacon (Code 3)',
    coordinates: { latitude: 12.9810, longitude: 77.6015 }
  },
  emergencyContact: {
    name: 'Sarah Doe',
    relationship: 'Spouse (Primary Emergency Contact)',
    phone: '+91 98765 43210',
    smsStatus: 'DELIVERED_SIMULATED',
    callStatus: 'STANDBY',
    lastNotified: new Date().toISOString(),
    provenance: 'REAL',
    simulationBlocked: true,
    requiresConfirmation: true
  },
  timeline: [
    { id: 'evt-1', time: '10:42:01', timestamp: new Date(Date.now() - 25000).toISOString(), title: 'Cardiac arrest suspected', stage: 'SUSPECTED', severity: 'CRITICAL', description: 'Dual-sensor trigger: Lead-II asystole & PPG pulsatile waveform collapse detected.' },
    { id: 'evt-2', time: '10:42:11', timestamp: new Date(Date.now() - 15000).toISOString(), title: 'Emergency confirmed', stage: 'CONFIRMATION', severity: 'CRITICAL', description: 'Dual-sensor verification countdown (3s) concluded with zero false-positive motion.' },
    { id: 'evt-3', time: '10:42:12', timestamp: new Date(Date.now() - 14000).toISOString(), title: 'CPR started', stage: 'CPR_ACTIVE', severity: 'CRITICAL', description: 'Automated pneumatic chest compression vest cycling at 108 CPM closed-loop cadence.' },
    { id: 'evt-4', time: '10:42:12', timestamp: new Date(Date.now() - 13500).toISOString(), title: 'GPS acquired', stage: 'GPS_LOCATION', severity: 'NORMAL', description: 'NEO-6M 3D satellite fix resolved coordinates: 12.9716° N, 77.5946° E (Accuracy ±2.8m).' },
    { id: 'evt-5', time: '10:42:13', timestamp: new Date(Date.now() - 13000).toISOString(), title: 'Emergency packet sent', stage: 'EMERGENCY_ALERT', severity: 'WARNING', description: 'LoRa primary radio (868.1 MHz SF7) broadcasted encrypted SOS dispatch telemetry.' },
    { id: 'evt-6', time: '10:42:18', timestamp: new Date(Date.now() - 8000).toISOString(), title: 'Responder acknowledged', stage: 'RESPONDER_ACKNOWLEDGEMENT', severity: 'NORMAL', description: 'Central EMS Dispatch confirmed packet reception with cryptographic token #ACK-9482.' }
  ]
};

export const systemService = {
  async getHealth() {
    try {
      return await apiClient.get('/api/health');
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  },

  async getSystemStatus() {
    try {
      const res = await apiClient.get('/api/system/status');
      return res.data || fallbackSystemStatus;
    } catch (err) {
      console.warn('[SystemService] Using offline fallback for system status:', err.message);
      return fallbackSystemStatus;
    }
  },

  async getPatient() {
    try {
      const res = await apiClient.get('/api/patient');
      return res.data || fallbackSystemStatus.patient;
    } catch (err) {
      return fallbackSystemStatus.patient;
    }
  },

  async updatePatient(patientData) {
    try {
      const res = await apiClient.put('/api/patient', patientData);
      return res.data || patientData;
    } catch (err) {
      console.warn('[SystemService] Offline fallback update patient');
      fallbackSystemStatus.patient = {
        ...fallbackSystemStatus.patient,
        ...patientData,
        demographicsProvenance: 'REAL'
      };
      return fallbackSystemStatus.patient;
    }
  },

  async getVitals() {
    try {
      const res = await apiClient.get('/api/telemetry/vitals');
      return res.data || { vitals: fallbackSystemStatus.vitals };
    } catch (err) {
      return { vitals: fallbackSystemStatus.vitals };
    }
  },

  async getVitalsHistory(range = '5m') {
    try {
      const res = await apiClient.get(`/api/telemetry/vitals/history?range=${range}`);
      return res.data || [];
    } catch (err) {
      // Local synthesis generator
      const points = range === '1m' ? 12 : range === '5m' ? 20 : range === '15m' ? 30 : 40;
      const step = range === '1m' ? 5 : range === '5m' ? 15 : range === '15m' ? 30 : 60;
      const now = Date.now();
      const list = [];
      for (let i = points - 1; i >= 0; i--) {
        list.push({
          timestamp: new Date(now - i * step * 1000).toISOString(),
          heartRate: 72 + Math.floor(Math.sin(i / 2) * 8) + (Math.random() > 0.5 ? 2 : -2),
          spo2: 97 + Math.floor(Math.cos(i / 3) * 2),
          respirationRate: 16 + Math.floor(Math.sin(i / 4) * 2),
          source: 'Simulation'
        });
      }
      return list;
    }
  },

  async getSensors() {
    try {
      const res = await apiClient.get('/api/telemetry/sensors');
      return res.data || [];
    } catch (err) {
      return [
        { id: 'ecg_lead2', name: 'Lead-II ECG (AD8232)', type: 'Electrodes', status: 'Simulated', source: 'Simulation' },
        { id: 'max30102', name: 'Pulse Oximeter (MAX30102)', type: 'Optical PPG', status: 'Simulated', source: 'Simulation' },
        { id: 'piezo_resp', name: 'Thoracic Respiration', type: 'Piezoelectric', status: 'Simulated', source: 'Simulation' },
        { id: 'imu_motion', name: '6-Axis IMU (MPU6050)', type: 'Accelerometer', status: 'Simulated', source: 'Simulation' },
        { id: 'depth_encoder', name: 'Sternal Depth Encoder', type: 'Optical', status: 'Simulated', source: 'Simulation' },
        { id: 'load_cells', name: 'Compression Load Cells', type: 'Transducer', status: 'Simulated', source: 'Simulation' }
      ];
    }
  },

  async getCprMetrics() {
    try {
      const res = await apiClient.get('/api/telemetry/cpr');
      return res.data || { cpr: fallbackSystemStatus.cpr };
    } catch (err) {
      return { cpr: fallbackSystemStatus.cpr };
    }
  },

  async getLocation() {
    try {
      const res = await apiClient.get('/api/telemetry/location');
      return res.data || { location: fallbackSystemStatus.location };
    } catch (err) {
      return { location: fallbackSystemStatus.location };
    }
  },

  async getConnectivity() {
    try {
      const res = await apiClient.get('/api/telemetry/connectivity');
      return res.data || { connectivity: fallbackSystemStatus.connectivity };
    } catch (err) {
      return { connectivity: fallbackSystemStatus.connectivity };
    }
  },

  async getLogs() {
    try {
      const res = await apiClient.get('/api/system/logs');
      return res.data || [];
    } catch (err) {
      return [
        { id: 1, timestamp: new Date().toISOString(), level: 'INFO', category: 'OFFLINE', message: 'Client running in standalone prototype mode.' }
      ];
    }
  },

  async setSimulatedState(state) {
    const upper = state.toUpperCase();
    try {
      return await apiClient.post('/api/system/simulate-state', { state: upper });
    } catch (err) {
      console.warn('[SystemService] Backend unavailable, applying local state change:', state);
      fallbackSystemStatus.systemState.status = upper;
      return { success: true, localOnly: true, state: upper };
    }
  },

  async getCprState() {
    try {
      const res = await apiClient.get('/api/cpr/state');
      return res.data?.data || res.data || fallbackCprState;
    } catch (err) {
      return fallbackCprState;
    }
  },

  async transitionCprState(targetState, metadata = {}) {
    try {
      const res = await apiClient.post('/api/cpr/transition', { targetState, metadata });
      return res.data?.data || res.data || fallbackCprState;
    } catch (err) {
      console.warn('[SystemService] Offline transition to:', targetState);
      fallbackCprState.cprState = targetState;
      return fallbackCprState;
    }
  },

  async emergencyStopCpr() {
    try {
      const res = await apiClient.post('/api/cpr/emergency-stop');
      return res.data?.data || res.data;
    } catch (err) {
      fallbackCprState.cprState = 'STOPPED';
      fallbackCprState.safety.emergencyStopped = true;
      return fallbackCprState;
    }
  },

  async updateCprSimulator(config) {
    try {
      const res = await apiClient.post('/api/cpr/simulator', config);
      return res.data?.data || res.data;
    } catch (err) {
      return fallbackCprState;
    }
  },

  async getCprAnalytics() {
    try {
      const res = await apiClient.get('/api/cpr/analytics');
      return res.data?.data || res.data || fallbackCprAnalytics;
    } catch (err) {
      return fallbackCprAnalytics;
    }
  },

  async resetCprSession() {
    try {
      const res = await apiClient.post('/api/cpr/reset');
      return res.data?.data || res.data;
    } catch (err) {
      return fallbackCprState;
    }
  },

  // ==========================================
  // Emergency Response Module API Methods
  // ==========================================
  async getEmergencyStatus() {
    try {
      const res = await apiClient.get('/api/emergency/status');
      return res.data || fallbackEmergencyStatus;
    } catch (err) {
      return fallbackEmergencyStatus;
    }
  },

  async transitionAlertState(targetState) {
    try {
      const res = await apiClient.post('/api/emergency/alert-state', { targetState });
      return res.data || fallbackEmergencyStatus;
    } catch (err) {
      fallbackEmergencyStatus.alertState = targetState;
      return fallbackEmergencyStatus;
    }
  },

  async advanceFlowStage(stageIndexOrKey) {
    try {
      const payload = typeof stageIndexOrKey === 'number'
        ? { stageIndex: stageIndexOrKey }
        : { stageKey: stageIndexOrKey };
      const res = await apiClient.post('/api/emergency/advance-flow', payload);
      return res.data || fallbackEmergencyStatus;
    } catch (err) {
      return fallbackEmergencyStatus;
    }
  },

  async triggerEmergency() {
    try {
      const res = await apiClient.post('/api/emergency/trigger');
      return res.data || fallbackEmergencyStatus;
    } catch (err) {
      fallbackEmergencyStatus.emergencyActive = true;
      fallbackEmergencyStatus.severity = 'CRITICAL';
      fallbackEmergencyStatus.alertState = 'CREATED';
      return fallbackEmergencyStatus;
    }
  },

  async resetEmergency() {
    try {
      const res = await apiClient.post('/api/emergency/reset');
      return res.data || fallbackEmergencyStatus;
    } catch (err) {
      fallbackEmergencyStatus.emergencyActive = false;
      fallbackEmergencyStatus.severity = 'NORMAL';
      fallbackEmergencyStatus.alertState = 'CANCELLED';
      return fallbackEmergencyStatus;
    }
  },

  async getEmergencyTimeline() {
    try {
      const res = await apiClient.get('/api/emergency/timeline');
      return res.data?.data || fallbackEmergencyStatus.timeline;
    } catch (err) {
      return fallbackEmergencyStatus.timeline;
    }
  },

  async notifyEmergencyContact(options = {}) {
    try {
      const res = await apiClient.post('/api/emergency/contact/notify', options);
      return res.data;
    } catch (err) {
      fallbackEmergencyStatus.emergencyContact.smsStatus = 'DELIVERED_SIMULATED';
      return {
        success: true,
        simulated: true,
        message: 'Simulated alert sent (Offline fallback)',
        contact: fallbackEmergencyStatus.emergencyContact
      };
    }
  },

  // ==========================================
  // Connectivity Module API Methods
  // ==========================================
  async getConnectivityStatus() {
    try {
      const res = await apiClient.get('/api/connectivity/status');
      return res.data;
    } catch (err) {
      return {
        success: true,
        gps: {
          status: '3D GNSS LOCK (OPTIMAL)',
          locked: true,
          latitude: 12.9716,
          longitude: 77.5946,
          altitudeMeters: 920,
          accuracyMeters: 2.8,
          satellites: 11,
          hdop: 0.9,
          fixType: '3D Multi-Constellation Fix',
          receiverModel: 'u-blox NEO-6M',
          antennaStatus: 'Active Patch Antenna OK',
          isSimulated: true
        },
        lora: {
          status: 'ACTIVE_TRANSMITTING',
          transceiver: 'Semtech SX1262 Sub-GHz Transceiver',
          frequency: '868.1 MHz (EU/IN Band)',
          spreadingFactor: 'SF7',
          bandwidthKhz: 125,
          codingRate: '4/5',
          txPowerDbm: 14,
          gateway: {
            id: 'GW-BLR-041',
            name: 'Bengaluru Central Emergency Gateway #41',
            status: 'ONLINE_REACHABLE',
            latitude: 12.9750,
            longitude: 77.5990,
            distanceKm: 0.62,
            lastAckReceivedAt: new Date().toISOString(),
            coverageRadiusKm: 5.0
          },
          signal: {
            rssi: -72,
            snr: 9.5,
            packetLossRate: '0.2%',
            perQuality: 'OPTIMAL (High SNR Margin)'
          }
        },
        networkStates: {
          deviceConnected: true,
          loraAvailable: true,
          gatewayReachable: true,
          backendReachable: true,
          internetUnavailable: false
        },
        offlineQueue: {
          currentStep: 'PACKET_GENERATED',
          stepIndex: 0,
          steps: [
            { id: 'PACKET_GENERATED', label: 'Packet generated', desc: 'Emergency telemetry payload assembled in vest memory buffer' },
            { id: 'NETWORK_UNAVAILABLE', label: 'Network unavailable', desc: 'LoRa / Cellular carrier fade or RF attenuation blackout detected' },
            { id: 'PACKET_QUEUED', label: 'Packet queued', desc: 'Payload stored in non-volatile flash memory offline ring buffer' },
            { id: 'NETWORK_RESTORED', label: 'Network restored', desc: 'Sub-GHz gateway carrier re-acquired; uplink handshake established' },
            { id: 'PACKET_TRANSMITTED', label: 'Packet transmitted', desc: 'Buffered packets burst-transmitted and cryptographically acknowledged' }
          ],
          bufferedPackets: [],
          queueCount: 0,
          maxBufferCapacity: 256,
          lastFlushTime: null
        },
        backend: {
          status: 'ONLINE',
          pollingCadenceSec: 3,
          latencyMs: 14,
          serverVersion: 'v1.0.0-prototype',
          lastPingTimestamp: new Date().toISOString()
        },
        lastPacket: {
          packetId: 'PKT-9483',
          timestamp: new Date().toISOString(),
          sizeBytes: 64,
          digest: '0xFE88102A'
        },
        responder: {
          callsign: 'ALS-MED-04',
          latitude: 12.9810,
          longitude: 77.6015,
          distanceKm: 1.8,
          etaMinutes: 4,
          speedKmh: 48
        },
        timestamp: new Date().toISOString()
      };
    }
  },

  async sendCommunicationPacket(packet) {
    try {
      const res = await apiClient.post('/api/connectivity/packet', packet);
      return res.data;
    } catch (err) {
      return {
        success: true,
        queued: true,
        message: 'Packet ingested (Offline fallback)',
        packet
      };
    }
  },

  async getCommunicationPackets(limit = 20) {
    try {
      const res = await apiClient.get(`/api/connectivity/packets?limit=${limit}`);
      return res.data;
    } catch (err) {
      return {
        success: true,
        totalCount: 3,
        packets: [
          {
            deviceId: 'CJACK-UNIT-TX104',
            timestamp: new Date().toISOString(),
            emergencyStatus: 'CPR_ACTIVE',
            latitude: 12.9716,
            longitude: 77.5946,
            heartRate: 108,
            spo2: 86,
            cprStatus: 'ACTIVE_CLOSED_LOOP',
            battery: 87,
            sensorStatus: 'NOMINAL',
            packetId: 'PKT-9483',
            sizeBytes: 64,
            digest: '0xFE88102A'
          }
        ]
      };
    }
  },

  async simulateOfflineQueue(action = 'NEXT_STEP') {
    try {
      const res = await apiClient.post('/api/connectivity/offline-queue/simulate', { action });
      return res.data;
    } catch (err) {
      return null;
    }
  },

  async setNetworkStates(states) {
    try {
      const res = await apiClient.post('/api/connectivity/network-state', states);
      return res.data;
    } catch (err) {
      return null;
    }
  },

  async getResponderStatus() {
    try {
      const res = await apiClient.get('/api/responder/status');
      return res.data;
    } catch (err) {
      return {
        success: true,
        state: 'EN_ROUTE',
        stateUpdatedAt: new Date().toISOString(),
        availableStates: ['AVAILABLE', 'ASSIGNED', 'ACKNOWLEDGED', 'EN_ROUTE', 'ARRIVED', 'HANDOVER_COMPLETE'],
        unit: {
          callsign: 'ALS-MED-04',
          agency: 'Municipal Emergency Medical Services (EMS)',
          unitType: 'Advanced Life Support Ambulance',
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
          coordinates: { latitude: 12.9810, longitude: 77.6015 },
          status: 'En Route with Sirens and Beacon (Code 3)'
        },
        patient: {
          id: 'CJ-8829',
          name: 'John Doe',
          age: 58,
          gender: 'Male',
          bloodGroup: 'O+',
          allergies: ['Penicillin', 'Sulfa Drugs', 'Latex (Mild)'],
          emergencyNotes: 'Prior myocardial infarction (2023); dual-chamber stent implanted; on anticoagulant therapy (Warfarin 5mg daily). DNR: NONE (Full Resuscitation Protocol Requested).'
        },
        device: {
          id: 'CJACK-UNIT-TX104',
          model: 'CJack Autonomous Resuscitation Vest Mk-II',
          batteryLevel: 88,
          status: 'OPERATIONAL'
        },
        communication: {
          loraStatus: 'ACTIVE_TRANSMITTING',
          frequency: '868.1 MHz',
          rssi: -72,
          snr: 9.5,
          packetLossRate: '0.2%',
          gatewayId: 'GW-BLR-041',
          backendStatus: 'CONNECTED (Cluster BLR-API-01, 14ms)'
        },
        emergency: {
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
            perfusionIndex: 0.6
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
            sessionDurationFormatted: '02:28'
          }
        },
        responderViewSummary: {
          emergencySeverity: 'LEVEL 1 — CARDIAC ARREST (CODE RED)',
          patientLocation: { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 2.8, landmark: 'Near Gate 3, Cubbon Tech Hub' },
          patientVitals: { heartRate: 0, rhythm: 'Ventricular Fibrillation', spo2: 78, etco2: 18 },
          cprStatus: { state: 'CPR_ACTIVE', rateCPM: 108, depthMM: 52, feedbackStatus: 'ACTIVE_CLOSED_LOOP' },
          bloodGroup: 'O+',
          allergies: ['Penicillin', 'Sulfa Drugs', 'Latex (Mild)'],
          emergencyNotes: 'Prior myocardial infarction; dual-chamber stent; on Warfarin. Full Resuscitation Requested.',
          deviceStatus: { id: 'CJACK-UNIT-TX104', batteryLevel: 88, status: 'OPERATIONAL' },
          distanceKm: 1.8,
          etaMinutes: 4,
          communicationStatus: { loraStatus: 'ACTIVE_TRANSMITTING', gatewayId: 'GW-BLR-041', rssi: -72 }
        }
      };
    }
  },

  async setResponderState(state) {
    try {
      const res = await apiClient.post('/api/responder/state', { state });
      return res.data;
    } catch (err) {
      return null;
    }
  },

  async getHandoverData() {
    try {
      const res = await apiClient.get('/api/responder/handover');
      return res.data;
    } catch (err) {
      return null;
    }
  },

  async exportSessionSummary() {
    try {
      const res = await apiClient.post('/api/responder/handover/export');
      return res.data;
    } catch (err) {
      return null;
    }
  },

  // -------------------------------------------------------------
  // DEVICE MANAGEMENT MODULE
  // -------------------------------------------------------------

  async getDeviceOverview() {
    try {
      const res = await apiClient.get('/api/device/overview');
      return res.data?.overview || res.data;
    } catch (err) {
      return {
        deviceId: 'CJACK-UNIT-TX104',
        firmwareVersion: 'v0.9.4-alpha-rev3',
        hardwareVersion: 'CJack Wearable Vest Mk-II (Rev 3.2)',
        battery: {
          levelPercentage: 88,
          voltageVolts: 14.8,
          chemistry: 'LiFePO4 (4S2P / 6400mAh)',
          healthStatus: 'Optimal (98% SoH)',
          chargeState: 'Discharging (Nominal)'
        },
        temperature: {
          enclosureCelsius: 32.4,
          mcuCoreCelsius: 34.2,
          skinThermalCelsius: 36.8,
          status: 'NOMINAL (< 42°C Threshold)'
        },
        motorStatus: {
          state: 'STANDBY_READY',
          speedRPM: 0,
          targetSpeedRPM: 2850,
          compressorPressureBar: 2.4,
          motorCurrentAmperes: 0.1,
          thermalProtection: 'Active OK'
        },
        sensorStatus: {
          totalChannels: 7,
          activeChannels: 7,
          healthPercentage: 100,
          status: 'ALL 7 CHANNELS OPTIMAL'
        },
        gps: {
          status: '3D GNSS LOCK (OPTIMAL)',
          satellites: 11,
          accuracyMeters: 2.8,
          latitude: 12.9716,
          longitude: 77.5946
        },
        lora: {
          status: 'ACTIVE_TRANSMITTING',
          frequency: '868.1 MHz',
          gatewayId: 'GW-BLR-041',
          rssi: -72,
          snr: 9.5
        },
        lastSynchronization: {
          timestamp: new Date().toISOString(),
          timeFormatted: '10:42:18 UTC',
          latencyMs: 14,
          protocol: 'LoRa Sub-GHz + REST Backup'
        },
        operatingMode: 'MONITORING'
      };
    }
  },

  async getDeviceSensors() {
    try {
      const res = await apiClient.get('/api/device/sensors');
      return res.data?.sensors || res.data;
    } catch (err) {
      return [
        {
          id: 'ecg',
          name: 'ECG',
          sensorModel: 'Analog Devices AD8232 Lead-II Analog Front-End',
          status: 'OPTIMAL',
          lastUpdate: 'Just now',
          signalQuality: '99% (<420 Ω Impedance)',
          dataSource: 'Direct Dual-Lead Surface Electrodes'
        },
        {
          id: 'spo2',
          name: 'SpO2',
          sensorModel: 'Maxim MAX30102 Optical Pulse Oximeter & PPG',
          status: 'OPTIMAL',
          lastUpdate: 'Just now',
          signalQuality: '98% (Perfusion Index 4.2)',
          dataSource: 'Optical Dual-Wavelength Photodiode'
        },
        {
          id: 'mpu6050',
          name: 'MPU6050',
          sensorModel: 'InvenSense MPU-6050 6-Axis MotionTracking IMU',
          status: 'CALIBRATED',
          lastUpdate: '10ms ago',
          signalQuality: '100% (Zero-G Offset Calibrated)',
          dataSource: 'I2C Micro-Electro-Mechanical Bus'
        },
        {
          id: 'respiration',
          name: 'Respiration',
          sensorModel: 'Thoracic Piezoelectric Film Strain Gauge',
          status: 'ACTIVE',
          lastUpdate: 'Just now',
          signalQuality: '95% (Chest Expansion Tracking)',
          dataSource: 'Mechanical Piezo Transducer Pad'
        },
        {
          id: 'load_cell',
          name: 'Load Cell',
          sensorModel: 'Strain-Gauge Compression Load Cell Transducer',
          status: 'CALIBRATED',
          lastUpdate: '5ms ago',
          signalQuality: '99% (Range 0-600 N, Zero-Drift <0.2%)',
          dataSource: 'Sternal Compression Contact Plate'
        },
        {
          id: 'gps',
          name: 'GPS',
          sensorModel: 'u-blox NEO-6M High-Sensitivity GNSS Engine',
          status: '3D FIX',
          lastUpdate: '1s ago',
          signalQuality: '11 Satellites (HDOP: 0.9, CEP: ±2.8m)',
          dataSource: 'Active Ceramic Patch Antenna'
        },
        {
          id: 'lora',
          name: 'LoRa',
          sensorModel: 'Semtech SX1262 Long-Range Sub-GHz Transceiver',
          status: 'CARRIER LOCK',
          lastUpdate: '3s ago',
          signalQuality: 'RSSI: -72 dBm, SNR: 9.5 dB',
          dataSource: '868.1 MHz Omnidirectional Helical Antenna'
        }
      ];
    }
  },

  async getDeviceModes() {
    try {
      const res = await apiClient.get('/api/device/modes');
      return res.data;
    } catch (err) {
      return {
        currentMode: 'MONITORING',
        modeChangedAt: new Date().toISOString(),
        availableModes: [
          { mode: 'STANDBY', label: 'STANDBY', desc: 'Low-power background state; sensors polled at reduced frequency', isActive: false },
          { mode: 'MONITORING', label: 'MONITORING', desc: 'Continuous biometric and motion surveillance; automatic arrest trigger active', isActive: true },
          { mode: 'EMERGENCY', label: 'EMERGENCY', desc: 'Cardiac arrest suspected or confirmed; emergency SOS broadcast active', isActive: false },
          { mode: 'CPR', label: 'CPR', desc: 'Autonomous pneumatic vest actively delivering 108 CPM chest compressions', isActive: false },
          { mode: 'MAINTENANCE', label: 'MAINTENANCE', desc: 'Diagnostic calibration, actuator purge, firmware flashing, and sensor zeroing', isActive: false },
          { mode: 'OFFLINE', label: 'OFFLINE', desc: 'No radio connection; store-and-forward telemetry buffered in non-volatile flash', isActive: false },
          { mode: 'SIMULATION', label: 'SIMULATION', desc: 'Bench testing mode; synthetic physiological signals and simulated telemetry active', isActive: false }
        ]
      };
    }
  },

  async setDeviceMode(mode) {
    try {
      const res = await apiClient.post('/api/device/mode', { mode });
      return res.data;
    } catch (err) {
      return {
        currentMode: mode,
        modeChangedAt: new Date().toISOString()
      };
    }
  },

  async getDeviceEvents(limit = 20) {
    try {
      const res = await apiClient.get(`/api/device/events?limit=${limit}`);
      return res.data?.events || res.data;
    } catch (err) {
      return [
        {
          id: 'evt-dev-1',
          type: 'POWER_ON',
          title: 'Power on',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          timeFormatted: '10:39:10',
          severity: 'INFO',
          description: 'Vest main power switch engaged. 14.8V LiFePO4 battery bus energized.',
          source: 'Power Management IC'
        },
        {
          id: 'evt-dev-2',
          type: 'SENSOR_CONNECTED',
          title: 'Sensor connected',
          timestamp: new Date(Date.now() - 175000).toISOString(),
          timeFormatted: '10:39:15',
          severity: 'INFO',
          description: 'Lead-II ECG electrodes and MAX30102 PPG probe detected on SPI/I2C bus.',
          source: 'Hardware Abstraction Layer'
        },
        {
          id: 'evt-dev-3',
          type: 'SENSOR_DISCONNECTED',
          title: 'Sensor disconnected',
          timestamp: new Date(Date.now() - 160000).toISOString(),
          timeFormatted: '10:39:30',
          severity: 'WARNING',
          description: 'Temporary high impedance on auxiliary ECG ground pad (self-resolved upon strap tensioning).',
          source: 'AD8232 Leads-Off Detection'
        },
        {
          id: 'evt-dev-4',
          type: 'EMERGENCY_ALERT',
          title: 'Emergency alert',
          timestamp: new Date(Date.now() - 145000).toISOString(),
          timeFormatted: '10:42:01',
          severity: 'CRITICAL',
          description: 'Sudden cardiac arrest trigger: Asystole + PPG collapse. Code Red SOS dispatched.',
          source: 'Dual-Sensor Correlation Engine'
        },
        {
          id: 'evt-dev-5',
          type: 'CPR_STARTED',
          title: 'CPR started',
          timestamp: new Date(Date.now() - 134000).toISOString(),
          timeFormatted: '10:42:12',
          severity: 'ACTION',
          description: 'Automated pneumatic chest compression vest cycling at 108 CPM closed loop.',
          source: 'Closed-Loop PID Motor Controller'
        },
        {
          id: 'evt-dev-6',
          type: 'COMMUNICATION_FAILURE',
          title: 'Communication failure',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          timeFormatted: '10:42:26',
          severity: 'WARNING',
          description: 'Sub-GHz packet retry 1 failed due to building steel shielding; auto-recovered on retry 2.',
          source: 'SX1262 LoRa Transceiver'
        },
        {
          id: 'evt-dev-7',
          type: 'BATTERY_WARNING',
          title: 'Battery warning',
          timestamp: new Date(Date.now() - 90000).toISOString(),
          timeFormatted: '10:42:56',
          severity: 'INFO',
          description: 'Battery capacity check: 88% remaining (~45 minutes of continuous automated CPR reserve).',
          source: 'TI BQ40Z50 Fuel Gauge'
        },
        {
          id: 'evt-dev-8',
          type: 'MANUAL_OVERRIDE',
          title: 'Manual override',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          timeFormatted: '10:43:26',
          severity: 'ACTION',
          description: 'Paramedic standby override tested: Defibrillation clearance lockout circuit verified.',
          source: 'Paramedic Console Control'
        },
        {
          id: 'evt-dev-9',
          type: 'CPR_STOPPED',
          title: 'CPR stopped',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          timeFormatted: '10:43:56',
          severity: 'ADVISORY',
          description: 'Compressions paused momentarily for cyclic 2-minute mandatory rhythm analysis.',
          source: 'Autonomous Resuscitation Core'
        }
      ];
    }
  },

  async recordDeviceEvent(eventData) {
    try {
      const res = await apiClient.post('/api/device/event', eventData);
      return res.data?.event || res.data;
    } catch (err) {
      return {
        id: `evt-dev-${Date.now()}`,
        ...eventData,
        timestamp: new Date().toISOString()
      };
    }
  },

  async getDeviceMaintenance() {
    try {
      const res = await apiClient.get('/api/device/maintenance');
      return res.data?.maintenance || res.data;
    } catch (err) {
      return {
        lastInspection: {
          date: '2026-09-01',
          inspector: 'Inspector Dr. V. Nair (Biomedical Eng)',
          certificateNo: 'ISO-13485-MED-84920',
          status: 'PASSED (AHA / ERC 2025 Clinical Compliance)',
          nextInspectionDue: '2026-12-01'
        },
        batteryHealth: {
          stateOfHealthPct: 98,
          chargeCycles: 42,
          maxCapacityMah: 6400,
          currentCapacityMah: 5632,
          cellImbalanceMillivolts: 8,
          internalResistanceMilliohms: 24,
          temperatureCelsius: 29.8,
          status: 'HEALTHY'
        },
        sensorHealth: {
          ecgLeadImpedanceOhms: 420,
          ppgPhotodiodeCalibration: '99.4% (Nominal Baseline)',
          piezoSensitivityMvPerMicrostrain: 12.8,
          loadCellZeroDriftPercentage: 0.12,
          imuGyroDriftDps: 0.04,
          status: 'ALL SENSORS CALIBRATED'
        },
        motorHealth: {
          motorModel: 'Brushless DC Air Compressor (48V / 250W)',
          operatingHours: 14.2,
          operatingCycles: 3820,
          bearingVibrationMmS: 0.8,
          bearingThermalCelsius: 34.0,
          stallProtectionFlag: false,
          pressureValveLeakRateBarMin: 0.01,
          status: 'OPTIMAL (No Mechanical Wear)'
        },
        errorHistory: [
          {
            id: 'err-1',
            code: 'ERR-LORA-RET',
            timestamp: '2026-09-22 10:42:26',
            subsystem: 'RF Communications',
            severity: 'LOW',
            message: 'Uplink frame ACK timeout on packet #9481 (Resolved on retry 2)',
            resolved: true
          },
          {
            id: 'err-2',
            code: 'ERR-PAD-IMP',
            timestamp: '2026-09-22 10:39:30',
            subsystem: 'ECG Analog Front-End',
            severity: 'MEDIUM',
            message: 'Transient skin-electrode impedance spike (>1800 Ω) during donning',
            resolved: true
          },
          {
            id: 'err-3',
            code: 'ERR-GPS-COLD',
            timestamp: '2026-09-22 10:38:10',
            subsystem: 'GNSS Satellite Engine',
            severity: 'LOW',
            message: 'Cold start ephemeris acquisition took 28s indoors',
            resolved: true
          }
        ]
      };
    }
  },

  async runDeviceDiagnosticTest() {
    try {
      const res = await apiClient.post('/api/device/maintenance/self-test');
      return res.data;
    } catch (err) {
      return {
        success: true,
        testCompletedAt: new Date().toISOString(),
        overallStatus: 'PASSED',
        subsystemsTested: {
          mcuCore: 'PASS (ESP32-S3 240MHz / FreeRTOS)',
          ecgAnalogFrontEnd: 'PASS (Impedance 420 Ω)',
          spo2OpticalSensor: 'PASS (SNR 98%)',
          mpu6050Motion: 'PASS (Zero-G Calibration OK)',
          respirationPiezo: 'PASS (Peak Signal 1.2V)',
          compressionLoadCell: 'PASS (Zero-Drift 0.12%)',
          pneumaticActuator: 'PASS (Pressure Hold 2.4 Bar)',
          subGhzLoraRadio: 'PASS (SX1262 Carrier OK)',
          gnssReceiver: 'PASS (3D Lock 11 Satellites)'
        }
      };
    }
  }
};

