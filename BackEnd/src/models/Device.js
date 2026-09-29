const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    model: {
      type: String,
      default: 'CJack Wearable Vest rev.3',
    },
    serialNumber: {
      type: String,
      default: () => `SN-${Date.now().toString(36).toUpperCase()}`,
    },
    firmwareVersion: {
      type: String,
      default: 'v0.9.4-alpha',
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'STANDBY', 'CPR_ACTIVE', 'MAINTENANCE', 'ERROR'],
      default: 'STANDBY',
    },
    activeMode: {
      type: String,
      enum: [
        'STANDBY',
        'MONITORING',
        'EMERGENCY_VENT',
        'CPR_CLOSED_LOOP',
        'DIAGNOSTIC',
        'POST_ARREST_HOLD',
        'MAINTENANCE',
      ],
      default: 'STANDBY',
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 88,
    },
    batteryVoltage: {
      type: Number,
      default: 14.8,
    },
    batteryHealth: {
      type: String,
      default: 'Optimal',
    },
    actuatorPressureBar: {
      type: Number,
      default: 5.2,
    },
    ambientAirPumpStatus: {
      type: String,
      default: 'Standby',
    },
    internalTempCelsius: {
      type: Number,
      default: 32.4,
    },
    selfTestPassed: {
      type: Boolean,
      default: true,
    },
    motorHealth: {
      type: String,
      default: 'Nominal (Duty 0%)',
    },
    sensorsHealth: {
      type: String,
      default: 'All 6 Channels Nominal',
    },
    systemHealth: {
      type: String,
      default: '100% Operational',
    },
    assignedPatientId: {
      type: String,
      default: null,
      ref: 'Patient',
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.models.Device || mongoose.model('Device', DeviceSchema);
