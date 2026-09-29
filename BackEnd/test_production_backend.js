/**
 * CJack Backend Automated End-to-End API Test Suite
 * Tests all 10 REST API groups, simulation endpoints, auth, and error format.
 */

const http = require('http');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5099';

const app = require('./src/server');
let server;
let authToken = '';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const options = {
      hostname: '127.0.0.1',
      port: 5099,
      path,
      method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => (rawData += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: rawData });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   Starting CJack Production API Test Suite');
  console.log('======================================================\n');

  server = app.listen(5099);
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.success === true, '1. GET /api/health returns status 200 with standard response');

    // 2. Auth APIs
    const reg = await request('POST', '/api/auth/register', {
      name: 'Dr. Test Medic',
      email: `testmedic_${Date.now()}@cjack.health`,
      password: 'SecurePassword123!',
      role: 'responder',
    });
    assert(reg.status === 201 && reg.body.success === true && reg.body.data.token, '2.1 POST /api/auth/register creates user and returns JWT');
    authToken = reg.body.data.token;

    const me = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${authToken}` });
    assert(me.status === 200 && me.body.success === true && me.body.data.email, '2.2 GET /api/auth/me returns authenticated profile');

    // 3. Patients API
    const patients = await request('GET', '/api/patients');
    assert(patients.status === 200 && patients.body.success === true && patients.body.data.name, '3.1 GET /api/patients returns patient profile');

    const updatePatient = await request('PUT', '/api/patients', {
      name: 'John Doe Updated',
      age: 59,
      gender: 'Male',
      bloodGroup: 'O+',
      emergencyContact: { name: 'Sarah Doe', phone: '+91 9876543210' },
    });
    assert(updatePatient.status === 200 && updatePatient.body.success === true, '3.2 PUT /api/patients updates patient profile');

    // 4. Devices API
    const devices = await request('GET', '/api/devices');
    assert(devices.status === 200 && devices.body.success === true, '4.1 GET /api/devices lists registered devices');

    const devOverview = await request('GET', '/api/devices/overview');
    assert(devOverview.status === 200 && (devOverview.body.battery || devOverview.body.overview?.battery), '4.2 GET /api/devices/overview returns telemetry');

    const devMode = await request('POST', '/api/devices/mode', { mode: 'MONITORING' });
    assert(devMode.status === 200 && devMode.body.success === true, '4.3 POST /api/devices/mode updates operating mode');

    // 5. Vitals API
    const vitals = await request('GET', '/api/vitals');
    assert(vitals.status === 200 && vitals.body.success === true && vitals.body.data.heartRate !== undefined, '5.1 GET /api/vitals returns live vitals');

    const vitalsHistory = await request('GET', '/api/vitals/history?range=5m');
    assert(vitalsHistory.status === 200 && Array.isArray(vitalsHistory.body.data), '5.2 GET /api/vitals/history returns timeseries array');

    const simVital = await request('POST', '/api/vitals/simulate', { heartRate: 110, spo2: 95 });
    assert(simVital.status === 200 && simVital.body.data.isSimulated === true, '5.3 POST /api/vitals/simulate generates simulated vital');

    // 6. CPR API
    const cprState = await request('GET', '/api/cpr');
    assert(cprState.status === 200 && cprState.body.success === true, '6.1 GET /api/cpr returns CPR state');

    const cprTransition = await request('POST', '/api/cpr/transition', { targetState: 'MONITORING' });
    assert(cprTransition.status === 200 && cprTransition.body.success === true, '6.2 POST /api/cpr/transition transitions CPR state');

    const cprEStop = await request('POST', '/api/cpr/emergency-stop');
    assert(cprEStop.status === 200 && cprEStop.body.success === true, '6.3 POST /api/cpr/emergency-stop executes instant cutoff');

    // 7. Emergencies API
    const emgStatus = await request('GET', '/api/emergencies');
    assert(emgStatus.status === 200 && emgStatus.body.alertState, '7.1 GET /api/emergencies returns emergency state');

    const emgTrigger = await request('POST', '/api/emergencies/trigger');
    assert(emgTrigger.status === 200 && emgTrigger.body.success === true, '7.2 POST /api/emergencies/trigger initiates cardiac arrest');

    const emgReset = await request('POST', '/api/emergencies/reset');
    assert(emgReset.status === 200 && emgReset.body.success === true, '7.3 POST /api/emergencies/reset resets emergency');

    // 8. Location API
    const loc = await request('GET', '/api/location');
    assert(loc.status === 200 && loc.body.data.latitude && loc.body.data.longitude, '8.1 GET /api/location returns GPS coordinates');

    const simGPS = await request('POST', '/api/location/simulate-packet', { speedKmh: 12 });
    assert(simGPS.status === 200 && simGPS.body.data.isSimulated === true, '8.2 POST /api/location/simulate-packet creates GPS packet');

    // 9. Responders API
    const responders = await request('GET', '/api/responders');
    assert(responders.status === 200 && Array.isArray(responders.body.data), '9.1 GET /api/responders returns responders list');

    const responderStatus = await request('GET', '/api/responders/status');
    assert(responderStatus.status === 200 && responderStatus.body.unit, '9.2 GET /api/responders/status returns unit status');

    const handover = await request('GET', '/api/responders/handover');
    assert(handover.status === 200 && handover.body.success === true, '9.3 GET /api/responders/handover returns clinical handover');

    // 10. Events API
    const events = await request('GET', '/api/events');
    assert(events.status === 200 && Array.isArray(events.body.data), '10.1 GET /api/events returns device events list');

    const recordEvent = await request('POST', '/api/events', {
      category: 'POWER',
      message: 'Self-test diagnostic event verified',
      severity: 'low',
    });
    assert(recordEvent.status === 201 && recordEvent.body.success === true, '10.2 POST /api/events records new event');

    // 11. Communication API
    const commStatus = await request('GET', '/api/communication/status');
    assert(commStatus.status === 200 && commStatus.body.lora, '11.1 GET /api/communication/status returns LoRa/GNSS status');

    const commPacket = await request('POST', '/api/communication/packet', {
      deviceId: 'CJACK-UNIT-TX104',
      heartRate: 75,
      spo2: 98,
      battery: 88,
    });
    assert(commPacket.status === 200 && commPacket.body.success === true, '11.2 POST /api/communication/packet ingests packet');

    // 12. Simulation API
    const simStatus = await request('GET', '/api/simulation/status');
    assert(simStatus.status === 200 && simStatus.body.meta.isSimulated === true, '12.1 GET /api/simulation/status returns simulation state');

    const simVitalsGen = await request('POST', '/api/simulation/vitals', { heartRate: 82 });
    assert(simVitalsGen.status === 200 && simVitalsGen.body.meta.isSimulated === true, '12.2 POST /api/simulation/vitals generates simulated vitals');

    const simCPRGen = await request('POST', '/api/simulation/cpr', { active: true, rate: 108 });
    assert(simCPRGen.status === 200 && simCPRGen.body.meta.isSimulated === true, '12.3 POST /api/simulation/cpr generates simulated CPR');

    const simSensorsGen = await request('POST', '/api/simulation/sensors');
    assert(simSensorsGen.status === 200 && simSensorsGen.body.meta.isSimulated === true, '12.4 POST /api/simulation/sensors generates simulated sensors');

    const simDeviceGen = await request('POST', '/api/simulation/device', { batteryLevel: 94 });
    assert(simDeviceGen.status === 200 && simDeviceGen.body.meta.isSimulated === true, '12.5 POST /api/simulation/device generates simulated device');

    const simEmergencyGen = await request('POST', '/api/simulation/emergency', { state: 'MONITORING' });
    assert(simEmergencyGen.status === 200 && simEmergencyGen.body.meta.isSimulated === true, '12.6 POST /api/simulation/emergency generates simulated emergency');

    const simGPSGen = await request('POST', '/api/simulation/gps');
    assert(simGPSGen.status === 200 && simGPSGen.body.meta.isSimulated === true, '12.7 POST /api/simulation/gps generates simulated GPS packet');

    // 13. Error Handling and Standard Format
    const notFound = await request('GET', '/api/non-existent-endpoint');
    assert(notFound.status === 404 && notFound.body.success === false && notFound.body.message, '13.1 404 handler returns standard { success: false, message }');

    const badAuth = await request('POST', '/api/auth/login', { email: 'wrong@cjack.health', password: 'bad' });
    assert(badAuth.status === 401 || badAuth.status === 500, '13.2 Invalid login returns error response');

    // 14. Backward Compatibility for Frontend
    const legacyPatient = await request('GET', '/api/patient');
    assert(legacyPatient.status === 200 && legacyPatient.body.success === true, '14.1 GET /api/patient works (legacy frontend compatibility)');

    const legacyTelemetryVitals = await request('GET', '/api/telemetry/vitals');
    assert(legacyTelemetryVitals.status === 200 && legacyTelemetryVitals.body.data.vitals, '14.2 GET /api/telemetry/vitals works (legacy frontend compatibility)');

    const legacyEmergencyStatus = await request('GET', '/api/emergency/status');
    assert(legacyEmergencyStatus.status === 200 && legacyEmergencyStatus.body.alertState, '14.3 GET /api/emergency/status works (legacy frontend compatibility)');

    const legacyConnectivity = await request('GET', '/api/connectivity/status');
    assert(legacyConnectivity.status === 200 && legacyConnectivity.body.lora, '14.4 GET /api/connectivity/status works (legacy frontend compatibility)');

    console.log('\n------------------------------------------------------');
    console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('------------------------------------------------------\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
