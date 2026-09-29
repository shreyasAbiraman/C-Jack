const { Patient } = require('../models');
const { isConnected } = require('../config/database');
const simulationService = require('./simulationService');

class PatientService {
  async getPatient(patientId = 'CJ-PATIENT-8829') {
    if (isConnected()) {
      const patient = await Patient.findOne({ patientId });
      if (patient) return patient;
    }
    // Return from simulation service memory
    return {
      patientId,
      ...simulationService.patient,
      isSimulated: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getAllPatients() {
    if (isConnected()) {
      const patients = await Patient.find();
      if (patients && patients.length > 0) return patients;
    }
    return [
      {
        patientId: 'CJ-PATIENT-8829',
        ...simulationService.patient,
        isSimulated: true,
      },
    ];
  }

  async updatePatient(patientId, updateData) {
    // Keep simulation service patient profile up to date
    simulationService.patient = {
      ...simulationService.patient,
      ...updateData,
    };

    if (isConnected()) {
      const updated = await Patient.findOneAndUpdate(
        { patientId },
        { $set: updateData },
        { new: true, upsert: true }
      );
      return updated;
    }

    return {
      patientId,
      ...simulationService.patient,
      isSimulated: true,
      updatedAt: new Date().toISOString(),
    };
  }

  async createPatient(patientData) {
    if (isConnected()) {
      return await Patient.create(patientData);
    }
    const created = {
      ...patientData,
      isSimulated: true,
      createdAt: new Date().toISOString(),
    };
    return created;
  }
}

module.exports = new PatientService();
