/**
 * LoRa Long-Range Transceiver Hardware Service
 * 
 * Target hardware: Semtech SX1262 / SX1276 (LILYGO T-Beam v1.1 Sub-GHz Radio)
 * Interface: SPI (ESP32 SCK: GPIO 5, MISO: GPIO 19, MOSI: GPIO 27, CS: GPIO 18, DIO1: GPIO 23, RST: GPIO 23)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class LoraService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'lora',
      name: 'LoRa Transceiver (SX1262)',
      targetChip: 'Semtech SX1262 / SX1276 Sub-GHz',
      busType: HARDWARE_BUS_TYPES.SPI,
      defaultPinOrAddress: 'SPI (CS: GPIO18, SCK: GPIO5, MISO: GPIO19, MOSI: GPIO27)'
    });
  }

  processTelemetry(raw) {
    if (!raw) return {};

    const rssi = typeof raw.rssi === 'number' ? raw.rssi : (typeof raw.loraRssi === 'number' ? raw.loraRssi : -72);
    const snr = typeof raw.snr === 'number' ? raw.snr : (typeof raw.loraSnr === 'number' ? raw.loraSnr : 9.5);
    const joined = raw.lora === 'JOINED' || raw.joined !== false;
    const packetLossRate = raw.packetLossRate || '0.2%';

    if (this.state !== 'SIMULATED' && !joined) {
      this.setFault('ERR_LORA_DISCONNECTED', 'SX1262 radio lost gateway carrier beacon');
    }

    return {
      rssi,
      snr,
      joined,
      frequency: raw.frequency || '868.1 MHz',
      bandwidthKhz: raw.bandwidthKhz || 125,
      spreadingFactor: raw.spreadingFactor || 7,
      txPowerDbm: raw.txPowerDbm || 14,
      packetLossRate,
      gatewayId: raw.gatewayId || 'GW-BLR-041',
      packetsTransmitted: raw.packetsTransmitted || this.packetCount
    };
  }

  formatEmergencyFrame(payload) {
    return {
      protocol: 'CJACK_LORA_FRAME_V1',
      syncWord: 0x12,
      rawHex: Buffer.from(JSON.stringify(payload)).toString('hex'),
      sizeBytes: Buffer.byteLength(JSON.stringify(payload)),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new LoraService();
