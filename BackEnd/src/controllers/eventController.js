const eventService = require('../services/eventService');
const ApiResponse = require('../utils/apiResponse');

class EventController {
  async getEvents(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
      const { category, severity, deviceId } = req.query;
      const events = await eventService.getEvents(limit, { category, severity, deviceId });
      return ApiResponse.success(res, events, 'Device events log retrieved');
    } catch (error) {
      next(error);
    }
  }

  async recordEvent(req, res, next) {
    try {
      const { message } = req.body;
      if (!message) {
        return ApiResponse.badRequest(res, 'Event message is required');
      }
      const recorded = await eventService.recordEvent(req.body);
      return ApiResponse.created(res, recorded, 'Device event logged successfully');
    } catch (error) {
      next(error);
    }
  }

  simulateEvent(req, res, next) {
    try {
      const simulated = eventService.simulateEvent(req.body);
      return ApiResponse.success(res, simulated, 'Simulated device event generated');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventController();
