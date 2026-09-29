const express = require('express');
const router = express.Router();
const simulationService = require('../services/simulationService');
const hardwareBridgeService = require('../services/hardwareBridgeService');

// GET /api/system/status - Overall system and device status
router.get('/status', (req, res) => {
  const isSimulation = process.env.SIMULATION_MODE === 'true';
  const data = simulationService.getSystemStatus();
  res.json({
    success: true,
    data,
    hardwareBridge: hardwareBridgeService.getHardwareStatus()
  });
});

// GET /api/system/device - CJack hardware & battery status
router.get('/device', (req, res) => {
  const status = simulationService.getSystemStatus();
  res.json({
    success: true,
    data: status.deviceHealth,
    simulationMode: true
  });
});

// POST /api/system/simulate-state - Change simulation state (for testing UI & alarms)
router.post('/simulate-state', (req, res) => {
  const { state } = req.body;
  if (!state) {
    return res.status(400).json({ success: false, message: 'State parameter required' });
  }

  const updated = simulationService.triggerSimulatedEmergency(state);
  res.json({
    success: true,
    message: `Simulated state updated to ${state}`,
    data: updated
  });
});

// GET /api/system/logs - Prototype system event audit log
router.get('/logs', (req, res) => {
  const logs = [
    { id: 1, timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), level: 'INFO', category: 'POWER', message: 'CJack power-on self test completed successfully. Battery: 88%.' },
    { id: 2, timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(), level: 'INFO', category: 'LORA', message: 'TTGO T-Beam LoRa join confirmed. Gateway GW-BLR-041 (RSSI -72dBm).' },
    { id: 3, timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), level: 'INFO', category: 'GPS', message: 'NEO-6M GPS 3D fix acquired. 11 satellites locked.' },
    { id: 4, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), level: 'INFO', category: 'SENSORS', message: 'Dual-lead ECG baseline and photoplethysmogram calibration verified.' },
    { id: 5, timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(), level: 'INFO', category: 'ACTUATOR', message: 'Pneumatic compression harness pressure chamber nominal at 5.2 bar.' }
  ];

  res.json({
    success: true,
    count: logs.length,
    data: logs,
    notice: 'Prototype system event logs (Simulated)'
  });
});

module.exports = router;
