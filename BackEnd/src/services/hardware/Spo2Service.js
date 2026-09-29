/**
 * SpO2 & PPG Hardware Service
 * 
 * Target hardware: Maxim Integrated MAX30102 High-Sensitivity Pulse Oximeter & Heart-Rate Sensor
 * Interface: I2C (Address: 0x57, ESP32 SDA: GPIO 21, SCL: GPIO 22, INT: GPIO 19)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class Spo2Service extends BaseHardwareModule {
  constructor() {
    super({
      id: 'spo2',
      name: 'Pulse Oximeter & PPG (SpO2)',
      targetChip: 'Maxim MAX30102',
      busType: HARDWARE_BUS_TYPES.I2C,
      defaultPinOrAddress: '0x57 (SDA: GPIO21, SCL: GPIO22)'
    });
  }

  processTelemetry(raw) {
    if (!raw) return {};

    const fingerDetected = raw.fingerDetected !== undefined ? Boolean(raw.fingerDetected) : true;
    const percentage = typeof raw.percentage === 'number' ? raw.percentage : (typeof raw.spo2 === 'number' ? raw.spo2 : 98);
    const perfusionIndex = typeof raw.perfusionIndex === 'number' ? raw.perfusionIndex : 4.2;

    if (this.state !== 'SIMULATED' && (!fingerDetected || percentage < 70)) {
      if (!fingerDetected) {
        this.setFault('ERR_SPO2_NO_PROBE_CONTACT', 'MAX30102 optical probe has no tissue contact');
      }
    }

    return {
      percentage,
      perfusionIndex,
      fingerDetected,
      ambientLightFault: Boolean(raw.ambientLightFault),
      redIrRatio: raw.redIrRatio || 0.85,
      sampleRateHz: raw.sampleRateHz || 100,
      confidence: fingerDetected ? 96 : 0
    };
  }
}

module.exports = new Spo2Service();
