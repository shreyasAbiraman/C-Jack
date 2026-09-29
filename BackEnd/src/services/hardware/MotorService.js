/**
 * CPR Motor & Actuator Hardware Service
 * 
 * Target hardware: TI DRV8825 Stepper / BTS7960 High-Current H-Bridge Motor Driver + Brushless Compression Actuator
 * Interface: PWM & Direction GPIO (ESP32 PWM: GPIO 25, DIR: GPIO 26, EN: GPIO 27, FAULT: GPIO 33)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class MotorService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'motor',
      name: 'CPR Motor Actuator & Driver',
      targetChip: 'TI DRV8825 / BTS7960 43A H-Bridge',
      busType: HARDWARE_BUS_TYPES.PWM,
      defaultPinOrAddress: 'PWM: GPIO25, DIR: GPIO26, EN: GPIO27, FAULT: GPIO33'
    });

    this.active = false;
    this.targetRate = 110;
    this.targetDepthMm = 55;
    this.currentDutyCycle = 0;
    this.driverTempC = 32.5;
    this.emergencyStopEngaged = false;
  }

  processTelemetry(raw) {
    if (!raw) return {};

    const active = raw.active !== undefined ? Boolean(raw.active) : this.active;
    const rate = typeof raw.rate === 'number' ? raw.rate : (active ? this.targetRate : 0);
    const depth = typeof raw.depth === 'number' ? raw.depth : (active ? this.targetDepthMm : 0);
    const driverTempC = typeof raw.driverTempC === 'number' ? raw.driverTempC : 32.5;
    const motorCurrentAmps = typeof raw.motorCurrentAmps === 'number' ? raw.motorCurrentAmps : (active ? 4.2 : 0.1);
    const driverFault = Boolean(raw.fault || raw.driverFault || raw.thermalCutout);

    if (this.state !== 'SIMULATED' && driverFault) {
      this.setFault('ERR_MOTOR_DRIVER_FAULT', 'Motor driver signaled overcurrent or thermal shutdown');
    }

    this.active = active;
    this.driverTempC = driverTempC;

    return {
      active,
      rate,
      depth,
      driverTempC,
      motorCurrentAmps,
      compressionCount: raw.compressionCount || 0,
      driverFault,
      dutyCyclePercent: active ? (raw.dutyCycle || 68) : 0,
      emergencyStopEngaged: this.emergencyStopEngaged,
      motorState: this.emergencyStopEngaged ? 'EMERGENCY_STOP' : active ? 'CPR_COMPRESSION_ACTIVE' : 'STANDBY_READY'
    };
  }

  // Actuator Downlink Commands
  startCpr(targetRate = 110, targetDepthMm = 55) {
    this.active = true;
    this.emergencyStopEngaged = false;
    this.targetRate = targetRate;
    this.targetDepthMm = targetDepthMm;
    this.currentDutyCycle = 68;
    return {
      command: 'START_CPR',
      targetRate,
      targetDepthMm,
      timestamp: new Date().toISOString()
    };
  }

  stopCpr() {
    this.active = false;
    this.currentDutyCycle = 0;
    return {
      command: 'STOP_CPR',
      timestamp: new Date().toISOString()
    };
  }

  emergencyStop() {
    this.active = false;
    this.emergencyStopEngaged = true;
    this.currentDutyCycle = 0;
    return {
      command: 'EMERGENCY_BRAKE',
      cutoffSpeedMs: 15,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new MotorService();
