const express = require('express');
const router = express.Router();
const responderController = require('../controllers/responderController');

// GET /api/responders or /api/responder - Responder units list
router.get('/', (req, res, next) => responderController.getAllResponders(req, res, next));

// GET /api/responders/status or /api/responder/status - Responder status & telemetry
router.get('/status', (req, res, next) => responderController.getStatus(req, res, next));

// POST /api/responders/state or /api/responder/state - State machine transition
router.post('/state', (req, res, next) => responderController.transitionState(req, res, next));

// GET /api/responders/handover or /api/responder/handover - Clinical handover packet
router.get('/handover', (req, res, next) => responderController.getHandover(req, res, next));

// POST /api/responders/handover/export or /api/responder/handover/export - Export session summary
router.post('/handover/export', (req, res, next) => responderController.exportHandover(req, res, next));

// POST /api/responders - Register a new responder unit
router.post('/', (req, res, next) => responderController.createResponder(req, res, next));

module.exports = router;
