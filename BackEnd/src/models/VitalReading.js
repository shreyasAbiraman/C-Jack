const mongoose = require('mongoose');

const VitalReadingSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      default: 'CJ-PATIENT-8829',
      index: true,
    },
    deviceId: {
      type: String,
      default: 'CJACK-UNIT-TX104',
      index: true,
    },
    heartRate: {
      type: Number,
      required: true,
      min: 0,
      max: 300,
    },
    spo2: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    respirationRate: {
      type: Number,
      default: 16,
      min: 0,
      max: 80,
    },
    perfusionIndex: {
      type: Number,
      default: 4.2,
    },
    etco2: {
      type: Number,
      default: 38,
    },
    ecgRhythm: {
      type: String,
      default: 'Normal Sinus Rhythm',
    },
    motionState: {
      type: String,
      default: 'Stationary / Resting',
    },
    temperature: {
      type: Number,
      default: 36.8,
    },
    source: {
      type: String,
      enum: ['REAL_HARDWARE', 'SIMULATION', 'Hardware', 'Simulation'],
      default: 'REAL_HARDWARE',
    },
    sensorStatus: {
      type: String,
      enum: ['CONNECTED', 'DISCONNECTED', 'CHECK', 'FAULT', 'SIMULATED', 'SIMULATION'],
      default: 'CONNECTED',
    },
    isSimulated: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for time-series queries
VitalReadingSchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.models.VitalReading || mongoose.model('VitalReading', VitalReadingSchema);
