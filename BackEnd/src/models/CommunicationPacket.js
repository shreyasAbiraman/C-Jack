const mongoose = require('mongoose');

const CommunicationPacketSchema = new mongoose.Schema(
  {
    packetId: {
      type: String,
      required: true,
      unique: true,
      default: () => `PKT-${Date.now().toString(36).toUpperCase()}`,
      index: true,
    },
    deviceId: {
      type: String,
      default: 'CJACK-UNIT-TX104',
      index: true,
    },
    protocol: {
      type: String,
      enum: ['LORA', 'CELLULAR', 'BLE', 'SATELLITE', 'WIFI'],
      default: 'LORA',
    },
    direction: {
      type: String,
      enum: ['UPLINK', 'DOWNLINK'],
      default: 'UPLINK',
    },
    payloadType: {
      type: String,
      enum: ['TELEMETRY', 'ALERT', 'COMMAND', 'HEARTBEAT', 'ACK', 'CUSTOM'],
      default: 'TELEMETRY',
    },
    rawData: {
      type: String,
      default: '',
    },
    parsedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    rssi: {
      type: Number,
      default: -72,
    },
    snr: {
      type: Number,
      default: 9.5,
    },
    frequency: {
      type: String,
      default: '868.1 MHz',
    },
    gatewayId: {
      type: String,
      default: 'GW-BLR-041',
    },
    status: {
      type: String,
      enum: ['RECEIVED', 'ACKNOWLEDGED', 'DROPPED', 'QUEUED'],
      default: 'RECEIVED',
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

CommunicationPacketSchema.index({ protocol: 1, timestamp: -1 });

module.exports = mongoose.models.CommunicationPacket || mongoose.model('CommunicationPacket', CommunicationPacketSchema);
