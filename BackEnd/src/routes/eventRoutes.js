const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET /api/events - Retrieve hardware & system events audit log
router.get('/', (req, res, next) => eventController.getEvents(req, res, next));

// POST /api/events - Record a new device event
router.post('/', (req, res, next) => eventController.recordEvent(req, res, next));

// POST /api/events/simulate - Generate simulated event
router.post('/simulate', (req, res, next) => eventController.simulateEvent(req, res, next));

module.exports = router;
