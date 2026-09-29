const responderService = require('../services/responderService');
const ApiResponse = require('../utils/apiResponse');

class ResponderController {
  async getAllResponders(req, res, next) {
    try {
      const responders = await responderService.getAllResponders();
      return ApiResponse.success(res, responders, 'Active emergency responders retrieved');
    } catch (error) {
      next(error);
    }
  }

  getStatus(req, res, next) {
    try {
      const status = responderService.getStatus();
      return res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }

  transitionState(req, res, next) {
    try {
      const { state } = req.body;
      if (!state) {
        return ApiResponse.badRequest(res, 'State is required');
      }
      const result = responderService.transitionState(state);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  getHandover(req, res, next) {
    try {
      const packet = responderService.getHandoverPacket();
      return res.status(200).json(packet);
    } catch (error) {
      next(error);
    }
  }

  exportHandover(req, res, next) {
    try {
      const exported = responderService.exportSessionSummary();
      return res.status(200).json(exported);
    } catch (error) {
      next(error);
    }
  }

  async createResponder(req, res, next) {
    try {
      const { callsign, name } = req.body;
      if (!callsign || !name) {
        return ApiResponse.badRequest(res, 'Callsign and name are required');
      }
      const created = await responderService.createResponder(req.body);
      return ApiResponse.created(res, created, 'Responder registered successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResponderController();
