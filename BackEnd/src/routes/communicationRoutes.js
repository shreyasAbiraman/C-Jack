const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');

// GET /api/communication/status or /api/connectivity/status
router.get('/status', (req, res, next) => communicationController.getStatus(req, res, next));

// POST /api/communication/packet or /api/connectivity/packet - Ingest structured packet
router.post('/packet', (req, res, next) => communicationController.ingestPacket(req, res, next));

// GET /api/communication/packets or /api/connectivity/packets - Packet buffer log
router.get('/packets', (req, res, next) => communicationController.getPackets(req, res, next));

// POST /api/communication/offline-queue/simulate - Step offline queue simulation
router.post('/offline-queue/simulate', (req, res, next) => communicationController.simulateOfflineQueue(req, res, next));

// POST /api/communication/network-state - Update multi-state diagnostic flags
router.post('/network-state', (req, res, next) => communicationController.setNetworkState(req, res, next));

// POST /api/communication/simulate-packet - Generate simulated packet
router.post('/simulate-packet', (req, res, next) => communicationController.simulatePacket(req, res, next));

module.exports = router;
