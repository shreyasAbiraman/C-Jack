const { Location } = require('../models');
const { isConnected } = require('../config/database');
const simulationService = require('./simulationService');

class LocationService {
  getLocation() {
    return simulationService.getLocation();
  }

  async updateLocation(data) {
    const payload = {
      deviceId: data.deviceId || 'CJACK-UNIT-TX104',
      responderId: data.responderId || null,
      type: data.type || 'device',
      latitude: data.latitude,
      longitude: data.longitude,
      altitudeMeters: data.altitudeMeters || 920,
      accuracyMeters: data.accuracyMeters || 2.8,
      speedKmh: data.speedKmh || 0,
      addressHint: data.addressHint || simulationService.location.addressHint,
      satellites: data.satellites || 11,
      isSimulated: data.isSimulated !== undefined ? data.isSimulated : false,
      timestamp: new Date(),
    };

    // Update in-memory simulation location
    if (payload.type === 'device') {
      simulationService.location = {
        ...simulationService.location,
        latitude: payload.latitude,
        longitude: payload.longitude,
        altitudeMeters: payload.altitudeMeters,
        accuracyMeters: payload.accuracyMeters,
        speedKmh: payload.speedKmh,
        addressHint: payload.addressHint,
        timestamp: payload.timestamp.toISOString(),
      };
    } else if (payload.type === 'responder') {
      simulationService.location.responderLocation = {
        latitude: payload.latitude,
        longitude: payload.longitude,
        callsign: data.callsign || 'ALS-MED-04',
      };
    }

    if (isConnected()) {
      return await Location.create(payload);
    }

    return payload;
  }

  async getHistory(limit = 20) {
    if (isConnected()) {
      const records = await Location.find().sort({ timestamp: -1 }).limit(limit);
      if (records.length > 0) return records;
    }
    return [
      {
        ...simulationService.location,
        isSimulated: true,
      },
    ];
  }

  simulateGPSPacket(custom = {}) {
    // Generate slight jitter in coordinates
    const latJitter = (Math.random() - 0.5) * 0.001;
    const lngJitter = (Math.random() - 0.5) * 0.001;

    const simulatedPacket = {
      deviceId: custom.deviceId || 'CJACK-UNIT-TX104',
      latitude: custom.latitude || (12.9716 + latJitter),
      longitude: custom.longitude || (77.5946 + lngJitter),
      altitudeMeters: custom.altitudeMeters || 920,
      accuracyMeters: custom.accuracyMeters || (2.5 + Math.random() * 0.8),
      speedKmh: custom.speedKmh || 0,
      heading: custom.heading || 45,
      satellites: custom.satellites || 11,
      addressHint: custom.addressHint || 'Bengaluru Central Emergency Sector 4 (MG Road Cross)',
      type: custom.type || 'device',
      isSimulated: true,
      timestamp: new Date().toISOString(),
    };

    simulationService.location = {
      ...simulationService.location,
      latitude: simulatedPacket.latitude,
      longitude: simulatedPacket.longitude,
      altitudeMeters: simulatedPacket.altitudeMeters,
      accuracyMeters: simulatedPacket.accuracyMeters,
      timestamp: simulatedPacket.timestamp,
    };

    if (isConnected()) {
      Location.create(simulatedPacket).catch((e) => console.error('Location save err:', e.message));
    }

    return simulatedPacket;
  }
}

module.exports = new LocationService();
