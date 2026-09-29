import apiClient from './apiClient';

/**
 * Patient Service
 * Handles patient demographics, clinical records, and contact information.
 */
class PatientService {
  async getPatient(patientId = 'CJ-PATIENT-8829') {
    const res = await apiClient.get('/api/patients', { params: { patientId } });
    return res.data || res;
  }

  async getAllPatients() {
    const res = await apiClient.get('/api/patients/all');
    return res.data || res;
  }

  async updatePatient(patientData) {
    const res = await apiClient.put('/api/patients', patientData);
    return res.data || res;
  }

  async createPatient(patientData) {
    const res = await apiClient.post('/api/patients', patientData);
    return res.data || res;
  }
}

export const patientService = new PatientService();
export default patientService;
