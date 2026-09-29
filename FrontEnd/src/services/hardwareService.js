/**
 * CJack Hardware Service (Frontend Abstraction Layer)
 * 
 * Provides an isolated client-side API abstraction over the CJack Hardware Manager.
 * UI components interact strictly with this service and never touch raw hardware protocols.
 */

import apiClient from './apiClient';

export const HardwareState = Object.freeze({
  SIMULATED: 'SIMULATED',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  FAULT: 'FAULT',
  UNKNOWN: 'UNKNOWN'
});

export const hardwareService = {
  /**
   * Get full hardware status for all 11 interfaces + overall state
   */
  async getStatus() {
    try {
      const response = await apiClient.get('/api/hardware/status');
      return response.data;
    } catch (error) {
      console.warn('[HardwareService] Fallback to offline hardware state:', error.message);
      return {
        overallState: HardwareState.UNKNOWN,
        isPhysicalConnected: false,
        isSimulated: false,
        isDisconnected: true,
        modules: []
      };
    }
  },

  /**
   * Get formal JSON Data Contract schema and firmware documentation
   */
  async getContract() {
    const response = await apiClient.get('/api/hardware/contract');
    return response;
  },

  /**
   * Dispatch a hardware control command (CPR Motor, Speaker/Metronome, Display)
   */
  async sendCommand(target, action, payload = {}) {
    const response = await apiClient.post('/api/hardware/command', {
      target,
      action,
      payload
    });
    return response.data;
  },

  /**
   * Set hardware operating mode: 'SIMULATION' or 'PHYSICAL'
   */
  async setOperatingMode(mode) {
    const response = await apiClient.post('/api/hardware/mode', { mode });
    return response.data;
  },

  /**
   * Simulate a packet injection for development / verification testing
   */
  async simulatePacket(options = {}) {
    const response = await apiClient.post('/api/hardware/simulate-packet', options);
    return response.data;
  }
};

export default hardwareService;
