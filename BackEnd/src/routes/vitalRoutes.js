const express = require('express');
const router = express.Router();
const vitalController = require('../controllers/vitalController');

// GET /api/vitals - Retrieve latest live physiological vitals
router.get('/', (req, res, next) => vitalController.getLiveVitals(req, res, next));

// GET /api/vitals/history - Retrieve historical vital series (?range=1m|5m|15m|session)
router.get('/history', (req, res, next) => vitalController.getHistory(req, res, next));

// POST /api/vitals - Ingest new vital measurement
router.post('/', (req, res, next) => vitalController.recordVital(req, res, next));

// POST /api/vitals/simulate - Generate simulated vitals reading
router.post('/simulate', (req, res, next) => vitalController.simulateVitals(req, res, next));

module.exports = router;
