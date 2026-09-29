import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const emergencyDispatchApi = {
  // --- AMBULANCE CONTACTS ---
  getAllAmbulances: () => api.get('/ambulances'),
  getActiveResponders: () => api.get('/ambulances/active'),
  createAmbulance: (data) => api.post('/ambulances', data),
  updateAmbulance: (id, data) => api.put(`/ambulances/${id}`, data),
  deleteAmbulance: (id) => api.delete(`/ambulances/${id}`),
  updateAmbulanceStatus: (id, statusData) => api.put(`/ambulances/${id}/status`, statusData),
  updateActiveSelection: (ambulanceIds) => api.put('/ambulances/active-selection', { activeAmbulanceIds: ambulanceIds }),
  testConnection: (id) => api.post(`/ambulances/${id}/test-connection`),

  // --- EMERGENCY DISPATCH ---
  createDispatch: (callData) => api.post('/emergencies/dispatch', callData),
  getActiveEmergency: () => api.get('/emergencies/active'),
  acceptDispatch: (emergencyId, ambulanceId) => api.post(`/emergencies/${emergencyId}/accept`, { ambulanceId }),
  rejectDispatch: (emergencyId, ambulanceId, reason) => api.post(`/emergencies/${emergencyId}/reject`, { ambulanceId, reason }),
  cancelDispatch: (emergencyId, reason) => api.post(`/emergencies/${emergencyId}/cancel`, { reason }),
  progressAssignment: (emergencyId, status) => api.post(`/emergencies/${emergencyId}/progress`, { status }),
  getEmergencyHistory: () => api.get('/emergencies/history'),
  getEmergencyStatus: (emergencyId) => api.get(`/emergencies/${emergencyId}/status`),
};

export default emergencyDispatchApi;
