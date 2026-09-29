const mongoose = require('mongoose');

const CPRSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      default: () => `CPR-SESS-${Date.now().toString(36).toUpperCase()}`,
      index: true,
    },
    deviceId: {
      type: String,
      default: 'CJACK-UNIT-TX104',
      index: true,
    },
    patientId: {
      type: String,
      default: 'CJ-PATIENT-8829',
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['IDLE', 'STANDBY', 'ARMED', 'ACTIVE', 'PAUSED', 'ROSC_DETECTED', 'STOPPED', 'COMPLETED'],
      default: 'STANDBY',
    },
    mode: {
      type: String,
      default: 'Automated Pneumatic Vest (Closed-Loop)',
    },
    totalCompressions: {
      type: Number,
      default: 0,
    },
    targetRate: {
      type: [Number],
      default: [100, 120],
    },
    currentRate: {
      type: Number,
      default: 108,
    },
    targetDepthMm: {
      type: [Number],
      default: [50, 60],
    },
    currentDepthMm: {
      type: Number,
      default: 52,
    },
    chestRecoilPercentage: {
      type: Number,
      default: 96,
    },
    appliedForceNewtons: {
      type: Number,
      default: 410,
    },
    compressionFraction: {
      type: Number,
      default: 92,
    },
    closedLoopActive: {
      type: Boolean,
      default: true,
    },
    emergencyStopTriggered: {
      type: Boolean,
      default: false,
    },
    roscAchieved: {
      type: Boolean,
      default: false,
    },
    isSimulated: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.CPRSession || mongoose.model('CPRSession', CPRSessionSchema);
