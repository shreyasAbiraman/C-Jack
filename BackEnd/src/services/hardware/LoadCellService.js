/**
 * Load Cell Hardware Service
 * 
 * Target hardware: Avia Semiconductor HX711 24-Bit ADC with Dual 500N Wheatstone Sternal Compression Load Cells
 * Interface: 2-Wire Serial (ESP32 DOUT: GPIO 16, SCK: GPIO 4)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class LoadCellService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'loadCell',
      name: 'Sternal Compression Load Cells (HX711)',
      targetChip: 'Avia Semiconductor HX711 24-Bit ADC (Dual 500N)',
      busType: HARDWARE_BUS_TYPES.GPIO,
      defaultPinOrAddress: 'DOUT: GPIO16, SCK: GPIO4'
    });
  }

  processTelemetry(raw) {
    if (!raw) return {};

    const forceNewtons = typeof raw.force === 'number' ? raw.force : (typeof raw.forceNewtons === 'number' ? raw.forceNewtons : 0);
    const depthMm = typeof raw.depth === 'number' ? raw.depth : (typeof raw.depthMm === 'number' ? raw.depthMm : 0);
    const sternalContact = raw.sternalContact !== undefined ? Boolean(raw.sternalContact) : forceNewtons > 15;
    const isSaturated = forceNewtons > 650;

    if (this.state !== 'SIMULATED' && isSaturated) {
      this.setFault('ERR_LOAD_CELL_SATURATED', 'HX711 ADC input saturated (> 650 N overload risk)');
    }

    return {
      forceNewtons,
      depthMm,
      sternalContact,
      isSaturated,
      tareOffsetRaw: raw.tareOffsetRaw || 124500,
      scaleFactor: raw.scaleFactor || 420.5,
      sampleRateHz: raw.sampleRateHz || 80,
      driftPercentage: raw.driftPercentage || 0.12
    };
  }
}

module.exports = new LoadCellService();
