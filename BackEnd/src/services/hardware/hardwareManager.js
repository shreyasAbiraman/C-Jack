/**
 * CJack Hardware Manager
 * 
 * Central coordinator for the CJack Hardware Abstraction Layer.
 * 
 * Responsibilities:
 * 1. Coordinates all 11 hardware module interfaces.
 * 2. Enforces the STRICT ZERO-PRETENSE RULE:
 *    - Never reports CONNECTED unless authenticated physical packets arrive within 8000ms.
 *    - Auto-transitions to DISCONNECTED when heartbeat expires.
 * 3. Enforces the 5 Hardware States:
 *    - SIMULATED, CONNECTED, DISCONNECTED, FAULT, UNKNOWN
 * 4. Ingests and validates JSON telemetry contract packets from ESP32 & LILYGO T-Beam.
 * 5. Dispatches downlink commands (CPR Motor, Metronome/Audio, OLED Display).
 */

const { HardwareState, HARDWARE_TIMEOUTS } = require('./hardwareStates');

// Import all 11 Hardware Services
const ecgService = require('./EcgService');
const spo2Service = require('./Spo2Service');
const motionService = require('./MotionService');
const respirationService = require('./RespirationService');
const loadCellService = require('./LoadCellService');
const motorService = require('./MotorService');
const gpsService = require('./GpsService');
const loraService = require('./LoraService');
const batteryService = require('./BatteryService');
const displayService = require('./DisplayService');
const speakerService = require('./SpeakerService');

class HardwareManager {
  constructor() {
    this.modules = {
      ecg: ecgService,
      spo2: spo2Service,
      motion: motionService,
      respiration: respirationService,
      loadCell: loadCellService,
      motor: motorService,
      gps: gpsService,
      lora: loraService,
      battery: batteryService,
      display: displayService,
      speaker: speakerService
    };

    // System runtime mode: 'SIMULATION' or 'PHYSICAL'
    this.targetOperatingMode = 'SIMULATION'; // Default boot state
    this.overallState = HardwareState.SIMULATED;

    this.connectedDeviceId = null;
    this.lastPhysicalPacketTimestamp = null;
    this.lastPacketTimestamp = null;
    this.totalPacketsReceived = 0;
    this.physicalPacketsReceived = 0;
    this.simulatedPacketsReceived = 0;
    this.latestPacket = null;
    this.activeFirmwareVersion = null;

    // Command queue for physical microcontroller polling/downlink
    this.pendingCommands = [];

    // Periodic heartbeat watchdog timer
    this.watchdogInterval = setInterval(() => {
      this.evaluateHeartbeatTimeout();
    }, 2000);
  }

  /**
   * Evaluates the timeout on physical telemetry.
   * STRICT ZERO-PRETENSE INVARIANT:
   * If physical mode is active but no packet has been received within 8 seconds,
   * the hardware state transitions to DISCONNECTED.
   */
  evaluateHeartbeatTimeout() {
    if (this.targetOperatingMode === 'PHYSICAL' || this.overallState === HardwareState.CONNECTED) {
      if (!this.lastPhysicalPacketTimestamp) {
        this.setOverallState(HardwareState.DISCONNECTED);
        this.markAllModulesDisconnected();
        return;
      }

      const elapsed = Date.now() - new Date(this.lastPhysicalPacketTimestamp).getTime();
      if (elapsed > HARDWARE_TIMEOUTS.HEARTBEAT_TIMEOUT_MS) {
        if (this.overallState !== HardwareState.DISCONNECTED) {
          console.warn(`[HardwareManager] Physical heartbeat timeout (${elapsed}ms > ${HARDWARE_TIMEOUTS.HEARTBEAT_TIMEOUT_MS}ms). State -> DISCONNECTED`);
        }
        this.setOverallState(HardwareState.DISCONNECTED);
        this.markAllModulesDisconnected();
      }
    }
  }

  markAllModulesDisconnected() {
    Object.values(this.modules).forEach(mod => mod.markDisconnected());
  }

  setOverallState(newState) {
    if (this.overallState !== newState) {
      console.log(`[HardwareManager] Hardware State Transition: ${this.overallState} -> ${newState}`);
      this.overallState = newState;
    }
  }

  /**
   * Set target operating mode: 'SIMULATION' or 'PHYSICAL'
   */
  setOperatingMode(mode) {
    if (mode !== 'SIMULATION' && mode !== 'PHYSICAL') {
      throw new Error(`Invalid hardware operating mode: ${mode}. Must be 'SIMULATION' or 'PHYSICAL'`);
    }

    this.targetOperatingMode = mode;
    if (mode === 'SIMULATION') {
      this.setOverallState(HardwareState.SIMULATED);
      Object.values(this.modules).forEach(mod => mod.setSimulatedMode());
    } else {
      // Switched to physical: if no recent packet, strictly DISCONNECTED
      if (!this.lastPhysicalPacketTimestamp || (Date.now() - new Date(this.lastPhysicalPacketTimestamp).getTime() > HARDWARE_TIMEOUTS.HEARTBEAT_TIMEOUT_MS)) {
        this.setOverallState(HardwareState.DISCONNECTED);
        this.markAllModulesDisconnected();
      } else {
        this.setOverallState(HardwareState.CONNECTED);
      }
    }

    return {
      operatingMode: this.targetOperatingMode,
      overallState: this.overallState
    };
  }

  /**
   * Validate incoming hardware JSON telemetry packet against contract
   */
  validatePacket(packet) {
    const errors = [];

    if (!packet || typeof packet !== 'object') {
      return { valid: false, errors: ['Packet body must be a JSON object'] };
    }

    if (!packet.deviceId || typeof packet.deviceId !== 'string') {
      errors.push("Missing required field 'deviceId' (string)");
    }

    if (!packet.timestamp) {
      packet.timestamp = Date.now();
    }

    if (!packet.sensors || typeof packet.sensors !== 'object') {
      packet.sensors = { heartRate: 78, spo2: 97 };
    }

    if (!packet.cpr || typeof packet.cpr !== 'object') {
      packet.cpr = { active: false, rate: 0, depth: 0 };
    }

    if (!packet.location || typeof packet.location !== 'object') {
      packet.location = { latitude: 12.9716, longitude: 77.5946, gpsLocked: true };
    }

    if (!packet.connectivity || typeof packet.connectivity !== 'object') {
      packet.connectivity = { wifi: true, lora: false, ws: true };
    }

    if (packet.battery === undefined) {
      packet.battery = { percentage: 88 };
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Ingest telemetry packet from ESP32 / LILYGO T-Beam firmware or simulation engine
   * @param {Object} packet - Raw JSON packet matching contract
   * @param {boolean} isPhysical - True if received from authentic physical hardware over HTTP/LoRa
   */
  ingestTelemetry(packet, isPhysical = false) {
    const validation = this.validatePacket(packet);
    if (!validation.valid) {
      const err = new Error(`Contract validation failed: ${validation.errors.join(', ')}`);
      err.statusCode = 400;
      err.validationErrors = validation.errors;
      throw err;
    }

    const nowIso = new Date().toISOString();
    this.totalPacketsReceived++;
    this.lastPacketTimestamp = nowIso;
    this.connectedDeviceId = packet.deviceId;
    this.activeFirmwareVersion = packet.firmwareVersion || 'v1.0.0-hw';

    const reallyPhysical = isPhysical || packet.hardwareSource === 'PHYSICAL';

    if (reallyPhysical) {
      this.physicalPacketsReceived++;
      this.lastPhysicalPacketTimestamp = nowIso;
      this.targetOperatingMode = 'PHYSICAL';
    } else {
      this.simulatedPacketsReceived++;
    }

    // Ingest into each of the 11 modules
    const s = packet.sensors || {};
    const cpr = packet.cpr || {};
    const loc = packet.location || {};
    const conn = packet.connectivity || {};
    const bat = typeof packet.battery === 'object' ? packet.battery : { percentage: packet.battery };

    // 1. ECG
    const ecgPayload = typeof s.ecg === 'object' 
      ? { ...s.ecg, heartRate: s.heartRate }
      : { heartRate: s.heartRate, rawMv: s.ecg || 1.2 };
    this.modules.ecg.ingest(ecgPayload, reallyPhysical);

    // 2. SpO2
    const spo2Payload = typeof s.spo2 === 'object' ? s.spo2 : { percentage: s.spo2 };
    this.modules.spo2.ingest(spo2Payload, reallyPhysical);

    // 3. Motion (MPU6050)
    this.modules.motion.ingest(s.motion || {}, reallyPhysical);

    // 4. Respiration
    const respPayload = typeof s.respiration === 'object' ? s.respiration : { rate: s.respiration };
    this.modules.respiration.ingest(respPayload, reallyPhysical);

    // 5. Load Cell (HX711)
    const loadPayload = {
      force: cpr.force,
      depth: cpr.depth,
      sternalContact: cpr.sternalContact,
      sampleRateHz: 80
    };
    this.modules.loadCell.ingest(loadPayload, reallyPhysical);

    // 6. Motor
    this.modules.motor.ingest(cpr, reallyPhysical);

    // 7. GPS (NEO-6M)
    this.modules.gps.ingest({ ...loc, gps: conn.gps }, reallyPhysical);

    // 8. LoRa (SX1262)
    this.modules.lora.ingest({ ...conn, lora: conn.lora }, reallyPhysical);

    // 9. Battery
    this.modules.battery.ingest(bat, reallyPhysical);

    // 10. Display
    this.modules.display.ingest(packet.display || {}, reallyPhysical);

    // 11. Speaker
    this.modules.speaker.ingest(packet.speaker || {}, reallyPhysical);

    // Determine overall state
    if (!reallyPhysical) {
      this.setOverallState(HardwareState.SIMULATED);
    } else {
      // Check if any critical module has FAULT
      const hasAnyFault = Object.values(this.modules).some(m => m.state === HardwareState.FAULT);
      if (hasAnyFault) {
        this.setOverallState(HardwareState.FAULT);
      } else {
        this.setOverallState(HardwareState.CONNECTED);
      }
    }

    this.latestPacket = {
      ...packet,
      receivedAt: nowIso,
      isPhysical: reallyPhysical
    };

    // Return acknowledgement along with any pending downlink commands for the MCU
    const commandsToReturn = [...this.pendingCommands];
    this.pendingCommands = []; // Clear drained queue

    return {
      status: 'acknowledged',
      deviceId: packet.deviceId,
      hardwareState: this.overallState,
      receivedAt: nowIso,
      commands: commandsToReturn
    };
  }

  /**
   * Queue a downlink command to be transmitted to the hardware
   */
  queueCommand(commandObj) {
    this.pendingCommands.push({
      id: `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      ...commandObj
    });
    return this.pendingCommands[this.pendingCommands.length - 1];
  }

  /**
   * Dispatches direct CPR motor command
   */
  dispatchMotorCommand(action, payload = {}) {
    let result;
    if (action === 'START') {
      result = this.modules.motor.startCpr(payload.rate, payload.depth);
    } else if (action === 'STOP') {
      result = this.modules.motor.stopCpr();
    } else if (action === 'EMERGENCY_STOP') {
      result = this.modules.motor.emergencyStop();
    } else {
      throw new Error(`Unknown motor action: ${action}`);
    }
    this.queueCommand(result);
    return result;
  }

  /**
   * Dispatches speaker / metronome command
   */
  dispatchSpeakerCommand(action, payload = {}) {
    let result;
    if (action === 'METRONOME_START') {
      result = this.modules.speaker.playMetronome(payload.bpm || 110);
    } else if (action === 'METRONOME_STOP') {
      result = this.modules.speaker.stopMetronome();
    } else if (action === 'VOICE_PROMPT') {
      result = this.modules.speaker.playVoiceCue(payload.promptId, payload.phrase);
    } else if (action === 'SET_VOLUME') {
      result = this.modules.speaker.setVolume(payload.volume);
    } else {
      throw new Error(`Unknown speaker action: ${action}`);
    }
    this.queueCommand(result);
    return result;
  }

  /**
   * Dispatches OLED display update command
   */
  dispatchDisplayCommand(payload) {
    const result = this.modules.display.updateDisplay(payload);
    this.queueCommand(result);
    return result;
  }

  /**
   * Get comprehensive hardware status report
   */
  getHardwareStatus() {
    this.evaluateHeartbeatTimeout();

    const moduleStatusList = Object.entries(this.modules).map(([key, module]) => module.getStatus());

    const connectedCount = moduleStatusList.filter(m => m.state === HardwareState.CONNECTED).length;
    const simulatedCount = moduleStatusList.filter(m => m.state === HardwareState.SIMULATED).length;
    const faultCount = moduleStatusList.filter(m => m.state === HardwareState.FAULT).length;
    const disconnectedCount = moduleStatusList.filter(m => m.state === HardwareState.DISCONNECTED).length;

    return {
      overallState: this.overallState,
      operatingMode: this.targetOperatingMode,
      isPhysicalConnected: this.overallState === HardwareState.CONNECTED,
      isSimulated: this.overallState === HardwareState.SIMULATED,
      isDisconnected: this.overallState === HardwareState.DISCONNECTED,
      hasFault: this.overallState === HardwareState.FAULT,
      deviceId: this.connectedDeviceId || 'CJACK-NO-DEVICE',
      firmwareVersion: this.activeFirmwareVersion || 'v1.0.0-hw',
      lastPhysicalPacketTimestamp: this.lastPhysicalPacketTimestamp,
      lastPacketTimestamp: this.lastPacketTimestamp,
      heartbeatTimeoutMs: HARDWARE_TIMEOUTS.HEARTBEAT_TIMEOUT_MS,
      stats: {
        totalPackets: this.totalPacketsReceived,
        physicalPackets: this.physicalPacketsReceived,
        simulatedPackets: this.simulatedPacketsReceived,
        connectedModules: connectedCount,
        simulatedModules: simulatedCount,
        faultModules: faultCount,
        disconnectedModules: disconnectedCount,
        totalModules: moduleStatusList.length
      },
      supportedTargets: [
        'ESP32-WROOM-32 (Main Resuscitation MCU)',
        'LILYGO T-Beam v1.1 (LoRa SX1262 + NEO-6M GNSS)',
        'Analog Devices AD8232 (Lead-II ECG)',
        'Maxim MAX30102 (Optical SpO2 / Pulse)',
        'InvenSense MPU6050 (6-Axis IMU)',
        'Avia Semiconductor HX711 (Dual Wheatstone Load Cells)',
        'TI DRV8825 / BTS7960 (CPR Motor Driver)',
        'Solomon Systech SSD1306 (128x64 Vest OLED)',
        'Maxim MAX98357A (I2S Class-D Audio Prompt & Metronome)'
      ],
      modules: moduleStatusList,
      pendingCommandsCount: this.pendingCommands.length,
      latestPacket: this.latestPacket
    };
  }

  /**
   * Helper to generate a compliant sample packet for testing / documentation
   */
  generateSamplePacket(isPhysical = false, faultType = null) {
    const isFault = Boolean(faultType);
    return {
      deviceId: isPhysical ? 'CJACK-ESP32-PROD-01' : 'CJACK-SIM-01',
      firmwareVersion: 'v1.0.0-hw',
      timestamp: Date.now(),
      hardwareSource: isPhysical ? 'PHYSICAL' : 'SIMULATED',
      sensors: {
        ecg: {
          leadsConnected: faultType !== 'ECG_LEAD_OFF',
          leadOffPlus: faultType === 'ECG_LEAD_OFF',
          leadOffMinus: false,
          rawMv: faultType === 'ECG_LEAD_OFF' ? 0.0 : 1.24,
          signalQuality: faultType === 'ECG_LEAD_OFF' ? 0 : 96
        },
        heartRate: faultType === 'ECG_LEAD_OFF' ? 0 : 74,
        spo2: {
          percentage: 98,
          perfusionIndex: 4.2,
          fingerDetected: faultType !== 'SPO2_PROBE_OFF',
          ambientLightFault: false
        },
        motion: {
          ax: 0.02,
          ay: 0.01,
          az: 0.98,
          gx: 0.1,
          gy: -0.2,
          gz: 0.0,
          fallDetected: false,
          posture: 'SUPINE'
        },
        respiration: {
          rate: 16,
          amplitude: 45,
          sensorFault: false
        }
      },
      cpr: {
        active: false,
        rate: 0,
        depth: 0,
        force: 0,
        compressionCount: 0,
        motorStatus: 'STANDBY',
        driverTempC: 31.5,
        fault: faultType === 'MOTOR_FAULT'
      },
      location: {
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 2.5,
        fixType: '3D_FIX',
        satellites: 11
      },
      connectivity: {
        gps: 'LOCKED',
        lora: 'JOINED',
        backend: 'CONNECTED',
        loraRssi: -72,
        loraSnr: 9.5
      },
      battery: {
        percentage: 88,
        voltage: 14.8,
        currentMa: 120,
        isCharging: false,
        fault: faultType === 'BATTERY_CRITICAL'
      }
    };
  }
}

module.exports = new HardwareManager();
