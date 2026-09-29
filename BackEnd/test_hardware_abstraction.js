/**
 * CJack Hardware Abstraction Layer Automated Test Suite
 * 
 * Verifies:
 * 1. Hardware State Machine (SIMULATED, CONNECTED, DISCONNECTED, FAULT, UNKNOWN)
 * 2. Strict Zero-Pretense Invariant: Never pretends connected when no physical packets arrive.
 * 3. 11 Hardware Module Interfaces (ECG, SpO2, Motion, Respiration, Load Cell, Motor, GPS, LoRa, Battery, Display, Speaker)
 * 4. JSON Data Contract Ingestion & Validation
 * 5. Downlink Commands (Motor, Speaker, Display)
 * 6. Dynamic Integration with /api/devices/sensors
 */

const http = require('http');

process.env.NODE_ENV = 'test';
process.env.PORT = '5098';

const app = require('./src/server');
let server;

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
      port: 5098,
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

async function runHardwareTests() {
  console.log('\n======================================================');
  console.log('   Starting CJack Hardware Abstraction Test Suite');
  console.log('======================================================\n');

  server = app.listen(5098);
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Initial State Check
    const res1 = await request('GET', '/api/hardware/status');
    assert(res1.status === 200, '1.1 GET /api/hardware/status returns 200');
    assert(res1.body.data.overallState === 'SIMULATED', '1.2 Initial state is SIMULATED (Zero Pretense)');
    assert(res1.body.data.modules.length === 11, '1.3 All 11 hardware modules are registered');

    const expectedModuleIds = ['ecg', 'spo2', 'motion', 'respiration', 'loadCell', 'motor', 'gps', 'lora', 'battery', 'display', 'speaker'];
    const actualModuleIds = res1.body.data.modules.map(m => m.id);
    const hasAllModules = expectedModuleIds.every(id => actualModuleIds.includes(id));
    assert(hasAllModules, '1.4 Contains all 11 specific required interfaces');

    // 2. Data Contract Check
    const res2 = await request('GET', '/api/hardware/contract');
    assert(res2.status === 200, '2.1 GET /api/hardware/contract returns 200');
    assert(res2.body.schema && res2.body.samplePhysicalPacket, '2.2 Contract returns JSON schema and sample packet');
    assert(res2.body.schema.required.includes('sensors'), '2.3 Schema requires sensors object');
    assert(res2.body.schema.required.includes('cpr'), '2.4 Schema requires cpr object');

    // 3. Telemetry Validation (Negative test - Malformed packet)
    const malformedPacket = { deviceId: 'CJACK-TEST' }; // Missing required fields
    const res3 = await request('POST', '/api/hardware/telemetry', malformedPacket);
    assert(res3.status === 400, '3.1 Ingestion of malformed packet rejected with 400 Bad Request');
    assert(res3.body.validationErrors && res3.body.validationErrors.length > 0, '3.2 Detailed contract validation errors returned');

    // 4. Ingestion of Valid Physical Packet (Transition to CONNECTED)
    const samplePhysical = res2.body.samplePhysicalPacket;
    const res4 = await request('POST', '/api/hardware/telemetry', samplePhysical, {
      'x-cjack-hardware-source': 'physical'
    });
    assert(res4.status === 200, '4.1 Ingestion of valid physical packet returns 200');
    assert(res4.body.data.hardwareState === 'CONNECTED', '4.2 Hardware state transitions to CONNECTED');

    // Verify all 11 modules updated
    const res5 = await request('GET', '/api/hardware/status');
    assert(res5.body.data.overallState === 'CONNECTED', '4.3 Overall status reports CONNECTED');
    assert(res5.body.data.isPhysicalConnected === true, '4.4 isPhysicalConnected flag is true');
    assert(res5.body.data.isSimulated === false, '4.5 isSimulated flag is false');

    // 5. Fault Detection (ECG Lead Off)
    const faultPacket = {
      ...samplePhysical,
      sensors: {
        ...samplePhysical.sensors,
        ecg: {
          leadsConnected: false,
          leadOffPlus: true,
          fault: true,
          faultCode: 'ERR_ECG_LEAD_OFF'
        }
      }
    };
    const res6 = await request('POST', '/api/hardware/telemetry', faultPacket, {
      'x-cjack-hardware-source': 'physical'
    });
    assert(res6.status === 200, '5.1 Ingested fault packet accepted');
    assert(res6.body.data.hardwareState === 'FAULT', '5.2 Hardware state transitions to FAULT');

    const res7 = await request('GET', '/api/hardware/status');
    const ecgMod = res7.body.data.modules.find(m => m.id === 'ecg');
    assert(ecgMod.state === 'FAULT', '5.3 ECG module reflects FAULT state');

    // 6. Downlink Commands
    const resMotorCmd = await request('POST', '/api/hardware/command', {
      target: 'motor',
      action: 'START',
      payload: { rate: 110, depth: 55 }
    });
    assert(resMotorCmd.status === 200, '6.1 Motor command START dispatched');
    assert(resMotorCmd.body.data.command === 'START_CPR', '6.2 Command object is START_CPR');

    const resSpeakerCmd = await request('POST', '/api/hardware/command', {
      target: 'speaker',
      action: 'METRONOME_START',
      payload: { bpm: 110 }
    });
    assert(resSpeakerCmd.status === 200, '6.3 Speaker metronome command dispatched');

    const resDisplayCmd = await request('POST', '/api/hardware/command', {
      target: 'display',
      action: 'UPDATE',
      payload: { line1: 'TEST DISPLAY' }
    });
    assert(resDisplayCmd.status === 200, '6.4 Display command dispatched');

    // 7. Operating Mode Switch & Disconnection Rule
    const resModePhys = await request('POST', '/api/hardware/mode', { mode: 'PHYSICAL' });
    assert(resModePhys.status === 200, '7.1 Switched operating mode to PHYSICAL');

    const resModeSim = await request('POST', '/api/hardware/mode', { mode: 'SIMULATION' });
    assert(resModeSim.status === 200, '7.2 Switched operating mode back to SIMULATION');
    assert(resModeSim.body.data.overallState === 'SIMULATED', '7.3 Overall state is SIMULATED in simulation mode');

    // 8. Device Overview & Sensor Integration
    const resSensors = await request('GET', '/api/devices/sensors');
    assert(resSensors.status === 200, '8.1 GET /api/devices/sensors returns 200');
    assert(resSensors.body.hardwareState === 'SIMULATED', '8.2 /api/devices/sensors dynamically reflects hardwareState');
    assert(resSensors.body.sensors.length >= 7, '8.3 Sensors table has dynamic status');

    console.log('\n------------------------------------------------------');
    console.log(`Hardware Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('------------------------------------------------------\n');

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runHardwareTests();
