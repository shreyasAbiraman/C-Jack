const mongoose = require('mongoose');

const DeviceEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      default: () => `EVT-${Date.now().toString(36).toUpperCase()}`,
      index: true,
    },
    deviceId: {
      type: String,
      default: 'CJACK-UNIT-TX104',
      index: true,
    },
    eventType: {
      type: String,
      enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL', 'STATE_CHANGE', 'SELF_TEST'],
      default: 'INFO',
    },
    category: {
      type: String,
      enum: ['POWER', 'LORA', 'GPS', 'SENSORS', 'ACTUATOR', 'SYSTEM', 'SECURITY'],
      default: 'SYSTEM',
    },
    message: {
      type: String,
      required: [true, 'Event message is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isSimulated: {
      type: Boolean,
      default: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

DeviceEventSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.models.DeviceEvent || mongoose.model('DeviceEvent', DeviceEventSchema);
