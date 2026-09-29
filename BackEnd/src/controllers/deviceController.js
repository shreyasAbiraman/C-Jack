const deviceService = require('../services/deviceService');
const simulationService = require('../services/simulationService');
const ApiResponse = require('../utils/apiResponse');

class DeviceController {
  async getAllDevices(req, res, next) {
    try {
      const devices = await deviceService.getAllDevices();
      return ApiResponse.success(res, devices, 'Registered devices retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getOverview(req, res, next) {
    try {
      const deviceId = req.params.id || req.query.deviceId || 'CJACK-UNIT-TX104';
      const overview = await deviceService.getOverview(deviceId);
      return res.status(200).json(overview);
    } catch (error) {
      next(error);
    }
  }

  getSensors(req, res, next) {
    try {
      const sensors = deviceService.getSensors();
      return res.status(200).json(sensors);
    } catch (error) {
      next(error);
    }
  }

  getModes(req, res, next) {
    try {
      const modes = deviceService.getModes();
      return res.status(200).json(modes);
    } catch (error) {
      next(error);
    }
  }

  async setMode(req, res, next) {
    try {
      const { mode, deviceId = 'CJACK-UNIT-TX104' } = req.body;
      if (!mode) {
        return ApiResponse.badRequest(res, 'Operating mode is required');
      }
      const result = await deviceService.setMode(deviceId, mode);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  getMaintenance(req, res, next) {
    try {
      const maintenance = deviceService.getMaintenance();
      return res.status(200).json(maintenance);
    } catch (error) {
      next(error);
    }
  }

  runSelfTest(req, res, next) {
    try {
      const result = deviceService.runSelfTest();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  simulateStatus(req, res, next) {
    try {
      const result = simulationService.generateSimulatedDevice(req.body);
      return ApiResponse.success(res, result.data, 'Device simulated status updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/device/vitals or /api/devices/vitals
   * Ingests real-time vitals packet from ESP32 hardware
   */
  async ingestDeviceVitals(req, res, next) {
    try {
      // 1. Header API Key Check (Enforced if key provided or in production)
      const requiredKey = process.env.DEVICE_API_KEY || process.env.HARDWARE_API_KEY;
      const clientKey = req.headers['x-cjack-device-key'] || req.headers['x-api-key'] || req.headers['x-cjack-hardware-key'] || req.headers['authorization'];
      if (requiredKey && clientKey && !clientKey.includes(requiredKey) && clientKey !== requiredKey) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid hardware device API key',
        });
      }

      const { deviceId, heartRate, spo2, timestamp, sensorStatus, source } = req.body;

      // 2. Validate Device ID
      if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Validation Error: 'deviceId' is required and must be a non-empty string",
        });
      }

      // 3. Validate Sensor Status
      const validStatuses = ['CONNECTED', 'DISCONNECTED', 'CHECK', 'FAULT', 'SIMULATION'];
      const status = (sensorStatus || 'CONNECTED').toUpperCase();
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Validation Error: 'sensorStatus' must be one of: ${validStatuses.join(', ')}`,
        });
      }

      // 4. Validate Numeric Ranges for Connected Sensors
      if (status === 'CONNECTED') {
        if (heartRate !== undefined && heartRate !== null) {
          const hr = Number(heartRate);
          if (isNaN(hr) || hr < 0 || hr > 300) {
            return res.status(400).json({
              success: false,
              message: "Validation Error: 'heartRate' must be a valid number between 0 and 300 BPM",
            });
          }
        }
        if (spo2 !== undefined && spo2 !== null) {
          const sp = Number(spo2);
          if (isNaN(sp) || sp < 0 || sp > 100) {
            return res.status(400).json({
              success: false,
              message: "Validation Error: 'spo2' must be a valid percentage between 0 and 100%",
            });
          }
        }
      }

      // 5. Validate Timestamp if provided
      if (timestamp) {
        const dateObj = new Date(timestamp);
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Validation Error: 'timestamp' must be a valid ISO 8601 date string or epoch timestamp",
          });
        }
      }

      // 6. Process and Ingest
      const recorded = await deviceService.ingestDeviceVitals({
        ...req.body,
        deviceId: deviceId.trim(),
        sensorStatus: status,
      });

      return res.status(200).json({
        success: true,
        message: 'Device vitals ingested and synchronized in real-time',
        data: recorded,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeviceController();
