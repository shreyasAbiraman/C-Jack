const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// GET /api/patients or /api/patient - Retrieve current patient profile
router.get('/', (req, res, next) => patientController.getPatient(req, res, next));

// GET /api/patients/all - Retrieve all registered patient profiles
router.get('/all', (req, res, next) => patientController.getAllPatients(req, res, next));

// GET /api/patients/:id - Retrieve specific patient by ID
router.get('/:id', (req, res, next) => patientController.getPatient(req, res, next));

// PUT /api/patients or /api/patient - Update patient profile
router.put('/', (req, res, next) => patientController.updatePatient(req, res, next));

// PUT /api/patients/:id - Update specific patient
router.put('/:id', (req, res, next) => patientController.updatePatient(req, res, next));

// POST /api/patients - Register new patient profile
router.post('/', (req, res, next) => patientController.createPatient(req, res, next));

module.exports = router;
