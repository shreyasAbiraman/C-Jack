const cprService = require('../services/cprService');
const ApiResponse = require('../utils/apiResponse');

class CPRController {
  getState(req, res, next) {
    try {
      const state = cprService.getState();
      return ApiResponse.success(res, state, 'CPR state retrieved');
    } catch (error) {
      next(error);
    }
  }

  async transition(req, res, next) {
    try {
      const { targetState, metadata } = req.body;
      if (!targetState) {
        return ApiResponse.badRequest(res, 'targetState is required for state transition.');
      }
      const state = await cprService.transitionTo(targetState, metadata);
      return ApiResponse.success(res, state, `Successfully transitioned CPR state to ${targetState}`);
    } catch (error) {
      next(error);
    }
  }

  emergencyStop(req, res, next) {
    try {
      const state = cprService.emergencyStop();
      return ApiResponse.success(
        res,
        state,
        'EMERGENCY STOP EXECUTED. Actuators disengaged and vented.'
      );
    } catch (error) {
      next(error);
    }
  }

  updateSimulator(req, res, next) {
    try {
      const updatedState = cprService.updateSimulator(req.body);
      return ApiResponse.success(res, updatedState, 'CPR simulation parameters updated.');
    } catch (error) {
      next(error);
    }
  }

  getAnalytics(req, res, next) {
    try {
      const analytics = cprService.getAnalytics();
      return ApiResponse.success(res, analytics, 'CPR session analytics retrieved');
    } catch (error) {
      next(error);
    }
  }

  reset(req, res, next) {
    try {
      const state = cprService.resetSession();
      return ApiResponse.success(res, state, 'CPR session reset to zero counters.');
    } catch (error) {
      next(error);
    }
  }

  simulateCPR(req, res, next) {
    try {
      const simulated = cprService.simulateCPRState(req.body);
      return ApiResponse.success(res, simulated, 'Simulated CPR state updated');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CPRController();
