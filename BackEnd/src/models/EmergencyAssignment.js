const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  actor: {
    type: String,
    default: 'CJack Dispatch System',
  },
});

const EmergencyAssignmentSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: String,
      required: true,
      unique: true,
      default: () => `ASGN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      index: true,
    },
    // CRITICAL: unique index ensures atomic single-assignment per emergency (no race conditions)
    emergencyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: String,
      default: 'CJ-PATIENT-8829',
      index: true,
    },
    patientName: {
      type: String,
      default: 'Rajesh Kumar (Wearer)',
    },
    ambulanceId: {
      type: String,
      required: true,
      index: true,
    },
    ambulanceName: {
      type: String,
      required: true,
    },
    responderId: {
      type: String,
      default: null,
    },
    responderName: {
      type: String,
      required: true,
    },
    primaryPhone: {
      type: String,
      required: true,
    },
    acceptedTimestamp: {
      type: Date,
      default: Date.now,
    },
    patientLocation: {
      latitude: { type: Number, default: 12.9716 },
      longitude: { type: Number, default: 77.5946 },
      addressHint: { type: String, default: 'Bengaluru Central Emergency Sector 4 (MG Road Cross)' },
    },
    ambulanceLocation: {
      latitude: { type: Number, default: 12.9810 },
      longitude: { type: Number, default: 77.6015 },
      addressHint: { type: String, default: 'Richmond Circle Hub, Sector 2' },
      lastUpdated: { type: Date, default: Date.now },
    },
    emergencyStatus: {
      type: String,
      default: 'EMERGENCY ALERT SENT',
    },
    cprStatus: {
      type: String,
      default: 'CPR ACTIVE',
    },
    currentVitals: {
      heartRate: { type: Number, default: 0 },
      spo2: { type: Number, default: 78 },
      respirationRate: { type: Number, default: 0 },
      bloodPressure: { type: String, default: '60/40' },
      bloodGroup: { type: String, default: 'O+ POSITIVE' },
      emergencySeverity: { type: String, default: 'CRITICAL' },
    },
    assignmentStatus: {
      type: String,
      enum: [
        'CREATED',
        'DISPATCHING',
        'CALLING',
        'ACCEPTED',
        'ASSIGNED',
        'EN_ROUTE',
        'ARRIVED',
        'PATIENT_PICKED_UP',
        'HOSPITAL_REACHED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'ACCEPTED',
      index: true,
    },
    distanceKm: {
      type: Number,
      default: 2.4,
    },
    etaMinutes: {
      type: Number,
      default: 6,
    },
    isSimulatedETA: {
      type: Boolean,
      default: true,
    },
    timeline: {
      type: [TimelineEventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.EmergencyAssignment || mongoose.model('EmergencyAssignment', EmergencyAssignmentSchema);
