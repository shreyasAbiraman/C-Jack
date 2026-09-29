const mongoose = require('mongoose');

const ResponderSchema = new mongoose.Schema(
  {
    responderId: {
      type: String,
      required: true,
      unique: true,
      default: () => `RESP-${Date.now().toString(36).toUpperCase()}`,
      index: true,
    },
    callsign: {
      type: String,
      required: [true, 'Responder callsign is required'],
      default: 'ALS-MED-04',
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Responder name is required'],
      default: 'ALS Crew Alpha (Lead: Dr. Marcus Vance)',
      trim: true,
    },
    role: {
      type: String,
      enum: ['PARAMEDIC', 'EMERGENCY_PHYSICIAN', 'FIRST_RESPONDER', 'DISPATCHER'],
      default: 'PARAMEDIC',
    },
    unitType: {
      type: String,
      enum: ['ALS_AMBULANCE', 'MOTOR_MEDIC', 'RAPID_RESPONSE', 'AIR_AMBULANCE'],
      default: 'ALS_AMBULANCE',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'HANDOVER_COMPLETE', 'OFF_DUTY'],
      default: 'AVAILABLE',
    },
    contactNumber: {
      type: String,
      default: '+91 80 2234 5678',
    },
    vehicleId: {
      type: String,
      default: 'KA-01-EQ-9902',
    },
    currentEmergencyId: {
      type: String,
      default: null,
      ref: 'Emergency',
    },
    currentLocation: {
      latitude: { type: Number, default: 12.9810 },
      longitude: { type: Number, default: 77.6015 },
      addressHint: { type: String, default: 'Richmond Circle Hub, Sector 2' },
      lastUpdated: { type: Date, default: Date.now },
    },
    etaMinutes: {
      type: Number,
      default: 4,
    },
    distanceKm: {
      type: Number,
      default: 1.8,
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

module.exports = mongoose.models.Responder || mongoose.model('Responder', ResponderSchema);
