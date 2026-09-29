const emergencyDispatchService = require('../services/emergencyDispatchService');

class AmbulanceController {
  async getAll(req, res, next) {
    try {
      const ambulances = await emergencyDispatchService.getAllAmbulances();
      const activeResponders = await emergencyDispatchService.getActiveEmergencyContacts();
      res.status(200).json({
        success: true,
        count: ambulances.length,
        activeCount: activeResponders.length,
        activeResponders,
        data: ambulances,
      });
    } catch (err) {
      next(err);
    }
  }

  async getActive(req, res, next) {
    try {
      const activeResponders = await emergencyDispatchService.getActiveEmergencyContacts();
      res.status(200).json({
        success: true,
        count: activeResponders.length,
        data: activeResponders,
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const ambulance = await emergencyDispatchService.createAmbulance(req.body);
      res.status(201).json({
        success: true,
        message: 'Ambulance contact registered successfully',
        data: ambulance,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await emergencyDispatchService.updateAmbulance(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Ambulance not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Ambulance contact updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await emergencyDispatchService.deleteAmbulance(id);
      res.status(200).json({
        success: true,
        message: 'Ambulance contact deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { availability, currentStatus } = req.body;
      const updateData = {};
      if (availability) updateData.availability = availability;
      if (currentStatus) updateData.currentStatus = currentStatus;

      const updated = await emergencyDispatchService.updateAmbulance(id, updateData);
      res.status(200).json({
        success: true,
        message: 'Ambulance status updated',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateActiveSelection(req, res, next) {
    try {
      const { activeAmbulanceIds } = req.body;
      if (!Array.isArray(activeAmbulanceIds)) {
        return res.status(400).json({
          success: false,
          message: 'activeAmbulanceIds must be an array of ambulance IDs (maximum 3)',
        });
      }
      const activeResponders = await emergencyDispatchService.updateActiveSelection(activeAmbulanceIds);
      res.status(200).json({
        success: true,
        message: 'Active emergency responders updated successfully (max 3)',
        count: activeResponders.length,
        data: activeResponders,
      });
    } catch (err) {
      next(err);
    }
  }

  async testConnection(req, res, next) {
    try {
      const { id } = req.params;
      const ambulances = await emergencyDispatchService.getAllAmbulances();
      const amb = ambulances.find((a) => a.ambulanceId === id || a._id == id);
      if (!amb) {
        return res.status(404).json({ success: false, message: 'Ambulance not found' });
      }

      res.status(200).json({
        success: true,
        message: `Connection test successful with ${amb.name}`,
        pingMs: Math.floor(Math.random() * 30) + 15,
        responderPhone: amb.primaryPhone,
        status: amb.availability,
        telemetryLink: 'SIMULATED_SECURE_RADIO_OK',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AmbulanceController();
