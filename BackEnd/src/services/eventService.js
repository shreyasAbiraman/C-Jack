const { DeviceEvent } = require('../models');
const { isConnected } = require('../config/database');
const deviceManagementService = require('./deviceManagementService');

class EventService {
  async getEvents(limit = 25, options = {}) {
    if (isConnected()) {
      const query = {};
      if (options.category) query.category = options.category;
      if (options.severity) query.severity = options.severity;
      if (options.deviceId) query.deviceId = options.deviceId;

      const events = await DeviceEvent.find(query).sort({ timestamp: -1 }).limit(limit);
      if (events && events.length > 0) {
        return events;
      }
    }

    // Return in-memory device events from deviceManagementService
    const res = deviceManagementService.getEvents(limit);
    return res.data || [];
  }

  async recordEvent(eventData) {
    const message = eventData.message || eventData.description || eventData.title || 'Device notification';
    const newEvent = deviceManagementService.addEvent({
      ...eventData,
      description: message,
      title: eventData.title || message,
    });

    if (isConnected()) {
      try {
        await DeviceEvent.create({
          eventId: newEvent.id,
          deviceId: eventData.deviceId || 'CJACK-UNIT-TX104',
          eventType: eventData.eventType || 'INFO',
          category: eventData.category || 'SYSTEM',
          message,
          severity: eventData.severity || 'low',
          rawPayload: eventData.rawPayload || {},
          isSimulated: eventData.isSimulated !== undefined ? eventData.isSimulated : true,
          timestamp: newEvent.timestamp || new Date(),
        });
      } catch (err) {
        console.error('DeviceEvent save error:', err.message);
      }
    }

    return {
      ...newEvent,
      message,
    };
  }

  simulateEvent(custom = {}) {
    const categories = ['POWER', 'LORA', 'GPS', 'SENSORS', 'ACTUATOR', 'SYSTEM'];
    const severities = ['low', 'medium', 'high', 'critical'];

    const event = {
      deviceId: custom.deviceId || 'CJACK-UNIT-TX104',
      eventType: custom.eventType || 'INFO',
      category: custom.category || categories[Math.floor(Math.random() * categories.length)],
      message: custom.message || 'Simulated diagnostic telemetry event generated for demonstration',
      severity: custom.severity || severities[Math.floor(Math.random() * severities.length)],
      rawPayload: custom.rawPayload || { source: 'Frontend Simulator', testParam: true },
      isSimulated: true,
      timestamp: new Date().toISOString(),
    };

    return this.recordEvent(event);
  }
}

module.exports = new EventService();
