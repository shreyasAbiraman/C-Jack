import apiClient from './apiClient';

/**
 * Communication & Connectivity Service
 * Manages LoRaWAN, Cellular/4G, GNSS gateway telemetry, packet buffers, and offline queue simulations.
 */
class CommunicationService {
  async getStatus() {
    const res = await apiClient.get('/api/communication/status');
    return res.data || res;
  }

  async sendPacket(packet) {
    const res = await apiClient.post('/api/communication/packet', packet);
    return res.data || res;
  }

  async getPackets(limit = 20) {
    const res = await apiClient.get(`/api/communication/packets?limit=${limit}`);
    return res.data || res;
  }

  async simulateOfflineQueue(action = 'NEXT_STEP') {
    const res = await apiClient.post('/api/communication/offline-queue/simulate', { action });
    return res.data || res;
  }

  async setNetworkStates(states) {
    const res = await apiClient.post('/api/communication/network-state', states);
    return res.data || res;
  }

  async simulatePacket(params = {}) {
    const res = await apiClient.post('/api/communication/simulate-packet', params);
    return res.data || res;
  }
}

export const communicationService = new CommunicationService();
export default communicationService;
