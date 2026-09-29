/**
 * Motion & Posture Hardware Service
 * 
 * Target hardware: TDK InvenSense MPU6050 6-Axis MotionTracking Device (Accelerometer + Gyroscope)
 * Interface: I2C (Address: 0x68, ESP32 SDA: GPIO 21, SCL: GPIO 22, INT: GPIO 18)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class MotionService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'motion',
      name: '6-Axis IMU & Motion (MPU6050)',
      targetChip: 'TDK InvenSense MPU-6050',
      busType: HARDWARE_BUS_TYPES.I2C,
      defaultPinOrAddress: '0x68 (SDA: GPIO21, SCL: GPIO22)'
    });
  }

  processTelemetry(raw) {
    if (!raw) return {};

    const ax = typeof raw.ax === 'number' ? raw.ax : 0.02;
    const ay = typeof raw.ay === 'number' ? raw.ay : 0.01;
    const az = typeof raw.az === 'number' ? raw.az : 0.98;

    // Estimate posture based on gravity vector
    let posture = raw.posture || 'SUPINE';
    if (Math.abs(az) > 0.7) {
      posture = az > 0 ? 'SUPINE' : 'PRONE';
    } else if (Math.abs(ay) > 0.7) {
      posture = 'UPRIGHT';
    } else if (Math.abs(ax) > 0.7) {
      posture = 'LATERAL_RECUMBENT';
    }

    const fallDetected = Boolean(raw.fallDetected);
    const convulsionDetected = Boolean(raw.convulsionDetected);

    return {
      ax,
      ay,
      az,
      gx: typeof raw.gx === 'number' ? raw.gx : 0.0,
      gy: typeof raw.gy === 'number' ? raw.gy : 0.0,
      gz: typeof raw.gz === 'number' ? raw.gz : 0.0,
      totalG: parseFloat(Math.sqrt(ax * ax + ay * ay + az * az).toFixed(2)),
      posture,
      fallDetected,
      convulsionDetected,
      motionState: fallDetected ? 'FALL_EVENT' : convulsionDetected ? 'CONVULSION_DETECTED' : 'RESTING_SUPINE',
      calibrated: raw.calibrated !== undefined ? Boolean(raw.calibrated) : true
    };
  }
}

module.exports = new MotionService();
