const { Device, VitalReading } = require('../models');
const { isConnected } = require('../config/database');
const deviceManagementService = require('./deviceManagementService');
const simulationService = require('./simulationService');
const hardwareManager = require('./hardware/hardwareManager');
const { broadcastTelemetry } = require('./websocketServer');

class DeviceService {
  async getOverview(deviceId = 'CJACK-UNIT-TX104') {
    const overview = deviceManagementService.getOverview();
    if (isConnected()) {
      const dev = await Device.findOne({ deviceId });
      if (dev) {
        return {
          ...overview,
          dbRecord: dev,
        };
      }
    }
    return overview;
  }

  async getAllDevices() {
    if (isConnected()) {
      const devices = await Device.find();
      if (devices.length > 0) return devices;
    }
    return [
      {
        deviceId: simulationService.deviceHealth.deviceId,
        model: simulationService.deviceHealth.hardwareModel,
        firmwareVersion: simulationService.deviceHealth.firmwareVersion,
        status: simulationService.deviceHealth.isOffline ? 'OFFLINE' : 'ONLINE',
        batteryLevel: simulationService.deviceHealth.batteryLevel,
        actuatorPressureBar: simulationService.deviceHealth.actuatorPressureBar,
        activeMode: 'STANDBY',
        isSimulated: true,
      },
    ];
  }

  getSensors() {
    return deviceManagementService.getSensors();
  }

  getModes() {
    return deviceManagementService.getModes();
  }

  async setMode(deviceId = 'CJACK-UNIT-TX104', mode) {
    const result = deviceManagementService.setMode(mode);
    if (isConnected()) {
      await Device.findOneAndUpdate(
        { deviceId },
        { $set: { activeMode: mode, lastHeartbeat: new Date() } },
        { upsert: true }
      );
    }
    return result;
  }

  getMaintenance() {
    return deviceManagementService.getMaintenance();
  }

  runSelfTest() {
    return deviceManagementService.runSelfTest();
  }

  /**
   * Ingest Live Hardware Vitals from ESP32 / Wearable Vest (POST /api/device/vitals)
   */
  async ingestDeviceVitals(payload) {
    const {
      deviceId = 'CJACK-001',
      heartRate,
      spo2,
      perfusionIndex = 4.2,
      timestamp = new Date().toISOString(),
      sensorStatus = 'CONNECTED',
      source = 'REAL_HARDWARE',
      battery = 82,
      cprActive = false,
      cprRate = 0
    } = payload;

    const isConnectedSensor = sensorStatus === 'CONNECTED';
    const isHardware = source === 'REAL_HARDWARE' && isConnectedSensor;
    const isSimulated = !isHardware;

    const vitalRecord = {
      patientId: 'CJ-PATIENT-8829',
      deviceId,
      heartRate: (isConnectedSensor && heartRate !== null && heartRate !== undefined) ? Number(heartRate) : 0,
      spo2: (isConnectedSensor && spo2 !== null && spo2 !== undefined) ? Number(spo2) : 0,
      perfusionIndex: Number(perfusionIndex) || 4.2,
      sensorStatus,
      source: isHardware ? 'REAL_HARDWARE' : 'SIMULATION',
      isSimulated,
      timestamp: new Date(timestamp),
      lastUpdated: new Date().toISOString(),
    };

    // 1. Update in-memory telemetry state for instant live dashboard reads
    simulationService.vitals = {
      ...simulationService.vitals,
      ...vitalRecord,
    };

    if (battery !== undefined) {
      simulationService.deviceHealth.batteryLevel = Number(battery);
    }
    simulationService.deviceHealth.isOffline = false;
    simulationService.deviceHealth.lastHeartbeat = new Date().toISOString();

    // 2. Persist to MongoDB if connected
    if (isConnected()) {
      try {
        await Promise.all([
          VitalReading.create(vitalRecord),
          Device.findOneAndUpdate(
            { deviceId },
            {
              $set: {
                status: 'ONLINE',
                batteryLevel: Number(battery) || 82,
                lastHeartbeat: new Date(),
                isSimulated,
              },
            },
            { upsert: true, new: true }
          ),
        ]);
      } catch (err) {
        console.warn('[DeviceService] DB persistence notice:', err.message);
      }
    }

    // 3. Update Hardware Abstraction Subsystem
    try {
      hardwareManager.ingestTelemetry({
        deviceId,
        hardwareSource: isHardware ? 'PHYSICAL' : 'SIMULATED',
        timestamp: Date.now(),
        sensors: {
          heartRate: vitalRecord.heartRate,
          spo2: {
            percentage: vitalRecord.spo2,
            perfusionIndex: vitalRecord.perfusionIndex,
          },
        },
        cpr: {
          active: Boolean(cprActive),
          rate: Number(cprRate) || 0,
        },
        battery: {
          percentage: Number(battery) || 82,
        },
      }, isHardware);
    } catch (hwErr) {
      console.warn('[DeviceService] Hardware manager update notice:', hwErr.message);
    }

    // 4. Broadcast to all active WebSocket clients (instant web update)
    broadcastTelemetry({
      type: 'LIVE_DEVICE_VITALS',
      source: vitalRecord.source,
      deviceId,
      vitals: vitalRecord,
      sensorStatus,
      battery: Number(battery) || 82,
      timestamp: Date.now(),
    });

    return vitalRecord;
  }
}

module.exports = new DeviceService();

