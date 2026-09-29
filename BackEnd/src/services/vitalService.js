const { VitalReading } = require('../models');
const { isConnected } = require('../config/database');
const simulationService = require('./simulationService');
const hardwareBridgeService = require('./hardwareBridgeService');

class VitalService {
  getCurrentVitals() {
    return simulationService.getVitals();
  }

  async getHistory(range = '5m') {
    const isHardware = hardwareBridgeService.hardwareConnected;

    if (isConnected()) {
      let limit = 20;
      if (range === '1m') limit = 12;
      else if (range === '5m') limit = 20;
      else if (range === '15m') limit = 30;
      else if (range === 'session') limit = 40;

      const readings = await VitalReading.find().sort({ timestamp: -1 }).limit(limit);
      if (readings && readings.length > 0) {
        return {
          range,
          dataSource: isHardware ? 'Hardware' : 'Database / Simulation',
          count: readings.length,
          data: readings.reverse(),
        };
      }
    }

    // Generate simulated historical points if DB query returned empty
    let pointsCount = 15;
    let intervalSec = 20;
    if (range === '1m') {
      pointsCount = 12;
      intervalSec = 5;
    } else if (range === '5m') {
      pointsCount = 20;
      intervalSec = 15;
    } else if (range === '15m') {
      pointsCount = 30;
      intervalSec = 30;
    } else if (range === 'session') {
      pointsCount = 40;
      intervalSec = 60;
    }

    const now = Date.now();
    const currentStatus = simulationService.systemState.status;
    const isArrest = currentStatus === 'CARDIAC ARREST SUSPECTED' || currentStatus === 'CPR ACTIVE';

    const history = [];
    for (let i = pointsCount - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * intervalSec * 1000).toISOString();
      let hr = 74;
      let spo2 = 98;
      let resp = 16;

      if (isArrest) {
        if (i < 5) {
          hr = currentStatus === 'CPR ACTIVE' ? 108 : 0;
          spo2 = 82 + Math.floor(Math.random() * 4);
          resp = 0;
        } else {
          hr = 80 + Math.floor(Math.random() * 8);
          spo2 = 96;
          resp = 16;
        }
      } else {
        hr = 70 + Math.floor(Math.random() * 10);
        spo2 = 97 + Math.floor(Math.random() * 3);
        resp = 15 + Math.floor(Math.random() * 3);
      }

      history.push({
        timestamp,
        heartRate: hr,
        spo2: Math.min(100, spo2),
        respirationRate: resp,
        source: isHardware ? 'Hardware' : 'Simulation',
        isSimulated: !isHardware,
      });
    }

    return {
      range,
      dataSource: isHardware ? 'Hardware' : 'Simulation',
      count: history.length,
      data: history,
    };
  }

  async recordVital(data) {
    const payload = {
      patientId: data.patientId || 'CJ-PATIENT-8829',
      deviceId: data.deviceId || 'CJACK-UNIT-TX104',
      heartRate: data.heartRate,
      spo2: data.spo2,
      respirationRate: data.respirationRate || 16,
      perfusionIndex: data.perfusionIndex || 4.2,
      etco2: data.etco2 || 38,
      ecgRhythm: data.ecgRhythm || 'Normal Sinus Rhythm',
      motionState: data.motionState || 'Stationary / Resting',
      temperature: data.temperature || 36.8,
      source: data.source || 'Hardware',
      isSimulated: data.isSimulated !== undefined ? data.isSimulated : false,
      timestamp: data.timestamp || new Date(),
    };

    // Update in-memory vitals cache
    simulationService.vitals = {
      ...simulationService.vitals,
      ...payload,
      lastUpdated: new Date().toISOString(),
    };

    if (isConnected()) {
      return await VitalReading.create(payload);
    }

    return payload;
  }

  simulateVitals(custom = {}) {
    const jitterHR = Math.floor((Math.random() - 0.5) * 4);
    const jitterSpO2 = Math.floor((Math.random() - 0.5) * 2);

    const generated = {
      patientId: custom.patientId || 'CJ-PATIENT-8829',
      deviceId: custom.deviceId || 'CJACK-UNIT-TX104',
      heartRate: custom.heartRate !== undefined ? custom.heartRate : Math.max(0, 75 + jitterHR),
      spo2: custom.spo2 !== undefined ? custom.spo2 : Math.min(100, Math.max(70, 98 + jitterSpO2)),
      respirationRate: custom.respirationRate || 16,
      perfusionIndex: custom.perfusionIndex || 4.2,
      etco2: custom.etco2 || 38,
      ecgRhythm: custom.ecgRhythm || (custom.heartRate === 0 ? 'Ventricular Fibrillation' : 'Normal Sinus Rhythm'),
      motionState: custom.motionState || 'Stationary / Resting',
      temperature: custom.temperature || 36.8,
      source: 'Simulation',
      isSimulated: true,
      timestamp: new Date().toISOString(),
    };

    simulationService.vitals = {
      ...simulationService.vitals,
      ...generated,
      lastUpdated: new Date().toISOString(),
    };

    if (isConnected()) {
      VitalReading.create(generated).catch((err) => console.error('VitalReading save err:', err.message));
    }

    return generated;
  }
}

module.exports = new VitalService();
