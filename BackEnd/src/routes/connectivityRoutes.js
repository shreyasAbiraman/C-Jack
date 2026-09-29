const express = require('express');
const router = express.Router();
const connectivityService = require('../services/connectivityService');

// GET /api/connectivity/status - Telemetry, GPS, LoRa, Gateway, Signal, Backend & Diagnostic Network States
router.get('/status', (req, res) => {
  res.status(200).json(connectivityService.getStatus());
});

// POST /api/connectivity/packet - Ingest structured communication packet
router.post('/packet', (req, res) => {
  try {
    const result = connectivityService.ingestPacket(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// GET /api/connectivity/packets - Retrieve stored communication packets
router.get('/packets', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  res.status(200).json(connectivityService.getPackets(limit));
});

// POST /api/connectivity/offline-queue/simulate - Step or control offline queue simulation
router.post('/offline-queue/simulate', (req, res) => {
  const action = req.body.action || 'NEXT_STEP';
  const updated = connectivityService.simulateOfflineQueue(action);
  res.status(200).json(updated);
});

// POST /api/connectivity/network-state - Update multi-state diagnostic flags
router.post('/network-state', (req, res) => {
  const updated = connectivityService.setNetworkStates(req.body);
  res.status(200).json(updated);
});

module.exports = router;
