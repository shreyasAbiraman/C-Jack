import apiClient from './apiClient';

/**
 * Responder & ALS Ambulance Dispatch Service
 * Coordinates ambulance units, status transitions, clinical handover packets, and session summary audit exports.
 */
class ResponderService {
  async getResponders() {
    const res = await apiClient.get('/api/responders');
    return res.data || res;
  }

  async getResponderStatus() {
    const res = await apiClient.get('/api/responders/status');
    return res.data || res;
  }

  async setResponderState(state) {
    const res = await apiClient.post('/api/responders/state', { state });
    return res.data || res;
  }

  async getHandoverData() {
    const res = await apiClient.get('/api/responders/handover');
    return res.data || res;
  }

  async exportSessionSummary() {
    const res = await apiClient.post('/api/responders/handover/export');
    return res.data || res;
  }
}

export const responderService = new ResponderService();
export default responderService;
