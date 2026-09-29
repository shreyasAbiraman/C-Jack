const express = require('express');
const router = express.Router();
const cprController = require('../controllers/cprController');

// GET /api/cpr or /api/cpr/state - Retrieve live CPR state & closed-loop metrics
router.get('/', (req, res, next) => cprController.getState(req, res, next));
router.get('/state', (req, res, next) => cprController.getState(req, res, next));

// POST /api/cpr/transition - State machine transition request
router.post('/transition', (req, res, next) => cprController.transition(req, res, next));

// POST /api/cpr/emergency-stop - Instantaneous hardware/software E-Stop
router.post('/emergency-stop', (req, res, next) => cprController.emergencyStop(req, res, next));

// POST /api/cpr/simulator - Update CPR simulator parameters
router.post('/simulator', (req, res, next) => cprController.updateSimulator(req, res, next));

// GET /api/cpr/analytics - Retrieve CPR compression analytics and ROSC metrics
router.get('/analytics', (req, res, next) => cprController.getAnalytics(req, res, next));

// POST /api/cpr/reset - Reset CPR session counters
router.post('/reset', (req, res, next) => cprController.reset(req, res, next));

// POST /api/cpr/simulate - Trigger simulated CPR cycle
router.post('/simulate', (req, res, next) => cprController.simulateCPR(req, res, next));

module.exports = router;
