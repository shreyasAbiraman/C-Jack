/**
 * CJack Hardware Bridge Service
 * 
 * ==============================================================================
 * HARDWARE INTEGRATION POINT:
 * This module manages hardware-in-the-loop communication for physical prototypes.
 * Intended physical targets:
 *   1. ESP32 Microcontroller (Chest compression load cells, depth encoder, pneumatic valves)
 *   2. TTGO T-Beam v1.1 / T-Echo (LoRa SX1262 / SX1276 transceiver + NEO-6M GPS)
 *   3. MAX30102 (SpO2 / Pulse) & AD8232 (Lead-II ECG Analog Front-End)
 * 
 * Communication Protocols:
 *   - HTTP POST REST Telemetry Ingestion: `/api/telemetry/ingest`
 *   - LoRa Gateway Serial/MQTT Bridge forwarder
 * ==============================================================================
 */

class HardwareBridgeService {
  constructor() {
    this.latestHardwarePacket = null;
    this.hardwareConnected = false;
    this.lastPacketReceivedTime = null;
  }

  /**
   * Ingest raw telemetry packet from ESP32 / T-Beam
   * Expected payload structure:
   * {
   *   device_id: "CJACK_ESP32_01",
   *   timestamp: 1726900000,
   *   battery_mv: 4150,
   *   vitals: { hr: 82, spo2: 97, ecg_sample: [...] },
   *   cpr: { force_n: 390, depth_mm: 52, recoil_ok: 1 },
   *   gps: { lat: 12.9716, lng: 77.5946, fix: 1 },
   *   lora: { rssi: -78, snr: 8 }
   * }
   */
  processHardwarePacket(rawPacket, apiKey) {
    // 1. Verify hardware authorization key
    const expectedKey = process.env.HARDWARE_API_KEY;
    if (expectedKey && apiKey !== expectedKey) {
      const error = new Error('Unauthorized hardware ingestion attempt: Invalid API key');
      error.statusCode = 401;
      throw error;
    }

    // 2. Validate essential packet properties
    if (!rawPacket || !rawPacket.device_id) {
      const error = new Error('Malformed hardware packet: Missing device_id');
      error.statusCode = 400;
      throw error;
    }

    // 3. Update hardware state
    this.hardwareConnected = true;
    this.lastPacketReceivedTime = new Date().toISOString();
    this.latestHardwarePacket = {
      ...rawPacket,
      receivedAt: this.lastPacketReceivedTime,
      isSimulated: false, // Flag indicating real physical hardware source
      dataSource: '[PHYSICAL HARDWARE TELEMETRY]'
    };

    console.log(`[CJack Hardware Bridge] Received packet from ${rawPacket.device_id} at ${this.lastPacketReceivedTime}`);

    return {
      status: 'acknowledged',
      deviceId: rawPacket.device_id,
      timestamp: this.lastPacketReceivedTime
    };
  }

  getHardwareStatus() {
    return {
      isHardwareActive: this.hardwareConnected,
      lastSeen: this.lastPacketReceivedTime,
      latestPacket: this.latestHardwarePacket,
      supportedDevices: ['ESP32-WROOM-32', 'TTGO-T-Beam-SX1262', 'Raspberry Pi Zero 2W Gateway']
    };
  }
}

module.exports = new HardwareBridgeService();
