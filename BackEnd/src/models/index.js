const User = require('./User');
const Patient = require('./Patient');
const Device = require('./Device');
const VitalReading = require('./VitalReading');
const CPRSession = require('./CPRSession');
const Emergency = require('./Emergency');
const Location = require('./Location');
const Responder = require('./Responder');
const DeviceEvent = require('./DeviceEvent');
const CommunicationPacket = require('./CommunicationPacket');
const Ambulance = require('./Ambulance');
const EmergencyDispatch = require('./EmergencyDispatch');
const EmergencyAssignment = require('./EmergencyAssignment');

module.exports = {
  User,
  Patient,
  Device,
  VitalReading,
  CPRSession,
  Emergency,
  Location,
  Responder,
  DeviceEvent,
  CommunicationPacket,
  Ambulance,
  EmergencyDispatch,
  EmergencyAssignment,
};
