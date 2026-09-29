const { Emergency } = require('../models');
const { isConnected } = require('../config/database');
const emergencyResponseService = require('./emergencyResponseService');
const emergencyDispatchService = require('./emergencyDispatchService');

class EmergencyService {
  getStatus() {
    return emergencyResponseService.getStatus();
  }

  transitionAlertState(targetState) {
    return emergencyResponseService.transitionAlertState(targetState);
  }

  advanceFlowStage(target) {
    return emergencyResponseService.advanceFlowStage(target);
  }

  async triggerCardiacArrestEmergency() {
    const result = emergencyResponseService.triggerCardiacArrestEmergency();

    if (isConnected()) {
      Emergency.create({
        status: 'CARDIAC ARREST SUSPECTED',
        alertLevel: 'CRITICAL',
        cardiacArrestDetected: true,
        flowStage: 1,
        timeline: result.timeline || [],
        isSimulated: true,
      }).catch((e) => console.error('Emergency save error:', e.message));
    }

    return result;
  }

  async resetEmergency() {
    emergencyDispatchService.resetEmergency().catch(() => null);
    return emergencyResponseService.resetEmergency();
  }

  getTimeline() {
    const status = emergencyResponseService.getStatus();
    return status.timeline || [];
  }

  notifyEmergencyContact(options) {
    return emergencyResponseService.notifyEmergencyContact(options);
  }

  simulateEmergencyEvent(eventData = {}) {
    const state = eventData.state || 'CARDIAC ARREST SUSPECTED';
    let result;
    if (state === 'NORMAL') {
      result = emergencyResponseService.resetEmergency();
    } else {
      result = emergencyResponseService.triggerCardiacArrestEmergency();
      if (eventData.stageIndex !== undefined) {
        result = emergencyResponseService.advanceFlowStage(eventData.stageIndex);
      }
    }

    return {
      ...result,
      isSimulated: true,
      simulationEvent: eventData,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new EmergencyService();
