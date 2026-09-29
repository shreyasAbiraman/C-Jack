import apiClient from './apiClient';

/**
 * CPR & Resuscitation Subsystem Service
 * Manages CPR closed-loop state transitions, emergency-stop cutoff, simulator configs, and session analytics.
 */
class CprService {
  async getCprState() {
    const res = await apiClient.get('/api/cpr/state');
    return res.data || res;
  }

  async transitionCprState(targetState, metadata = {}) {
    const res = await apiClient.post('/api/cpr/transition', { targetState, metadata });
    return res.data || res;
  }

  async emergencyStop() {
    const res = await apiClient.post('/api/cpr/emergency-stop');
    return res.data || res;
  }

  async updateSimulator(config) {
    const res = await apiClient.post('/api/cpr/simulator', config);
    return res.data || res;
  }

  async getAnalytics() {
    const res = await apiClient.get('/api/cpr/analytics');
    return res.data || res;
  }

  async resetSession() {
    const res = await apiClient.post('/api/cpr/reset');
    return res.data || res;
  }

  async simulateCpr(params = {}) {
    const res = await apiClient.post('/api/cpr/simulate', params);
    return res.data || res;
  }
}

export const cprService = new CprService();
export default cprService;
