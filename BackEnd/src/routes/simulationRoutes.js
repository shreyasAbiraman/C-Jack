const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

// GET /api/simulation/status - Full simulated system state
router.get('/status', (req, res, next) => simulationController.getStatus(req, res, next));

// POST /api/simulation/vitals - Generate simulated vital signs
router.post('/vitals', (req, res, next) => simulationController.simulateVitals(req, res, next));

// POST /api/simulation/cpr - Generate simulated CPR compression metrics
router.post('/cpr', (req, res, next) => simulationController.simulateCPR(req, res, next));

// POST /api/simulation/sensors - Generate simulated sensor array status
router.post('/sensors', (req, res, next) => simulationController.simulateSensors(req, res, next));

// POST /api/simulation/device - Generate simulated device hardware status
router.post('/device', (req, res, next) => simulationController.simulateDevice(req, res, next));

// POST /api/simulation/emergency - Generate simulated emergency events sequence
router.post('/emergency', (req, res, next) => simulationController.simulateEmergency(req, res, next));

// POST /api/simulation/gps - Generate simulated GNSS GPS packets
router.post('/gps', (req, res, next) => simulationController.simulateGPS(req, res, next));

// POST /api/simulation/reset - Reset simulation to normal standby
router.post('/reset', (req, res, next) => simulationController.resetSimulation(req, res, next));

// POST /api/simulation/scenario - Apply a named clinical scenario by ID (1–12)
router.post('/scenario', (req, res, next) => simulationController.applyScenario(req, res, next));

// POST /api/simulation/parameter - Override a single telemetry parameter
router.post('/parameter', (req, res, next) => simulationController.setParameter(req, res, next));

module.exports = router;
