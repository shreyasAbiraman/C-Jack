const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      default: 'CJACK-UNIT-TX104',
      index: true,
    },
    responderId: {
      type: String,
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['device', 'responder', 'waypoint'],
      default: 'device',
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    altitudeMeters: {
      type: Number,
      default: 920,
    },
    accuracyMeters: {
      type: Number,
      default: 2.8,
    },
    speedKmh: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    addressHint: {
      type: String,
      default: 'Bengaluru Central Emergency Sector 4 (MG Road Cross)',
    },
    satellites: {
      type: Number,
      default: 11,
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

LocationSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.models.Location || mongoose.model('Location', LocationSchema);
