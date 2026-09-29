/**
 * Respiration Hardware Service
 * 
 * Target hardware: Thoracic Piezoelectric Strain Transducer / ADS1292R Impedance Pneumography
 * Interface: Analog ADC (ESP32 GPIO 39 / VN) or I2C
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class RespirationService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'respiration',
      name: 'Thoracic Respiration Transducer',
      targetChip: 'Piezoelectric Strain Gauge / ADS1292R Pneumography',
      busType: HARDWARE_BUS_TYPES.ADC,
      defaultPinOrAddress: 'ADC1_CH3 (GPIO39 / VN)'
    });
  }

  processTelemetry(raw) {
    if (!raw) return {};

    const rate = typeof raw.rate === 'number' ? raw.rate : (typeof raw.respirationRate === 'number' ? raw.respirationRate : 16);
    const amplitude = typeof raw.amplitude === 'number' ? raw.amplitude : 45;
    const isApnea = rate === 0;

    let pattern = raw.pattern || (isApnea ? 'APNEA' : rate < 10 ? 'BRADYPNEA' : rate > 24 ? 'TACHYPNEA' : 'EUPNEA');

    return {
      rate,
      amplitude,
      pattern,
      isApnea,
      sensorContact: raw.sensorContact !== undefined ? Boolean(raw.sensorContact) : true,
      expansionRatio: raw.expansionRatio || 1.0,
      snrDb: raw.snrDb || 32
    };
  }
}

module.exports = new RespirationService();
