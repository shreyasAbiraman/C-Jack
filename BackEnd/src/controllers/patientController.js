const patientService = require('../services/patientService');
const ApiResponse = require('../utils/apiResponse');

const VALID_BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
  'A Positive', 'A Negative', 'B Positive', 'B Negative',
  'AB Positive', 'AB Negative', 'O Positive', 'O Negative',
];

class PatientController {
  async getPatient(req, res, next) {
    try {
      const patientId = req.params.id || req.query.patientId || 'CJ-PATIENT-8829';
      const patient = await patientService.getPatient(patientId);
      return ApiResponse.success(res, patient, 'Patient profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAllPatients(req, res, next) {
    try {
      const patients = await patientService.getAllPatients();
      return ApiResponse.success(res, patients, 'Patients list retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updatePatient(req, res, next) {
    try {
      const patientId = req.params.id || 'CJ-PATIENT-8829';
      const { name, age, gender, bloodGroup, emergencyContact, allergies, medicalNotes } = req.body;

      const errors = {};

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.name = 'Patient name is required (minimum 2 characters)';
      }

      const parsedAge = Number(age);
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
        errors.age = 'Valid age between 0 and 130 is required';
      }

      if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
        errors.gender = 'Valid gender (Male, Female, Other) is required';
      }

      if (!bloodGroup || !VALID_BLOOD_GROUPS.includes(bloodGroup.trim())) {
        errors.bloodGroup = 'Valid blood group required (e.g., O+, A+, B+, AB-)';
      }

      if (!emergencyContact || !emergencyContact.name || emergencyContact.name.trim().length < 2) {
        errors.emergencyContactName = 'Emergency contact name is required';
      }

      if (!emergencyContact || !emergencyContact.phone || !/^\+?[0-9\s\-()]{7,20}$/.test(emergencyContact.phone.trim())) {
        errors.emergencyContactPhone = 'Valid emergency contact phone number is required (7-20 digits)';
      }

      if (Object.keys(errors).length > 0) {
        return ApiResponse.badRequest(res, 'Validation failed for patient profile', errors);
      }

      const updated = await patientService.updatePatient(patientId, {
        name: name.trim(),
        age: parsedAge,
        gender,
        bloodGroup: bloodGroup.trim(),
        emergencyContact: {
          name: emergencyContact.name.trim(),
          phone: emergencyContact.phone.trim(),
          relationship: emergencyContact.relationship || 'Emergency Contact',
          provenance: 'REAL',
        },
        allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []),
        allergiesProvenance: 'REAL',
        medicalNotes: medicalNotes ? medicalNotes.trim() : '',
        medicalNotesProvenance: 'REAL',
        demographicsProvenance: 'REAL',
      });

      return ApiResponse.success(res, updated, 'Patient profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async createPatient(req, res, next) {
    try {
      const { name, age, gender, bloodGroup, emergencyContact } = req.body;
      if (!name || !age || !gender || !bloodGroup) {
        return ApiResponse.badRequest(res, 'Name, age, gender, and bloodGroup are required');
      }

      const newPatient = await patientService.createPatient({
        patientId: req.body.patientId || `CJ-PATIENT-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        age,
        gender,
        bloodGroup,
        emergencyContact: emergencyContact || { name: 'Emergency Contact', phone: '+91 0000000000' },
        allergies: req.body.allergies || [],
        medicalNotes: req.body.medicalNotes || '',
      });

      return ApiResponse.created(res, newPatient, 'Patient profile created successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PatientController();
