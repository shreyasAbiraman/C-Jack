const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const eventController = require('../controllers/eventController');
const simulationController = require('../controllers/simulationController');

// GET /api/devices or /api/device - List devices
router.get('/', (req, res, next) => deviceController.getAllDevices(req, res, next));

// GET /api/devices/overview or /api/device/overview - Telemetry overview
router.get('/overview', (req, res, next) => deviceController.getOverview(req, res, next));

// GET /api/devices/sensors - 7-channel sensor diagnostic status
router.get('/sensors', (req, res, next) => deviceController.getSensors(req, res, next));

// GET /api/devices/modes - Operating mode definitions
router.get('/modes', (req, res, next) => deviceController.getModes(req, res, next));

// POST /api/devices/mode - Change operating mode
router.post('/mode', (req, res, next) => deviceController.setMode(req, res, next));

// GET /api/devices/events - Device events log (legacy compatibility)
router.get('/events', (req, res, next) => eventController.getEvents(req, res, next));

// POST /api/devices/event - Log device event (legacy compatibility)
router.post('/event', (req, res, next) => eventController.recordEvent(req, res, next));

// GET /api/devices/maintenance - Health score & maintenance status
router.get('/maintenance', (req, res, next) => deviceController.getMaintenance(req, res, next));

// POST /api/devices/maintenance/self-test - Trigger diagnostic self-test
router.post('/maintenance/self-test', (req, res, next) => deviceController.runSelfTest(req, res, next));

// POST /api/devices/vitals or /api/device/vitals - Hardware device vitals ingestion
router.post('/vitals', (req, res, next) => deviceController.ingestDeviceVitals(req, res, next));

// Simulation Endpoints
router.post('/simulate-status', (req, res, next) => deviceController.simulateStatus(req, res, next));
router.post('/simulate-sensors', (req, res, next) => simulationController.simulateSensors(req, res, next));

module.exports = router;
