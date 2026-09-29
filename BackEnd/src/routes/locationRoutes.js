const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// GET /api/location - Current GPS coordinates and positioning metrics
router.get('/', (req, res, next) => locationController.getLocation(req, res, next));

// GET /api/location/history - GPS waypoint history
router.get('/history', (req, res, next) => locationController.getHistory(req, res, next));

// POST /api/location - Ingest/update GPS coordinates
router.post('/', (req, res, next) => locationController.updateLocation(req, res, next));

// POST /api/location/simulate-packet - Generate simulated GPS telemetry packet
router.post('/simulate-packet', (req, res, next) => locationController.simulateGPS(req, res, next));

module.exports = router;
