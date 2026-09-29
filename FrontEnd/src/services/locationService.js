import apiClient from './apiClient';

/**
 * Location & GNSS Telemetry Service
 * Manages GPS coordinates, accuracy, waypoint history, and routing data.
 */
class LocationService {
  async getLocation() {
    const res = await apiClient.get('/api/location');
    return res.data || res;
  }

  async getHistory(limit = 20) {
    const res = await apiClient.get(`/api/location/history?limit=${limit}`);
    return res.data || res;
  }

  async updateLocation(locationData) {
    const res = await apiClient.post('/api/location', locationData);
    return res.data || res;
  }

  async simulateGpsPacket(params = {}) {
    const res = await apiClient.post('/api/location/simulate-packet', params);
    return res.data || res;
  }
}

export const locationService = new LocationService();
export default locationService;
