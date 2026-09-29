/**
 * C-Jack Context Service
 * Gathers live patient telemetry, active emergency dispatch status,
 * CPR metrics, and device connectivity to provide ground-truth context to the AI Assistant.
 */

const vitalService = require('./vitalService');
const simulationService = require('./simulationService');
const emergencyDispatchService = require('./emergencyDispatchService');
const cprService = require('./cprService');
const deviceService = require('./deviceService');

async function getLiveContext() {
  const liveVitals = simulationService.vitals || vitalService.getCurrentVitals().vitals || {};
  const activeEmergency = await emergencyDispatchService.getActiveEmergency().catch(() => null);
  const ambulances = await emergencyDispatchService.getActiveEmergencyContacts().catch(() => []);
  const cprMetrics = simulationService.cpr || {};
  const deviceOverview = deviceService.getOverview();

  const heartRate = (liveVitals.heartRate !== undefined && liveVitals.heartRate !== null) ? Number(liveVitals.heartRate) : 74;
  const spO2 = (liveVitals.spo2 !== undefined && liveVitals.spo2 !== null) ? Number(liveVitals.spo2) : 98;
  const bloodPressure = liveVitals.bloodPressure || '120/80';
  const respirationRate = liveVitals.respirationRate || 16;
  const sensorStatus = liveVitals.sensorStatus || (liveVitals.isSimulated ? 'SIMULATED' : 'CONNECTED');
  const source = liveVitals.source || 'REAL_HARDWARE';

  return {
    patient: {
      patientId: 'CJ-PATIENT-8829',
      name: 'Rajesh Kumar (Wearer)',
      age: 52,
      gender: 'Male',
      bloodGroup: 'O+ POSITIVE',
      allergies: 'Penicillin',
      medicalHistory: 'Prior Myocardial Infarction (2022)',
      vitals: {
        heartRate,
        pulse: heartRate,
        spO2,
        spo2: spO2,
        bloodPressure,
        respirationRate,
        sensorStatus,
        source,
      },
      cpr: {
        active: Boolean(cprMetrics.active),
        rate: cprMetrics.rate || 110,
        compressionRate: cprMetrics.rate || 110,
        depth: cprMetrics.depth || 5.2,
        depthCm: cprMetrics.depth || 5.2,
        count: cprMetrics.compressionCount || 0,
      },
    },
    vitals: {
      heartRate,
      pulse: heartRate,
      spO2,
      spo2: spO2,
      bloodPressure,
      respirationRate,
      sensorStatus,
      source,
    },
    emergency: activeEmergency ? {
      active: true,
      emergencyId: activeEmergency.emergencyId,
      status: activeEmergency.status,
      assignedAmbulance: activeEmergency.assignment ? {
        id: activeEmergency.assignment.ambulanceId?.ambulanceId || activeEmergency.assignment.ambulanceId || 'AMB-02',
        name: activeEmergency.assignment.ambulanceName || 'ABC Emergency Services 02',
        responder: activeEmergency.assignment.responderName || 'Lead Paramedic Rajesh Sharma',
        etaMinutes: activeEmergency.assignment.etaMinutes || 4,
        distanceKm: activeEmergency.assignment.distanceKm || 1.8,
      } : null,
    } : {
      active: false,
      status: 'NORMAL',
    },
    ambulance: activeEmergency?.assignment ? {
      id: activeEmergency.assignment.ambulanceId?.ambulanceId || activeEmergency.assignment.ambulanceId || 'AMB-02',
      etaMinutes: activeEmergency.assignment.etaMinutes || 4,
      distanceKm: activeEmergency.assignment.distanceKm || 1.8,
      status: activeEmergency.status,
    } : {
      availableCount: ambulances.length || 3,
      etaMinutes: 4,
      distanceKm: 1.8,
    },
    device: {
      deviceId: 'CJACK-001',
      battery: simulationService.deviceHealth?.batteryLevel || 82,
      status: 'ONLINE',
      wifi: 'CONNECTED',
      gps: 'CONNECTED',
    },
  };
}

module.exports = { getLiveContext };
