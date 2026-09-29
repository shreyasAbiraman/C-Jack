const mongoose = require('mongoose');

const AmbulanceSchema = new mongoose.Schema(
  {
    ambulanceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Ambulance name is required'],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, 'Organization / Hospital name is required'],
      trim: true,
    },
    responderName: {
      type: String,
      required: [true, 'Driver/Responder name is required'],
      trim: true,
    },
    primaryPhone: {
      type: String,
      required: [true, 'Primary phone number is required'],
      trim: true,
    },
    secondaryPhone: {
      type: String,
      default: '',
      trim: true,
    },
    serviceArea: {
      type: String,
      default: 'Central District (5km Radius)',
      trim: true,
    },
    availability: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'OFFLINE', 'UNAVAILABLE'],
      default: 'AVAILABLE',
      index: true,
    },
    currentStatus: {
      type: String,
      enum: ['STANDBY', 'RINGING', 'ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'TRANSPORTING', 'AVAILABLE'],
      default: 'AVAILABLE',
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    isActiveResponder: {
      type: Boolean,
      default: true,
      index: true,
    },
    location: {
      latitude: { type: Number, default: 12.9716 },
      longitude: { type: Number, default: 77.5946 },
      addressHint: { type: String, default: 'Trauma Response Hub, Sector 4' },
      lastUpdated: { type: Date, default: Date.now },
    },
    notes: {
      type: String,
      default: 'ALS Certified • Pneumatic ventilator equipped',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Ambulance || mongoose.model('Ambulance', AmbulanceSchema);
