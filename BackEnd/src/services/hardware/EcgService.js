/**
 * ECG Hardware Service
 * 
 * Target hardware: AD8232 Single-Lead Heart Rate Monitor / ADS1292R 24-bit ECG AFE
 * Interface: Analog ADC (ESP32 GPIO 36 / VP) + GPIO LO+ (GPIO 34) + GPIO LO- (GPIO 35)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class EcgService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'ecg',
      name: 'Lead-II Electrocardiogram (ECG)',
      targetChip: 'Analog Devices AD8232 / ADS1292R',
      busType: HARDWARE_BUS_TYPES.ADC,
      defaultPinOrAddress: 'ADC1_CH0 (GPIO36), LO+: GPIO34, LO-: GPIO35'
    });
  }

  processTelemetry(raw) {
    if (!raw) return {};

    const leadsConnected = raw.leadsConnected !== undefined 
      ? Boolean(raw.leadsConnected)
      : !(raw.leadOffPlus || raw.leadOffMinus);

    // If leads are disconnected in physical mode, register a hardware fault
    if (this.state !== 'SIMULATED' && !leadsConnected) {
      this.setFault('ERR_ECG_LEAD_OFF', 'ECG electrode lead detachment detected (LO+/LO-)');
    }

    return {
      leadsConnected,
      leadOffPlus: Boolean(raw.leadOffPlus),
      leadOffMinus: Boolean(raw.leadOffMinus),
      rawMv: typeof raw.rawMv === 'number' ? raw.rawMv : 1.2,
      heartRate: typeof raw.heartRate === 'number' ? raw.heartRate : 72,
      signalQuality: typeof raw.signalQuality === 'number' ? raw.signalQuality : (leadsConnected ? 95 : 0),
      impedanceOhm: raw.impedanceOhm || 420,
      rhythmStatus: raw.rhythmStatus || (leadsConnected ? 'SINUS_RHYTHM' : 'NO_SIGNAL'),
      sampleRateHz: raw.sampleRateHz || 250
    };
  }
}

module.exports = new EcgService();
