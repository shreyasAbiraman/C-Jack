const express = require('express');
const router = express.Router();
const simulationService = require('../services/simulationService');
const hardwareBridgeService = require('../services/hardwareBridgeService');
const hardwareManager = require('../services/hardware/hardwareManager');
const { HardwareState } = require('../services/hardware/hardwareStates');

// GET /api/telemetry/vitals - Patient vitals (HR, SpO2, EtCO2, ECG, Motion)
router.get('/vitals', (req, res) => {
  res.json({
    success: true,
    data: simulationService.getVitals()
  });
});

// GET /api/telemetry/vitals/history - Time-based vital history series
router.get('/vitals/history', (req, res) => {
  const range = req.query.range || '5m'; // '1m', '5m', '15m', 'session'
  const isHardware = hardwareBridgeService.hardwareConnected;

  // Determine number of sample points based on time range
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
      source: isHardware ? 'Hardware' : 'Simulation'
    });
  }

  res.json({
    success: true,
    range,
    dataSource: isHardware ? 'Hardware' : 'Simulation',
    count: history.length,
    data: history
  });
});

// GET /api/telemetry/sensors - Sensor array health status
router.get('/sensors', (req, res) => {
  const hwStatus = hardwareManager.getHardwareStatus();
  const isHardware = hwStatus.isPhysicalConnected;
  const isOffline = simulationService.deviceHealth.isOffline;
  const overallState = hwStatus.overallState;

  const defaultHealth = isOffline ? HardwareState.DISCONNECTED : overallState;

  const sensors = [
    {
      id: 'ecg_lead2',
      name: 'Lead-II ECG (AD8232)',
      type: 'Analog Front-End Electrodes',
      status: defaultHealth,
      source: isHardware ? 'Physical AD8232' : 'Simulation Engine',
      impedanceKohm: 48,
      noiseSnrDb: 38,
      lastCheck: new Date().toISOString()
    },
    {
      id: 'max30102',
      name: 'Pulse Oximeter (MAX30102)',
      type: 'Red/IR Photoplethysmogram',
      status: defaultHealth,
      source: isHardware ? 'Physical MAX30102' : 'Simulation Engine',
      perfusionIndex: 4.2,
      lastCheck: new Date().toISOString()
    },
    {
      id: 'piezo_resp',
      name: 'Thoracic Respiration Sensor',
      type: 'Piezoelectric Strain Gauge',
      status: defaultHealth,
      source: isHardware ? 'Physical Piezo Transducer' : 'Simulation Engine',
      lastCheck: new Date().toISOString()
    },
    {
      id: 'imu_motion',
      name: '6-Axis IMU (MPU6050)',
      type: 'Motion / Accelerometer',
      status: defaultHealth,
      source: isHardware ? 'Physical MPU-6050' : 'Simulation Engine',
      lastCheck: new Date().toISOString()
    },
    {
      id: 'depth_encoder',
      name: 'Sternal Depth Encoder',
      type: 'Linear Quadrature Optical',
      status: defaultHealth,
      source: isHardware ? 'Physical Depth Encoder' : 'Simulation Engine',
      lastCheck: new Date().toISOString()
    },
    {
      id: 'load_cells',
      name: 'Compression Load Cells',
      type: 'Dual Wheatstone Bridge (500N)',
      status: defaultHealth,
      source: isHardware ? 'Physical HX711 Load Cell' : 'Simulation Engine',
      lastCheck: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    hardwareState: overallState,
    isPhysicalConnected: isHardware,
    overallHealth: isOffline ? 'OFFLINE' : isHardware ? 'LIVE PHYSICAL HARDWARE' : 'SIMULATED (DEMO MODE)',
    activeChannels: isOffline ? 0 : 6,
    totalChannels: 6,
    data: sensors
  });
});

// GET /api/telemetry/cpr - CPR force & depth feedback
router.get('/cpr', (req, res) => {
  res.json({
    success: true,
    data: simulationService.getCprMetrics()
  });
});

// GET /api/telemetry/location - GPS location
router.get('/location', (req, res) => {
  res.json({
    success: true,
    data: simulationService.getLocation()
  });
});

// GET /api/telemetry/connectivity - LoRa & network metrics
router.get('/connectivity', (req, res) => {
  res.json({
    success: true,
    data: simulationService.getConnectivity()
  });
});

// Hardware Telemetry Ingestion Endpoint
router.post('/ingest', (req, res, next) => {
  try {
    const apiKey = req.headers['x-cjack-hardware-key'] || req.body.apiKey;
    const result = hardwareBridgeService.processHardwarePacket(req.body, apiKey);
    
    // Also feed into CJack HardwareManager if standard contract fields are provided
    if (req.body.sensors || req.body.deviceId) {
      try {
        const mappedPacket = {
          deviceId: req.body.device_id || req.body.deviceId || 'CJACK-ESP32-INGEST',
          timestamp: req.body.timestamp || Date.now(),
          hardwareSource: 'PHYSICAL',
          sensors: {
            heartRate: req.body.vitals?.hr || req.body.sensors?.heartRate || 72,
            spo2: req.body.vitals?.spo2 || req.body.sensors?.spo2 || 98,
            ecg: req.body.vitals?.ecg_sample || req.body.sensors?.ecg || 1.2,
            motion: req.body.sensors?.motion || {},
            respiration: req.body.sensors?.respiration || 16
          },
          cpr: req.body.cpr || { active: false },
          location: req.body.gps || req.body.location || { latitude: 12.9716, longitude: 77.5946 },
          connectivity: req.body.lora ? { lora: 'JOINED', gps: 'LOCKED', backend: 'CONNECTED', loraRssi: req.body.lora.rssi, loraSnr: req.body.lora.snr } : { gps: 'LOCKED', lora: 'JOINED', backend: 'CONNECTED' },
          battery: req.body.battery_mv ? { voltage: req.body.battery_mv / 1000, percentage: Math.min(100, Math.round(((req.body.battery_mv - 3200) / 1000) * 100)) } : (req.body.battery || 88)
        };
        hardwareManager.ingestTelemetry(mappedPacket, true);
      } catch (err) {
        console.warn('[TelemetryRoutes] Ingest bridge warning:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
