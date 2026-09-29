import apiClient from './apiClient';

/**
 * Emergency Response & Workflow Service
 * Coordinates cardiac arrest alerts, workflow stages, dispatcher notification, and audit timeline.
 */
class EmergencyService {
  async getEmergencyStatus() {
    const res = await apiClient.get('/api/emergencies/status');
    return res.data || res;
  }

  async transitionAlertState(targetState) {
    const res = await apiClient.post('/api/emergencies/alert-state', { targetState });
    return res.data || res;
  }

  async advanceFlowStage(stageIndexOrKey) {
    const payload = typeof stageIndexOrKey === 'number' 
      ? { stageIndex: stageIndexOrKey } 
      : { stageKey: stageIndexOrKey };
    const res = await apiClient.post('/api/emergencies/advance-flow', payload);
    return res.data || res;
  }

  async triggerEmergency() {
    const res = await apiClient.post('/api/emergencies/trigger');
    return res.data || res;
  }

  async resetEmergency() {
    const res = await apiClient.post('/api/emergencies/reset');
    return res.data || res;
  }

  async getTimeline() {
    const res = await apiClient.get('/api/emergencies/timeline');
    return res.data || res;
  }

  async notifyContact(options = {}) {
    const res = await apiClient.post('/api/emergencies/contact/notify', options);
    return res.data || res;
  }

  async simulateEmergencyEvent(eventData = {}) {
    const res = await apiClient.post('/api/emergencies/simulate-event', eventData);
    return res.data || res;
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
