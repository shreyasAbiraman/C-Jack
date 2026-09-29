import apiClient from './apiClient';

/**
 * Device Subsystem & Health Management Service
 * Manages vest hardware overview, 7-channel sensor diagnostics, operating modes, and maintenance self-tests.
 */
class DeviceService {
  async getDeviceOverview() {
    const res = await apiClient.get('/api/devices/overview');
    return res.data || res;
  }

  async getSensors() {
    const res = await apiClient.get('/api/devices/sensors');
    return res.data || res;
  }

  async getModes() {
    const res = await apiClient.get('/api/devices/modes');
    return res.data || res;
  }

  async setMode(mode) {
    const res = await apiClient.post('/api/devices/mode', { mode });
    return res.data || res;
  }

  async getMaintenance() {
    const res = await apiClient.get('/api/devices/maintenance');
    return res.data || res;
  }

  async runSelfTest() {
    const res = await apiClient.post('/api/devices/maintenance/self-test');
    return res.data || res;
  }

  async simulateStatus(params = {}) {
    const res = await apiClient.post('/api/devices/simulate-status', params);
    return res.data || res;
  }
}

export const deviceService = new DeviceService();
export default deviceService;
