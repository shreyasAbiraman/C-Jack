const mongoose = require('mongoose');

const EmergencyTimelineSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  stage: {
    type: String,
    default: 'SYSTEM',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  severity: {
    type: String,
    default: 'info',
  },
  source: {
    type: String,
    default: 'CJack Core System',
  },
});

const EmergencySchema = new mongoose.Schema(
  {
    emergencyId: {
      type: String,
      required: true,
      unique: true,
      default: () => `EMG-${Date.now().toString(36).toUpperCase()}`,
      index: true,
    },
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
    status: {
      type: String,
      enum: [
        'NORMAL',
        'MONITORING',
        'WARNING',
        'CARDIAC ARREST SUSPECTED',
        'CPR ACTIVE',
        'EMERGENCY ALERT SENT',
        'RESPONDER EN ROUTE',
        'PATIENT STABLE',
      ],
      default: 'NORMAL',
    },
    alertLevel: {
      type: String,
      enum: ['STANDBY', 'WARNING', 'CRITICAL', 'RESOLVED'],
      default: 'STANDBY',
    },
    cardiacArrestDetected: {
      type: Boolean,
      default: false,
    },
    flowStage: {
      type: Number,
      default: 0,
      min: 0,
      max: 6,
    },
    responderDispatched: {
      type: Boolean,
      default: false,
    },
    responderId: {
      type: String,
      default: null,
      ref: 'Responder',
    },
    assignedCallsign: {
      type: String,
      default: 'ALS-MED-04',
    },
    gpsCoordinates: {
      latitude: { type: Number, default: 12.9716 },
      longitude: { type: Number, default: 77.5946 },
      altitudeMeters: { type: Number, default: 920 },
      accuracyMeters: { type: Number, default: 2.8 },
      addressHint: { type: String, default: 'Bengaluru Central Emergency Sector 4 (MG Road Cross)' },
    },
    timeline: {
      type: [EmergencyTimelineSchema],
      default: [],
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

module.exports = mongoose.models.Emergency || mongoose.model('Emergency', EmergencySchema);
