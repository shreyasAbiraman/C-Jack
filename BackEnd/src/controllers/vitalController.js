const vitalService = require('../services/vitalService');
const ApiResponse = require('../utils/apiResponse');

class VitalController {
  getLiveVitals(req, res, next) {
    try {
      const data = vitalService.getCurrentVitals();
      return ApiResponse.success(res, data.vitals, 'Current physiological vitals', 200, {
        isSimulated: data.vitals?.isSimulated || true,
        simulationMode: data.simulationMode,
        dataSource: data.dataSource,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const range = req.query.range || '5m';
      const result = await vitalService.getHistory(range);
      return res.status(200).json({
        success: true,
        range: result.range,
        dataSource: result.dataSource,
        count: result.count,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  async recordVital(req, res, next) {
    try {
      const { heartRate, spo2 } = req.body;
      if (heartRate === undefined || spo2 === undefined) {
        return ApiResponse.badRequest(res, 'heartRate and spo2 are required');
      }

      const recorded = await vitalService.recordVital(req.body);
      return ApiResponse.created(res, recorded, 'Vital reading recorded');
    } catch (error) {
      next(error);
    }
  }

  simulateVitals(req, res, next) {
    try {
      const simulated = vitalService.simulateVitals(req.body);
      return ApiResponse.success(res, simulated, 'Simulated vital reading generated');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VitalController();
