const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// GET /api/emergencies/status or /api/emergencies
router.get('/status', (req, res, next) => emergencyController.getStatus(req, res, next));
router.get('/', (req, res, next) => emergencyController.getStatus(req, res, next));

// Emergency Call & Ambulance Dispatch Endpoints
// Note: Place specific route paths before /:id routes
router.get('/active', (req, res, next) => emergencyController.getActiveEmergencyCall(req, res, next));
// SOS Trigger from Physical ESP32 Hardware or Web UI
router.post('/sos', (req, res, next) => emergencyController.triggerSos(req, res, next));
router.post('/dispatch', (req, res, next) => emergencyController.createDispatch(req, res, next));
router.post('/', (req, res, next) => emergencyController.createDispatch(req, res, next));

// Actions on a specific emergency ID
router.post('/:id/accept', (req, res, next) => emergencyController.acceptDispatch(req, res, next));
router.post('/:id/reject', (req, res, next) => emergencyController.rejectDispatch(req, res, next));
router.post('/:id/cancel', (req, res, next) => emergencyController.cancelDispatch(req, res, next));
router.post('/:id/progress', (req, res, next) => emergencyController.progressAssignment(req, res, next));
router.get('/:id/status', (req, res, next) => emergencyController.getActiveEmergencyCall(req, res, next));
router.get('/:id', (req, res, next) => emergencyController.getActiveEmergencyCall(req, res, next));

// Existing Clinical Resuscitation Controls
router.post('/alert-state', (req, res, next) => emergencyController.transitionAlertState(req, res, next));
router.post('/advance-flow', (req, res, next) => emergencyController.advanceFlow(req, res, next));
router.post('/trigger', (req, res, next) => emergencyController.trigger(req, res, next));
router.post('/reset', (req, res, next) => emergencyController.reset(req, res, next));
router.get('/timeline', (req, res, next) => emergencyController.getTimeline(req, res, next));
router.post('/contact/notify', (req, res, next) => emergencyController.notifyContact(req, res, next));
router.post('/simulate-event', (req, res, next) => emergencyController.simulateEmergency(req, res, next));

module.exports = router;
