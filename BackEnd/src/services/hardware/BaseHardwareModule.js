/**
 * Base Hardware Module Class
 * 
 * Abstract base class for all 11 CJack hardware interfaces.
 * Provides unified state management, heartbeat tracking, fault detection, and telemetry serialization.
 */

const { HardwareState, HARDWARE_BUS_TYPES } = require('./hardwareStates');

class BaseHardwareModule {
  /**
   * @param {Object} options
   * @param {string} options.id - Unique module identifier (e.g. 'ecg', 'spo2')
   * @param {string} options.name - Human-readable sensor/actuator name
   * @param {string} options.targetChip - Hardware IC model (e.g. 'AD8232', 'MAX30102')
   * @param {string} options.busType - Interface bus type from HARDWARE_BUS_TYPES
   * @param {string} options.defaultPinOrAddress - I2C address / GPIO pin / UART port
   */
  constructor({ id, name, targetChip, busType = HARDWARE_BUS_TYPES.I2C, defaultPinOrAddress = 'N/A' }) {
    this.id = id;
    this.name = name;
    this.targetChip = targetChip;
    this.busType = busType;
    this.pinOrAddress = defaultPinOrAddress;

    // Initial state is UNKNOWN or SIMULATED depending on system runtime mode
    this.state = HardwareState.SIMULATED;
    this.lastPacketTime = null;
    this.lastLatencyMs = 0;
    this.packetCount = 0;
    this.faultCode = null;
    this.faultMessage = null;
    this.latestTelemetry = {};
  }

  /**
   * Update state from incoming telemetry packet
   * @param {Object} packetData - Raw sensor data slice
   * @param {boolean} isPhysical - Whether this packet came from an authentic physical device
   */
  ingest(packetData, isPhysical = false) {
    this.lastPacketTime = new Date().toISOString();
    this.packetCount++;

    if (!isPhysical) {
      this.state = HardwareState.SIMULATED;
      this.faultCode = null;
      this.faultMessage = null;
    } else {
      // Physical device packet: check for hardware fault flags
      if (packetData && (packetData.fault || packetData.error || packetData.sensorFault)) {
        this.state = HardwareState.FAULT;
        this.faultCode = packetData.faultCode || 'ERR_SENSOR_FAULT';
        this.faultMessage = packetData.faultMessage || 'Hardware sensor reported internal error or lead disconnection';
      } else {
        this.state = HardwareState.CONNECTED;
        this.faultCode = null;
        this.faultMessage = null;
      }
    }

    this.latestTelemetry = this.processTelemetry(packetData);
    return this.getStatus();
  }

  /**
   * Override in sub-classes to format/validate specific sensor/actuator data
   */
  processTelemetry(raw) {
    return raw || {};
  }

  /**
   * Triggered when heartbeat monitor detects timeout for physical hardware
   */
  markDisconnected() {
    if (this.state === HardwareState.CONNECTED || this.state === HardwareState.FAULT) {
      this.state = HardwareState.DISCONNECTED;
      this.faultMessage = 'Telemetry timeout: No physical packet received within heartbeat threshold';
    }
  }

  /**
   * Force simulated mode
   */
  setSimulatedMode() {
    this.state = HardwareState.SIMULATED;
    this.faultCode = null;
    this.faultMessage = null;
  }

  /**
   * Manually flag a hardware fault
   */
  setFault(code, message) {
    this.state = HardwareState.FAULT;
    this.faultCode = code;
    this.faultMessage = message;
  }

  /**
   * Universal status snapshot
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      targetChip: this.targetChip,
      busType: this.busType,
      pinOrAddress: this.pinOrAddress,
      state: this.state,
      isPhysicalConnected: this.state === HardwareState.CONNECTED,
      isSimulated: this.state === HardwareState.SIMULATED,
      hasFault: this.state === HardwareState.FAULT,
      faultCode: this.faultCode,
      faultMessage: this.faultMessage,
      lastPacketTime: this.lastPacketTime,
      packetCount: this.packetCount,
      telemetry: this.latestTelemetry
    };
  }
}

module.exports = BaseHardwareModule;
