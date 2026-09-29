const emergencyService = require('../services/emergencyService');
const emergencyDispatchService = require('../services/emergencyDispatchService');
const ApiResponse = require('../utils/apiResponse');

class EmergencyController {
  getStatus(req, res, next) {
    try {
      const status = emergencyService.getStatus();
      return res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }

  transitionAlertState(req, res, next) {
    try {
      const { targetState } = req.body;
      if (!targetState) {
        return ApiResponse.badRequest(res, 'targetState is required');
      }
      const updated = emergencyService.transitionAlertState(targetState);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  advanceFlow(req, res, next) {
    try {
      const { stageIndex, stageKey } = req.body;
      const target = stageIndex !== undefined ? stageIndex : stageKey;
      const updated = emergencyService.advanceFlowStage(target);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async trigger(req, res, next) {
    try {
      const updated = await emergencyService.triggerCardiacArrestEmergency();
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async reset(req, res, next) {
    try {
      const updated = await emergencyService.resetEmergency();
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  getTimeline(req, res, next) {
    try {
      const timeline = emergencyService.getTimeline();
      return ApiResponse.success(res, timeline, 'Emergency timeline retrieved');
    } catch (error) {
      next(error);
    }
  }

  notifyContact(req, res, next) {
    try {
      const result = emergencyService.notifyEmergencyContact(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  simulateEmergency(req, res, next) {
    try {
      const result = emergencyService.simulateEmergencyEvent(req.body);
      return ApiResponse.success(res, result, 'Simulated emergency event triggered');
    } catch (error) {
      next(error);
    }
  }

  // ========================================================
  // EMERGENCY SOS TRIGGER & VOICE CALL DISPATCH
  // ========================================================
  async triggerSos(req, res, next) {
    try {
      const { deviceId = 'CJACK-001', heartRate, spo2, latitude, longitude, reason = 'MANUAL_SOS', timestamp, eventId } = req.body;
      
      const sosData = {
        deviceId,
        heartRate: (typeof heartRate === 'number' && heartRate > 0) ? heartRate : null,
        spo2: (typeof spo2 === 'number' && spo2 > 0) ? spo2 : null,
        latitude: latitude || 11.0168,
        longitude: longitude || 76.9558,
        reason,
        timestamp: timestamp || new Date().toISOString(),
        eventId: eventId || `SOS-${deviceId}-${Date.now().toString(36).toUpperCase()}`,
      };

      const result = await emergencyDispatchService.handleSosTrigger(sosData);
      return res.status(200).json({
        success: true,
        eventId: sosData.eventId,
        callStatus: result.callStatus || 'initiated',
        isDuplicate: result.isDuplicate || false,
        message: result.message || 'Emergency SOS received and voice dispatch initiated',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================================
  // EMERGENCY CALL & AMBULANCE DISPATCH ENDPOINTS
  // ========================================================

  async createDispatch(req, res, next) {
    try {
      const result = await emergencyDispatchService.createAndDispatchEmergency(req.body);
      if (result.isDuplicate) {
        return res.status(409).json({
          success: false,
          code: 'DUPLICATE_ACTIVE_EMERGENCY',
          message: result.message,
          data: result.activeEmergency,
        });
      }
      return res.status(201).json({
        success: true,
        message: 'Emergency call initiated and dispatched to active ambulances',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveEmergencyCall(req, res, next) {
    try {
      const active = await emergencyDispatchService.getActiveEmergency();
      return res.status(200).json({
        success: true,
        hasActiveEmergency: Boolean(active),
        data: active,
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptDispatch(req, res, next) {
    try {
      const { id } = req.params;
      const { ambulanceId } = req.body;
      if (!ambulanceId) {
        return res.status(400).json({
          success: false,
          message: 'ambulanceId is required to accept emergency',
        });
      }

      const result = await emergencyDispatchService.acceptEmergency(id, ambulanceId);
      if (!result.success) {
        const statusCode = result.code === 'ALREADY_ASSIGNED' ? 409 : 400;
        return res.status(statusCode).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async rejectDispatch(req, res, next) {
    try {
      const { id } = req.params;
      const { ambulanceId, reason } = req.body;
      const result = await emergencyDispatchService.rejectEmergency(id, ambulanceId, reason);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async cancelDispatch(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await emergencyDispatchService.cancelEmergency(id, reason);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async progressAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'status is required' });
      }
      const result = await emergencyDispatchService.progressAssignmentStatus(id, status);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await emergencyDispatchService.getEmergencyHistory();
      return res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmergencyController();
