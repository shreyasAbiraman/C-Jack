const mongoose = require('mongoose');

const EmergencyDispatchSchema = new mongoose.Schema(
  {
    dispatchId: {
      type: String,
      required: true,
      unique: true,
      default: () => `DISP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      index: true,
    },
    emergencyId: {
      type: String,
      required: true,
      index: true,
    },
    ambulanceId: {
      type: String,
      required: true,
      index: true,
    },
    ambulanceName: {
      type: String,
      default: 'Ambulance Unit',
    },
    responderName: {
      type: String,
      default: 'EMT Responder',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    callStatus: {
      type: String,
      enum: ['PENDING', 'RINGING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    dispatchedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.EmergencyDispatch || mongoose.model('EmergencyDispatch', EmergencyDispatchSchema);
