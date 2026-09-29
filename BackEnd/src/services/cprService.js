const { CPRSession } = require('../models');
const { isConnected } = require('../config/database');
const cprStateMachineService = require('./cprStateMachineService');

class CPRService {
  getState() {
    return cprStateMachineService.getState();
  }

  async transitionTo(targetState, metadata = {}) {
    const state = cprStateMachineService.transitionTo(targetState, metadata);

    if (isConnected() && targetState === 'ACTIVE') {
      CPRSession.create({
        status: 'ACTIVE',
        mode: state.mode || 'Automated Pneumatic Vest (Closed-Loop)',
        totalCompressions: state.metrics?.totalCompressions || 0,
        currentRate: state.metrics?.compressionRate || 108,
        currentDepthMm: state.metrics?.currentDepthMm || 52,
        isSimulated: true,
      }).catch((e) => console.error('CPRSession save error:', e.message));
    }

    return state;
  }

  emergencyStop() {
    return cprStateMachineService.emergencyStop();
  }

  updateSimulator(params) {
    return cprStateMachineService.updateSimulator(params);
  }

  getAnalytics() {
    return cprStateMachineService.getAnalytics();
  }

  resetSession() {
    return cprStateMachineService.resetSession();
  }

  simulateCPRState(params = {}) {
    const updated = cprStateMachineService.updateSimulator({
      active: params.active !== undefined ? params.active : true,
      compressionRate: params.rate || 108,
      currentDepthMm: params.depth || 52,
      appliedForceNewtons: params.force || 410,
      chestRecoilPercentage: params.recoil || 96,
      motorState: params.active ? 'Active Closed-Loop Pulsing' : 'Standby',
    });

    return {
      ...updated,
      isSimulated: true,
      simulatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new CPRService();
