import apiClient from './apiClient';

/**
 * Vital Signs Telemetry Service
 * Handles live vitals, historical trend series, and simulation triggers.
 */
class VitalService {
  async getLiveVitals() {
    const res = await apiClient.get('/api/vitals');
    return res.data || res;
  }

  async getVitalsHistory(range = '5m') {
    const res = await apiClient.get(`/api/vitals/history?range=${range}`);
    return res.data || res;
  }

  async recordVital(vitalData) {
    const res = await apiClient.post('/api/vitals', vitalData);
    return res.data || res;
  }

  async simulateVitals(params = {}) {
    const res = await apiClient.post('/api/vitals/simulate', params);
    return res.data || res;
  }
}

export const vitalService = new VitalService();
export default vitalService;
