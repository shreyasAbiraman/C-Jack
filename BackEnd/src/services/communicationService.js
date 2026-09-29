const { CommunicationPacket } = require('../models');
const { isConnected } = require('../config/database');
const connectivityService = require('./connectivityService');

class CommunicationService {
  getStatus() {
    return connectivityService.getStatus();
  }

  async ingestPacket(packetData = {}) {
    const enriched = {
      deviceId: packetData.deviceId || 'CJACK-UNIT-TX104',
      emergencyStatus: packetData.emergencyStatus || 'NORMAL',
      latitude: packetData.latitude !== undefined ? packetData.latitude : 12.9716,
      longitude: packetData.longitude !== undefined ? packetData.longitude : 77.5946,
      heartRate: packetData.heartRate !== undefined ? packetData.heartRate : 74,
      spo2: packetData.spo2 !== undefined ? packetData.spo2 : 98,
      cprStatus: packetData.cprStatus || 'STANDBY',
      battery: packetData.battery !== undefined ? packetData.battery : 88,
      sensorStatus: packetData.sensorStatus || 'ALL_CHANNELS_OK',
      timestamp: packetData.timestamp || new Date().toISOString(),
      ...packetData,
    };

    const result = connectivityService.ingestPacket(enriched);

    if (isConnected()) {
      try {
        await CommunicationPacket.create({
          packetId: result.packet?.id || `PKT-${Date.now().toString(36).toUpperCase()}`,
          deviceId: packetData.deviceId || 'CJACK-UNIT-TX104',
          protocol: packetData.protocol || 'LORA',
          direction: 'UPLINK',
          payloadType: packetData.payloadType || 'TELEMETRY',
          rawData: JSON.stringify(packetData),
          parsedData: packetData,
          rssi: packetData.rssi || -72,
          snr: packetData.snr || 9.5,
          frequency: packetData.frequency || '868.1 MHz',
          gatewayId: packetData.gatewayId || 'GW-BLR-041',
          status: 'RECEIVED',
          isSimulated: packetData.isSimulated !== undefined ? packetData.isSimulated : true,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('CommunicationPacket DB save error:', err.message);
      }
    }

    return result;
  }

  async getPackets(limit = 20) {
    if (isConnected()) {
      const packets = await CommunicationPacket.find().sort({ timestamp: -1 }).limit(limit);
      if (packets && packets.length > 0) {
        return {
          success: true,
          count: packets.length,
          data: packets,
        };
      }
    }
    return connectivityService.getPackets(limit);
  }

  simulateOfflineQueue(action = 'NEXT_STEP') {
    return connectivityService.simulateOfflineQueue(action);
  }

  setNetworkStates(states) {
    return connectivityService.setNetworkStates(states);
  }

  simulatePacket(custom = {}) {
    const sample = {
      deviceId: custom.deviceId || 'CJACK-UNIT-TX104',
      protocol: custom.protocol || 'LORA',
      emergencyStatus: custom.emergencyStatus || 'NORMAL',
      latitude: custom.latitude || 12.9716,
      longitude: custom.longitude || 77.5946,
      heartRate: custom.heartRate || 74,
      spo2: custom.spo2 || 98,
      cprStatus: custom.cprStatus || 'STANDBY',
      battery: custom.battery || 88,
      sensorStatus: custom.sensorStatus || 'ALL_CHANNELS_OK',
      isSimulated: true,
      timestamp: new Date().toISOString(),
    };

    return this.ingestPacket(sample);
  }
}

module.exports = new CommunicationService();
