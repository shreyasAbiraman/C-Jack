const communicationService = require('../services/communicationService');
const ApiResponse = require('../utils/apiResponse');

class CommunicationController {
  getStatus(req, res, next) {
    try {
      const status = communicationService.getStatus();
      return res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }

  async ingestPacket(req, res, next) {
    try {
      const result = await communicationService.ingestPacket(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPackets(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const packets = await communicationService.getPackets(limit);
      return res.status(200).json(packets);
    } catch (error) {
      next(error);
    }
  }

  simulateOfflineQueue(req, res, next) {
    try {
      const action = req.body.action || 'NEXT_STEP';
      const updated = communicationService.simulateOfflineQueue(action);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  setNetworkState(req, res, next) {
    try {
      const updated = communicationService.setNetworkStates(req.body);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  simulatePacket(req, res, next) {
    try {
      const packet = communicationService.simulatePacket(req.body);
      return ApiResponse.success(res, packet, 'Simulated communication packet ingested');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommunicationController();
