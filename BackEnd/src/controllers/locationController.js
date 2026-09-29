const locationService = require('../services/locationService');
const ApiResponse = require('../utils/apiResponse');

class LocationController {
  getLocation(req, res, next) {
    try {
      const data = locationService.getLocation();
      return ApiResponse.success(res, data.location, 'Current GNSS / GPS telemetry', 200, {
        dataSource: data.dataSource,
        simulationMode: data.simulationMode,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const history = await locationService.getHistory(limit);
      return ApiResponse.success(res, history, 'Location history points');
    } catch (error) {
      next(error);
    }
  }

  async updateLocation(req, res, next) {
    try {
      const { latitude, longitude } = req.body;
      if (latitude === undefined || longitude === undefined) {
        return ApiResponse.badRequest(res, 'latitude and longitude are required');
      }

      const updated = await locationService.updateLocation(req.body);
      return ApiResponse.success(res, updated, 'Location updated successfully');
    } catch (error) {
      next(error);
    }
  }

  simulateGPS(req, res, next) {
    try {
      const packet = locationService.simulateGPSPacket(req.body);
      return ApiResponse.success(res, packet, 'Simulated GPS packet generated');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LocationController();
