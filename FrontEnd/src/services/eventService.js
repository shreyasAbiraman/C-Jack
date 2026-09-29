import apiClient from './apiClient';

/**
 * Device Event & Telemetry Logs Service
 * Manages chronological event records, system errors, and audit events.
 */
class EventService {
  async getEvents(limit = 25, options = {}) {
    const params = { limit, ...options };
    const res = await apiClient.get('/api/events', { params });
    return res.data || res;
  }

  async recordEvent(eventData) {
    const res = await apiClient.post('/api/events', eventData);
    return res.data || res;
  }

  async simulateEvent(params = {}) {
    const res = await apiClient.post('/api/events/simulate', params);
    return res.data || res;
  }
}

export const eventService = new EventService();
export default eventService;
