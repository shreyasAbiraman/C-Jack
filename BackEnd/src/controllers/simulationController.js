const simulationService = require('../services/simulationService');
const ApiResponse = require('../utils/apiResponse');

class SimulationController {
  getStatus(req, res, next) {
    try {
      const data = simulationService.getSystemStatus();
      return ApiResponse.success(res, data, 'Full simulation state retrieved', 200, {
        isSimulated: true,
        simulationMode: true,
      });
    } catch (error) {
      next(error);
    }
  }

  simulateVitals(req, res, next) {
    try {
      const result = simulationService.generateSimulatedVitals(req.body);
      return ApiResponse.success(res, result.data, 'Simulated vital signs generated', 200, {
        isSimulated: true,
        simulation: true,
        dataSource: result.dataSource,
      });
    } catch (error) {
      next(error);
    }
  }

  simulateCPR(req, res, next) {
    try {
      const result = simulationService.generateSimulatedCPR(req.body);
      return ApiResponse.success(res, result.data, 'Simulated CPR state generated', 200, {
        isSimulated: true,
        simulation: true,
        dataSource: result.dataSource,
      });
    } catch (error) {
      next(error);
    }
  }

  simulateSensors(req, res, next) {
    try {
      const result = simulationService.generateSimulatedSensors(req.body);
      return ApiResponse.success(res, result.data, 'Simulated sensor status generated', 200, {
        isSimulated: true,
        simulation: true,
        dataSource: result.dataSource,
      });
    } catch (error) {
      next(error);
    }
  }

  simulateDevice(req, res, next) {
    try {
      const result = simulationService.generateSimulatedDevice(req.body);
      return ApiResponse.success(res, result.data, 'Simulated device status generated', 200, {
        isSimulated: true,
        simulation: true,
        dataSource: result.dataSource,
      });
    } catch (error) {
      next(error);
    }
  }

  simulateEmergency(req, res, next) {
    try {
      const result = simulationService.generateSimulatedEmergency(req.body);
      return ApiResponse.success(res, result.data, 'Simulated emergency event sequence generated', 200, {
        isSimulated: true,
        simulation: true,
        dataSource: result.dataSource,
        state: result.state,
      });
    } catch (error) {
      next(error);
    }
  }

  simulateGPS(req, res, next) {
    try {
      const result = simulationService.generateSimulatedGPS(req.body);
      return ApiResponse.success(res, result.data, 'Simulated GPS packet generated', 200, {
        isSimulated: true,
        simulation: true,
        dataSource: result.dataSource,
      });
    } catch (error) {
      next(error);
    }
  }

  resetSimulation(req, res, next) {
    try {
      const result = simulationService.triggerSimulatedEmergency('NORMAL');
      return ApiResponse.success(res, result, 'Simulation state reset to normal standby', 200, {
        isSimulated: true,
        simulation: true,
      });
    } catch (error) {
      next(error);
    }
  }

  applyScenario(req, res, next) {
    try {
      const { scenarioId } = req.body;
      if (!scenarioId) {
        return ApiResponse.badRequest(res, 'scenarioId is required (1–12)');
      }
      const result = simulationService.applyScenarioState(scenarioId);
      return ApiResponse.success(res, result.data, `Scenario ${scenarioId} applied`, 200, {
        isSimulated: true,
        simulation: true,
        scenarioId: result.scenarioId,
        dataSource: result.dataSource,
      });
    } catch (error) {
      next(error);
    }
  }

  setParameter(req, res, next) {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return ApiResponse.badRequest(res, 'key and value are required');
      }
      const result = simulationService.setParameter(key, value);
      return ApiResponse.success(res, result.data, `Parameter ${key} set to ${value}`, 200, {
        isSimulated: true,
        simulation: true,
        key: result.key,
        value: result.value,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SimulationController();
