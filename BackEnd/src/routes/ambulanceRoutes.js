const express = require('express');
const router = express.Router();
const ambulanceController = require('../controllers/ambulanceController');

// GET /api/ambulances - Get all configured ambulances
router.get('/', (req, res, next) => ambulanceController.getAll(req, res, next));

// GET /api/ambulances/active - Get top 3 active emergency responders
router.get('/active', (req, res, next) => ambulanceController.getActive(req, res, next));

// POST /api/ambulances - Add new ambulance contact
router.post('/', (req, res, next) => ambulanceController.create(req, res, next));

// PUT /api/ambulances/active-selection - Update active 3 responders selection
router.put('/active-selection', (req, res, next) => ambulanceController.updateActiveSelection(req, res, next));

// POST /api/ambulances/:id/test-connection - Test simulated telemetry/call connection
router.post('/:id/test-connection', (req, res, next) => ambulanceController.testConnection(req, res, next));

// PUT /api/ambulances/:id/status - Update availability or current status
router.put('/:id/status', (req, res, next) => ambulanceController.updateStatus(req, res, next));

// PUT /api/ambulances/:id - Update ambulance details
router.put('/:id', (req, res, next) => ambulanceController.update(req, res, next));

// DELETE /api/ambulances/:id - Delete ambulance contact
router.delete('/:id', (req, res, next) => ambulanceController.delete(req, res, next));

module.exports = router;
