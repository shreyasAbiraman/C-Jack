/**
 * CJack Hardware Abstraction REST API Routes
 * 
 * Mount path: /api/hardware
 */

const express = require('express');
const router = express.Router();
const hardwareManager = require('../services/hardware/hardwareManager');
const contractSchema = require('../services/hardware/hardwareContract.json');

// GET /api/hardware/status - Comprehensive status of all 11 modules & overall state
router.get('/status', (req, res) => {
  const status = hardwareManager.getHardwareStatus();
  res.status(200).json({
    success: true,
    data: status
  });
});

router.get('/contract', (req, res) => {
  res.status(200).json({
    success: true,
    schema: contractSchema,
    samplePhysicalPacket: hardwareManager.generateSamplePacket(true),
    sampleSimulatedPacket: hardwareManager.generateSamplePacket(false),
    firmwareInstructions: {
      targetChips: [
        'ESP32-WROOM-32 (Main Resuscitation MCU)',
        'LILYGO T-Beam v1.1 (LoRa SX1262 + NEO-6M GNSS)',
        'Analog Devices AD8232 (Lead-II ECG)',
        'Maxim MAX30102 (Optical SpO2 / Pulse)',
        'InvenSense MPU6050 (6-Axis IMU)',
        'Avia Semiconductor HX711 (Dual Wheatstone Load Cells)',
        'TI DRV8825 / BTS7960 (CPR Motor Driver)',
        'Solomon Systech SSD1306 (128x64 Vest OLED)',
        'Maxim MAX98357A (I2S Class-D Audio Prompt & Metronome)'
      ],
      heartbeatTimeoutSec: 8,
      ingestUrl: '/api/hardware/telemetry',
      supportedTransports: ['HTTP REST JSON', 'LoRa SX1262 Gateway Bridge', 'USB-UART Serial Bridge']
    }
  });
});
// POST /api/hardware/telemetry - Telemetry Ingestion from ESP32 / LILYGO T-Beam
router.post('/telemetry', (req, res, next) => {
  try {
    const isPhysicalHeader = req.headers['x-cjack-hardware-source'] === 'physical';
    const isPhysical = isPhysicalHeader || req.body.hardwareSource === 'PHYSICAL';

    const result = hardwareManager.ingestTelemetry(req.body, isPhysical);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        validationErrors: error.validationErrors
      });
    }
    next(error);
  }
});

// POST /api/hardware/command - Dispatch downlink command to physical hardware
router.post('/command', (req, res, next) => {
  try {
    const { target, action, payload } = req.body;

    if (!target || !action) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields 'target' (e.g. 'motor', 'speaker', 'display') and 'action'"
      });
    }

    let result;
    if (target === 'motor') {
      result = hardwareManager.dispatchMotorCommand(action, payload);
    } else if (target === 'speaker') {
      result = hardwareManager.dispatchSpeakerCommand(action, payload);
    } else if (target === 'display') {
      result = hardwareManager.dispatchDisplayCommand(payload || {});
    } else {
      return res.status(400).json({
        success: false,
        message: `Unsupported command target: ${target}. Allowed: motor, speaker, display`
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/hardware/mode - Switch between SIMULATION and PHYSICAL mode
router.post('/mode', (req, res, next) => {
  try {
    const { mode } = req.body;
    const result = hardwareManager.setOperatingMode(mode);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/hardware/simulate-packet - Inject synthetic test packet
router.post('/simulate-packet', (req, res) => {
  const isPhysical = Boolean(req.body.asPhysical);
  const sample = req.body.customPacket || hardwareManager.generateSamplePacket(isPhysical, req.body.faultType);
  const result = hardwareManager.ingestTelemetry(sample, isPhysical);
  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = router;
