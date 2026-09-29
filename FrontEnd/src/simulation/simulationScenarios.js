/**
 * CJack Clinical Simulation Scenarios
 * 12 named scenarios for software demonstration only.
 * 
 * SIMULATION NOTICE:
 * All data defined here is entirely synthetic and must NEVER be treated
 * as real medical data, clinical guidance, or actual patient telemetry.
 */

export const SCENARIO_COLORS = {
  normal: '#10b981',    // emerald
  warning: '#f59e0b',   // amber
  critical: '#ef4444',  // red
  cpr: '#8b5cf6',       // violet
  alert: '#f97316',     // orange
  enroute: '#3b82f6',   // blue
  comm: '#6b7280',      // gray
  sensor: '#ec4899',    // pink
  battery: '#eab308',   // yellow
  rosc: '#14b8a6',      // teal
};

export const SCENARIOS = [
  {
    id: 1,
    name: 'Normal Monitoring',
    shortName: 'NORMAL',
    description: 'Patient vitals within normal clinical limits. Autonomous surveillance active. All systems nominal.',
    icon: '🟢',
    color: SCENARIO_COLORS.normal,
    category: 'baseline',
    state: {
      systemState: { status: 'NORMAL', cardiacArrestDetected: false, cprActive: false, alertSent: false, responderEnRoute: false, responderDistanceKm: 1.8, responderEtaMinutes: 4 },
      vitals: { heartRate: 74, spo2: 98, respirationRate: 16, perfusionIndex: 4.2, etco2: 38, ecgRhythm: 'Normal Sinus Rhythm', motionState: 'Stationary / Resting', temperature: 36.8 },
      cpr: { active: false, compressionRate: 108, motorState: 'Standby', closedLoopActive: true, totalCompressions: 0, elapsedSeconds: 0, currentDepthMm: 0 },
      device: { batteryLevel: 88, batteryVoltage: 14.8, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Nominal (Duty 0%)', batteryHealth: 'Optimal' },
      communication: { alertStatus: 'STANDBY', responderAcknowledged: false, alertSentTimestamp: null, networkPath: 'LoRa Primary + 4G LTE-M Backup' },
      connectivity: { lora: { connected: true, rssi: -72, snr: 9.5 }, cellular: { connected: true }, gps: { locked: true, satellites: 11 } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Monitoring Active', description: 'Continuous multi-sensor surveillance initiated. Baseline vitals recorded.' },
    ],
  },
  {
    id: 2,
    name: 'Abnormal Vital',
    shortName: 'WARNING',
    description: 'Elevated tachycardia and SpO₂ desaturation detected. Algorithm monitoring for loss of perfusion.',
    icon: '⚠️',
    color: SCENARIO_COLORS.warning,
    category: 'warning',
    state: {
      systemState: { status: 'WARNING', cardiacArrestDetected: false, cprActive: false, alertSent: false, responderEnRoute: false },
      vitals: { heartRate: 138, spo2: 91, respirationRate: 22, perfusionIndex: 2.1, etco2: 32, ecgRhythm: 'Sinus Tachycardia / PVCs', motionState: 'Tremor Detected', temperature: 37.4 },
      cpr: { active: false, motorState: 'Standby', totalCompressions: 0, currentDepthMm: 0 },
      device: { batteryLevel: 85, batteryVoltage: 14.6, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Nominal (Duty 0%)', batteryHealth: 'Optimal' },
      communication: { alertStatus: 'STANDBY WARNING', responderAcknowledged: false },
      connectivity: { lora: { connected: true, rssi: -72 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Baseline Normal', description: 'Patient resting, vitals within limits.' },
      { offsetSeconds: 5, label: 'Abnormal Signal Detected', description: 'HR spike to 138 BPM, SpO₂ drops to 91%. Tachycardia algorithm flagged.' },
    ],
  },
  {
    id: 3,
    name: 'Suspected Cardiac Arrest',
    shortName: 'ARREST?',
    description: 'Dual-lead ECG registered ventricular fibrillation with collapse of photoplethysmogram pulsatile waveform.',
    icon: '🚨',
    color: SCENARIO_COLORS.critical,
    category: 'emergency',
    state: {
      systemState: { status: 'CARDIAC ARREST SUSPECTED', cardiacArrestDetected: true, cprActive: false, alertSent: true, responderEnRoute: false },
      vitals: { heartRate: 0, spo2: 78, respirationRate: 0, perfusionIndex: 0, etco2: 18, ecgRhythm: 'Ventricular Fibrillation', motionState: 'Loss of Posture / Collapse', temperature: 36.4 },
      cpr: { active: false, motorState: 'Arming Closed-Loop', totalCompressions: 0, currentDepthMm: 0 },
      device: { batteryLevel: 83, batteryVoltage: 14.5, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Armed — Awaiting Trigger' },
      communication: { alertStatus: 'SOS BROADCASTING', responderAcknowledged: false },
      connectivity: { lora: { connected: true, rssi: -72 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Monitoring Active', description: 'Normal surveillance running.' },
      { offsetSeconds: 5, label: 'Abnormal Signal', description: 'Acute tachycardia and desaturation detected.' },
      { offsetSeconds: 10, label: 'Cardiac Arrest Suspected', description: 'VFib confirmed by dual-lead ECG. Patient collapsed.' },
    ],
  },
  {
    id: 4,
    name: 'Cardiac Arrest Confirmed',
    shortName: 'CONFIRMED',
    description: 'Cardiac arrest confirmed by multi-sensor fusion. CPR actuator system arming sequence initiated.',
    icon: '💔',
    color: SCENARIO_COLORS.critical,
    category: 'emergency',
    state: {
      systemState: { status: 'CARDIAC ARREST SUSPECTED', cardiacArrestDetected: true, cprActive: false, alertSent: true },
      vitals: { heartRate: 0, spo2: 72, respirationRate: 0, perfusionIndex: 0, etco2: 12, ecgRhythm: 'Pulseless Electrical Activity (PEA)', motionState: 'No Motion — Unresponsive', temperature: 36.1 },
      cpr: { active: false, motorState: 'Final Arming — Compression Imminent', totalCompressions: 0, currentDepthMm: 0 },
      device: { batteryLevel: 82, batteryVoltage: 14.4, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Armed — Initiating in 3s' },
      communication: { alertStatus: 'SOS BROADCAST CONFIRMED', responderAcknowledged: false },
      connectivity: { lora: { connected: true, rssi: -72 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Monitoring Active', description: 'Normal surveillance.' },
      { offsetSeconds: 5, label: 'Abnormal Signal', description: 'Acute tachycardia and desaturation.' },
      { offsetSeconds: 10, label: 'Arrest Suspected', description: 'VFib flagged.' },
      { offsetSeconds: 10.5, label: 'Arrest Confirmed', description: 'Multi-sensor fusion confirmed. PEA detected. CPR arming.' },
    ],
  },
  {
    id: 5,
    name: 'CPR Active',
    shortName: 'CPR ON',
    description: 'Automated pneumatic vest compressions active at 108 CPM, depth 52mm. Closed-loop feedback active.',
    icon: '🔄',
    color: SCENARIO_COLORS.cpr,
    category: 'cpr',
    state: {
      systemState: { status: 'CPR ACTIVE', cardiacArrestDetected: true, cprActive: true, alertSent: true },
      vitals: { heartRate: 108, spo2: 86, respirationRate: 12, perfusionIndex: 1.4, etco2: 26, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.0 },
      cpr: { active: true, compressionRate: 108, currentDepthMm: 52, chestRecoilPercentage: 96, appliedForceNewtons: 410, totalCompressions: 68, elapsedSeconds: 38, motorState: 'Active Closed-Loop Pulsing', closedLoopActive: true },
      device: { batteryLevel: 80, batteryVoltage: 14.2, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
      communication: { alertStatus: 'SOS BROADCASTING', responderAcknowledged: false },
      connectivity: { lora: { connected: true, rssi: -74 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Monitoring Active', description: 'Normal surveillance.' },
      { offsetSeconds: 5, label: 'Abnormal Signal', description: 'Tachycardia + desaturation.' },
      { offsetSeconds: 10, label: 'Arrest Suspected', description: 'VFib confirmed.' },
      { offsetSeconds: 11, label: 'CPR Started', description: 'Closed-loop pneumatic compressions initiated at 108 CPM.' },
    ],
  },
  {
    id: 6,
    name: 'Emergency Alert Sent',
    shortName: 'ALERT SENT',
    description: 'LoRa + 4G LTE-M SOS packet transmitted. GPS coordinates attached. Emergency alert broadcast confirmed.',
    icon: '📡',
    color: SCENARIO_COLORS.alert,
    category: 'emergency',
    state: {
      systemState: { status: 'EMERGENCY ALERT SENT', cardiacArrestDetected: true, cprActive: true, alertSent: true },
      vitals: { heartRate: 108, spo2: 88, respirationRate: 12, perfusionIndex: 1.5, etco2: 28, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.0 },
      cpr: { active: true, compressionRate: 108, currentDepthMm: 52, totalCompressions: 84, elapsedSeconds: 48, motorState: 'Active Closed-Loop Pulsing' },
      device: { batteryLevel: 79, batteryVoltage: 14.1, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
      communication: { alertStatus: 'SOS BROADCAST CONFIRMED', responderAcknowledged: false },
      connectivity: { lora: { connected: true, rssi: -72 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Monitoring Active', description: 'Normal surveillance.' },
      { offsetSeconds: 5, label: 'Abnormal Signal', description: 'Tachycardia.' },
      { offsetSeconds: 10, label: 'Arrest Suspected', description: 'VFib.' },
      { offsetSeconds: 11, label: 'CPR Started', description: 'Compressions at 108 CPM.' },
      { offsetSeconds: 12, label: 'Emergency Alert Sent', description: 'LoRa + 4G SOS transmitted. GPS coordinates attached.' },
    ],
  },
  {
    id: 7,
    name: 'Responder Acknowledged',
    shortName: 'ACK',
    description: 'Emergency dispatch received SOS and acknowledged. ALS unit ALS-MED-04 assigned and responding.',
    icon: '📞',
    color: SCENARIO_COLORS.enroute,
    category: 'responder',
    state: {
      systemState: { status: 'RESPONDER EN ROUTE', cardiacArrestDetected: true, cprActive: true, alertSent: true, responderEnRoute: true, responderDistanceKm: 1.8, responderEtaMinutes: 4 },
      vitals: { heartRate: 108, spo2: 89, respirationRate: 12, perfusionIndex: 1.6, etco2: 30, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.0 },
      cpr: { active: true, compressionRate: 108, currentDepthMm: 52, totalCompressions: 120, elapsedSeconds: 68, motorState: 'Active Closed-Loop Pulsing' },
      device: { batteryLevel: 77, batteryVoltage: 13.9, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
      communication: { alertStatus: 'ACKNOWLEDGED BY DISPATCH', responderAcknowledged: true },
      connectivity: { lora: { connected: true, rssi: -72 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Monitoring Active', description: 'Normal surveillance.' },
      { offsetSeconds: 5, label: 'Abnormal Signal', description: 'Tachycardia.' },
      { offsetSeconds: 10, label: 'Arrest Suspected', description: 'VFib.' },
      { offsetSeconds: 11, label: 'CPR Started', description: 'Compressions at 108 CPM.' },
      { offsetSeconds: 12, label: 'Alert Sent', description: 'SOS transmitted.' },
      { offsetSeconds: 15, label: 'GPS Transmitted', description: 'Patient coordinates broadcast via LoRa.' },
      { offsetSeconds: 20, label: 'Responder Acknowledged', description: 'Dispatch confirmed ALS-MED-04 en route.' },
    ],
  },
  {
    id: 8,
    name: 'Responder En Route',
    shortName: 'EN ROUTE',
    description: 'ALS-MED-04 responding under Code 3. Live routing data active. ETA 3 minutes, 1.2 km distance.',
    icon: '🚑',
    color: SCENARIO_COLORS.enroute,
    category: 'responder',
    state: {
      systemState: { status: 'RESPONDER EN ROUTE', cardiacArrestDetected: true, cprActive: true, alertSent: true, responderEnRoute: true, responderDistanceKm: 1.2, responderEtaMinutes: 3 },
      vitals: { heartRate: 108, spo2: 90, respirationRate: 12, perfusionIndex: 1.7, etco2: 32, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.1 },
      cpr: { active: true, compressionRate: 108, currentDepthMm: 52, totalCompressions: 200, elapsedSeconds: 112, motorState: 'Active Closed-Loop Pulsing' },
      device: { batteryLevel: 75, batteryVoltage: 13.7, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
      communication: { alertStatus: 'ACKNOWLEDGED BY DISPATCH', responderAcknowledged: true },
      connectivity: { lora: { connected: true, rssi: -70 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: true },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Monitoring Active', description: 'Normal surveillance.' },
      { offsetSeconds: 5, label: 'Abnormal Signal', description: 'Tachycardia.' },
      { offsetSeconds: 10, label: 'Arrest Suspected', description: 'VFib.' },
      { offsetSeconds: 11, label: 'CPR Started', description: 'Compressions at 108 CPM.' },
      { offsetSeconds: 12, label: 'Alert Sent', description: 'SOS transmitted.' },
      { offsetSeconds: 15, label: 'GPS Transmitted', description: 'Patient coordinates broadcast.' },
      { offsetSeconds: 20, label: 'Responder Acknowledged', description: 'ALS-MED-04 assigned.' },
      { offsetSeconds: 30, label: 'Responder En Route', description: 'Code 3 response. Live routing active. ETA 3 min.' },
    ],
  },
  {
    id: 9,
    name: 'Communication Failure',
    shortName: 'COMM FAIL',
    description: 'LoRa gateway and LTE-M link lost. Offline packet queue building. CPR continues autonomously.',
    icon: '📵',
    color: SCENARIO_COLORS.comm,
    category: 'failure',
    state: {
      systemState: { status: 'CPR ACTIVE', cardiacArrestDetected: true, cprActive: true, alertSent: true },
      vitals: { heartRate: 108, spo2: 86, respirationRate: 12, perfusionIndex: 1.4, etco2: 26, ecgRhythm: 'CPR Motion Artifact', motionState: 'Controlled Mechanical Cycling', temperature: 36.0 },
      cpr: { active: true, compressionRate: 108, currentDepthMm: 52, totalCompressions: 155, elapsedSeconds: 88, motorState: 'Active Closed-Loop Pulsing' },
      device: { batteryLevel: 78, batteryVoltage: 14.0, isOffline: false, systemHealth: '⚠ Partial — Telemetry Disconnected', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Cycling @ 108 CPM' },
      communication: { alertStatus: 'RADIO LINK LOST — OFFLINE QUEUE ACTIVE', responderAcknowledged: true },
      connectivity: { lora: { connected: false, rssi: -999 }, cellular: { connected: false }, gps: { locked: true } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'CPR Active', description: 'Compressions active.' },
      { offsetSeconds: 5, label: 'LoRa Link Lost', description: 'Gateway GW-BLR-041 unreachable.' },
      { offsetSeconds: 7, label: 'LTE-M Timeout', description: 'Cellular backup also offline.' },
      { offsetSeconds: 10, label: 'Offline Queue Building', description: 'Packets buffered for retry. CPR continues.' },
    ],
  },
  {
    id: 10,
    name: 'Sensor Failure',
    shortName: 'SENSOR FAIL',
    description: 'ECG Lead-II, SpO₂, and EtCO₂ channels failed. Degraded monitoring mode active.',
    icon: '🔌',
    color: SCENARIO_COLORS.sensor,
    category: 'failure',
    state: {
      systemState: { status: 'WARNING', cardiacArrestDetected: false, cprActive: false, alertSent: false },
      vitals: { heartRate: 0, spo2: 0, respirationRate: 16, perfusionIndex: 0, etco2: 0, ecgRhythm: 'Lead Off / Sensor Disconnected', motionState: 'Stationary / Resting', temperature: 36.8 },
      cpr: { active: false, motorState: 'Standby', totalCompressions: 0, currentDepthMm: 0 },
      device: { batteryLevel: 82, batteryVoltage: 14.4, isOffline: false, systemHealth: '⚠ Degraded — 3/6 Sensors Failed', sensorsHealth: '3/6 Channels Failed (ECG, SpO₂, EtCO₂)', motorHealth: 'Nominal (Duty 0%)' },
      communication: { alertStatus: 'STANDBY — SENSOR ALARM', responderAcknowledged: false },
      connectivity: { lora: { connected: true, rssi: -72 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Normal Monitoring', description: 'All sensors nominal.' },
      { offsetSeconds: 3, label: 'ECG Lead Off', description: 'Lead-II contact failure. Arrhythmia detection suspended.' },
      { offsetSeconds: 5, label: 'SpO₂ & EtCO₂ Fail', description: 'Two additional sensor channels lost. Degraded mode activated.' },
    ],
  },
  {
    id: 11,
    name: 'Battery Low',
    shortName: 'BATT LOW',
    description: 'Battery at 12%, voltage 12.1V. Compression duty cycle limited to 60%. Immediate replacement required.',
    icon: '🔋',
    color: SCENARIO_COLORS.battery,
    category: 'failure',
    state: {
      systemState: { status: 'WARNING', cardiacArrestDetected: false, cprActive: false, alertSent: false },
      vitals: { heartRate: 74, spo2: 97, respirationRate: 16, perfusionIndex: 3.8, etco2: 38, ecgRhythm: 'Normal Sinus Rhythm', motionState: 'Stationary / Resting', temperature: 36.8 },
      cpr: { active: false, motorState: 'Standby — Power Limited', totalCompressions: 0, currentDepthMm: 0 },
      device: { batteryLevel: 12, batteryVoltage: 12.1, batteryHealth: 'Critical — Replace Immediately', isOffline: false, systemHealth: '⚠ Battery Critical (12%)', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Duty Limit Applied — 60%' },
      communication: { alertStatus: 'STANDBY — BATTERY ALARM', responderAcknowledged: false },
      connectivity: { lora: { connected: true, rssi: -72 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: false },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'Battery Warning', description: 'Battery at 12%. Operator alerted.' },
      { offsetSeconds: 5, label: 'Duty Limit Applied', description: 'Motor compression duty reduced to 60% to conserve power.' },
    ],
  },
  {
    id: 12,
    name: 'Pulse Detected / CPR Paused',
    shortName: 'ROSC',
    description: 'Return of Spontaneous Circulation (ROSC) confirmed. CPR paused. Sinus rhythm and pulse pressure restored.',
    icon: '💚',
    color: SCENARIO_COLORS.rosc,
    category: 'recovery',
    state: {
      systemState: { status: 'PATIENT STABLE', cardiacArrestDetected: false, cprActive: false, alertSent: true, responderEnRoute: true, responderDistanceKm: 0.4, responderEtaMinutes: 1 },
      vitals: { heartRate: 84, spo2: 96, respirationRate: 15, perfusionIndex: 3.2, etco2: 36, ecgRhythm: 'Normal Sinus Rhythm (ROSC Confirmed)', motionState: 'Spontaneous Respiration', temperature: 36.5 },
      cpr: { active: false, compressionRate: 0, currentDepthMm: 0, totalCompressions: 312, elapsedSeconds: 177, motorState: 'Standby (ROSC Hold)', closedLoopActive: false, chestRecoilPercentage: 0 },
      device: { batteryLevel: 68, batteryVoltage: 13.2, isOffline: false, systemHealth: '100% Operational', sensorsHealth: 'All 6 Channels Nominal', motorHealth: 'Nominal — ROSC Standby' },
      communication: { alertStatus: 'ROSC CONFIRMED — RESPONDER ARRIVING', responderAcknowledged: true },
      connectivity: { lora: { connected: true, rssi: -70 }, cellular: { connected: true }, gps: { locked: true } },
      location: { hasActualRoutingData: true },
    },
    timelineEvents: [
      { offsetSeconds: 0, label: 'CPR Active', description: 'Compressions ongoing.' },
      { offsetSeconds: 5, label: 'Pulse Signal Detected', description: 'SpO₂ pulsatile waveform reappearing. CPR paused for rhythm check.' },
      { offsetSeconds: 8, label: 'ROSC Confirmed', description: 'Sinus rhythm and pulse pressure restored. CPR standby mode.' },
      { offsetSeconds: 10, label: 'Telemetry Transmitted', description: 'ROSC event packet broadcast. Responder updated.' },
    ],
  },
];

/**
 * Full 30-second automatic demo timeline (auto-chain mode).
 * Used by the "Full Demo Loop" button in the Simulation Control Panel.
 */
export const FULL_DEMO_TIMELINE = [
  { scenarioId: 1, offsetSeconds: 0, durationSeconds: 5 },
  { scenarioId: 2, offsetSeconds: 5, durationSeconds: 5 },
  { scenarioId: 3, offsetSeconds: 10, durationSeconds: 1 },
  { scenarioId: 4, offsetSeconds: 11, durationSeconds: 1 },
  { scenarioId: 5, offsetSeconds: 12, durationSeconds: 3 },
  { scenarioId: 6, offsetSeconds: 15, durationSeconds: 5 },
  { scenarioId: 7, offsetSeconds: 20, durationSeconds: 10 },
  { scenarioId: 8, offsetSeconds: 30, durationSeconds: 15 },
  { scenarioId: 12, offsetSeconds: 45, durationSeconds: 10 },
];

export const getScenarioById = (id) => SCENARIOS.find(s => s.id === id) || null;
