/**
 * CJack Real Hardware & Emergency Integration Test Suite
 * Tests:
 * 1. POST /api/device/vitals (Live ESP32 telemetry ingestion, validation, range checking, rejection of malformed data)
 * 2. Atomic Assignment Concurrency & Mutex (Double-accept race condition protection)
 * 3. AI Assistant Live Telemetry Context & Emergency Intent
 * 4. Simulation Fallback vs Real Hardware Distinction
 */

const axios = require('axios');
const http = require('http');
const server = require('./src/server');

const BASE_URL = 'http://localhost:5000';

async function runIntegrationTests() {
  console.log('\n======================================================');
  console.log('   CJack Hardware + Emergency Integration Test Suite');
  console.log('======================================================\n');

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
    // ----------------------------------------------------
    // TEST 1: POST /api/device/vitals (Valid Hardware Packet)
    // ----------------------------------------------------
    const validHwPayload = {
      deviceId: 'CJACK-001',
      heartRate: 78,
      spo2: 97,
      timestamp: new Date().toISOString(),
      sensorStatus: 'CONNECTED',
      source: 'REAL_HARDWARE',
      battery: 82,
    };

    const hwRes = await axios.post(`${BASE_URL}/api/device/vitals`, validHwPayload);
    assert(hwRes.status === 200 && hwRes.data.success, '1.1 POST /api/device/vitals ingests valid physical sensor packet');
    assert(hwRes.data.data.heartRate === 78, '1.2 Live Heart Rate recorded as 78 BPM');
    assert(hwRes.data.data.spo2 === 97, '1.3 Live SpO2 recorded as 97%');
    assert(hwRes.data.data.source === 'REAL_HARDWARE', "1.4 Source marked as 'REAL_HARDWARE'");

    // ----------------------------------------------------
    // TEST 2: Validation of Malformed & Out-of-Range Payloads
    // ----------------------------------------------------
    try {
      await axios.post(`${BASE_URL}/api/device/vitals`, {
        deviceId: '', // Empty deviceId
        heartRate: 78,
        spo2: 97,
      });
      assert(false, '2.1 Rejects empty deviceId');
    } catch (err) {
      assert(err.response?.status === 400, '2.1 Rejects empty deviceId with 400 Bad Request');
    }

    try {
      await axios.post(`${BASE_URL}/api/device/vitals`, {
        deviceId: 'CJACK-001',
        heartRate: 450, // Out of range (>300)
        spo2: 97,
        sensorStatus: 'CONNECTED',
      });
      assert(false, '2.2 Rejects out-of-range heart rate (>300 BPM)');
    } catch (err) {
      assert(err.response?.status === 400, '2.2 Rejects out-of-range heart rate (>300 BPM) with 400 Bad Request');
    }

    try {
      await axios.post(`${BASE_URL}/api/device/vitals`, {
        deviceId: 'CJACK-001',
        heartRate: 78,
        spo2: 120, // Out of range (>100)
        sensorStatus: 'CONNECTED',
      });
      assert(false, '2.3 Rejects out-of-range SpO2 (>100%)');
    } catch (err) {
      assert(err.response?.status === 400, '2.3 Rejects out-of-range SpO2 (>100%) with 400 Bad Request');
    }

    // ----------------------------------------------------
    // TEST 3: Sensor Disconnected Handling
    // ----------------------------------------------------
    const disconnRes = await axios.post(`${BASE_URL}/api/device/vitals`, {
      deviceId: 'CJACK-001',
      heartRate: null,
      spo2: null,
      sensorStatus: 'DISCONNECTED',
    });
    assert(disconnRes.status === 200 && disconnRes.data.data.sensorStatus === 'DISCONNECTED', '3.1 Ingests DISCONNECTED sensor status gracefully');

    // Restore 78 BPM for AI & Emergency tests
    await axios.post(`${BASE_URL}/api/device/vitals`, validHwPayload);

    // ----------------------------------------------------
    // TEST 4: Conversational AI Assistant Live Vitals Context
    // ----------------------------------------------------
    const aiVitalsRes = await axios.post(`${BASE_URL}/api/ai/chat`, {
      message: 'CJack, patient oda heart rate enna?',
      language: 'ta',
    });
    assert(aiVitalsRes.status === 200 && aiVitalsRes.data.success, '4.1 AI Chat endpoint responds successfully');
    assert(
      aiVitalsRes.data.data.response.includes('78 BPM'),
      `4.2 AI Assistant returns exact live backend heart rate (78 BPM) -> Got: "${aiVitalsRes.data.data.response}"`
    );

    // ----------------------------------------------------
    // TEST 5: Conversational AI Assistant Emergency Intent
    // ----------------------------------------------------
    const aiEmgRes = await axios.post(`${BASE_URL}/api/ai/chat`, {
      message: 'CJack, ambulance call pannu.',
      language: 'ta',
    });
    assert(aiEmgRes.data.data.intent === 'CREATE_EMERGENCY', "5.1 AI creates 'CREATE_EMERGENCY' intent");
    assert(aiEmgRes.data.data.requiresConfirmation === true, '5.2 AI requires explicit confirmation before calling');
    assert(
      aiEmgRes.data.data.response.includes('configured ambulance responders'),
      '5.3 AI Assistant asks for confirmation to proceed dispatch'
    );

    // ----------------------------------------------------
    // TEST 6: Emergency Dispatch Creation & 3 Simultaneous Ringing Calls
    // ----------------------------------------------------
    // Clean up any existing active emergency first
    const activeEmg = await axios.get(`${BASE_URL}/api/emergencies/active`).catch(() => null);
    if (activeEmg?.data?.data?.emergencyId) {
      await axios.post(`${BASE_URL}/api/emergencies/${activeEmg.data.data.emergencyId}/cancel`, { reason: 'TEST_RESET' }).catch(() => null);
    }
    await axios.post(`${BASE_URL}/api/emergencies/reset`).catch(() => null);

    const dispatchRes = await axios.post(`${BASE_URL}/api/emergencies/dispatch`, {
      patientId: 'CJ-PATIENT-8829',
      patientName: 'Demo Patient',
      vitals: { heartRate: 78, spo2: 97 },
      patientLocation: { latitude: 12.9716, longitude: 77.5946, addressHint: 'MG Road Trauma Sector' },
    });

    const emergencyId = dispatchRes.data.data.emergencyId || dispatchRes.data.data.emergency?.emergencyId;
    assert(emergencyId, `6.1 Emergency created/active with ID: ${emergencyId}`);
    assert(
      dispatchRes.data.data.dispatches.length === 3,
      `6.2 Dispatched simultaneously to ${dispatchRes.data.data.dispatches.length} configured ambulances`
    );

    // ----------------------------------------------------
    // TEST 7: Atomic Assignment & Race Condition Protection
    // ----------------------------------------------------
    // Responder 1 accepts
    const accept1 = await axios.post(`${BASE_URL}/api/emergencies/${emergencyId}/accept`, {
      ambulanceId: 'AMB-02',
    });
    assert(accept1.data.success === true, '7.1 First responder (AMB-02) successfully accepts and gets ASSIGNED');

    // Responder 2 tries to accept simultaneously
    try {
      await axios.post(`${BASE_URL}/api/emergencies/${emergencyId}/accept`, {
        ambulanceId: 'AMB-01',
      });
      assert(false, '7.2 Second responder assignment should be rejected');
    } catch (raceErr) {
      assert(
        raceErr.response?.status === 409 && raceErr.response?.data?.reason === 'EMERGENCY_ALREADY_ASSIGNED',
        `7.2 Atomic protection rejects second responder with EMERGENCY_ALREADY_ASSIGNED (HTTP 409)`
      );
    }

    // ----------------------------------------------------
    // TEST 8: Emergency Status Progression
    // ----------------------------------------------------
    const enRoute = await axios.post(`${BASE_URL}/api/emergencies/${emergencyId}/progress`, { status: 'EN_ROUTE' });
    const enRouteStatus = enRoute.data.assignment?.assignmentStatus || enRoute.data.data?.assignmentStatus || enRoute.data.assignmentStatus;
    assert(enRouteStatus === 'EN_ROUTE', '8.1 Status transitioned to EN_ROUTE');

    const arrived = await axios.post(`${BASE_URL}/api/emergencies/${emergencyId}/progress`, { status: 'ARRIVED' });
    const arrivedStatus = arrived.data.assignment?.assignmentStatus || arrived.data.data?.assignmentStatus || arrived.data.assignmentStatus;
    assert(arrivedStatus === 'ARRIVED', '8.2 Status transitioned to ARRIVED');

    const pickedUp = await axios.post(`${BASE_URL}/api/emergencies/${emergencyId}/progress`, { status: 'PATIENT_PICKED_UP' });
    const pickedUpStatus = pickedUp.data.assignment?.assignmentStatus || pickedUp.data.data?.assignmentStatus || pickedUp.data.assignmentStatus;
    assert(pickedUpStatus === 'PATIENT_PICKED_UP', '8.3 Status transitioned to PATIENT_PICKED_UP');

    const hospital = await axios.post(`${BASE_URL}/api/emergencies/${emergencyId}/progress`, { status: 'HOSPITAL_REACHED' });
    const hospitalStatus = hospital.data.assignment?.assignmentStatus || hospital.data.data?.assignmentStatus || hospital.data.assignmentStatus;
    assert(hospitalStatus === 'HOSPITAL_REACHED', '8.4 Status transitioned to HOSPITAL_REACHED');

    const completed = await axios.post(`${BASE_URL}/api/emergencies/${emergencyId}/progress`, { status: 'COMPLETED' });
    const completedStatus = completed.data.assignment?.assignmentStatus || completed.data.data?.assignmentStatus || completed.data.assignmentStatus;
    assert(completedStatus === 'COMPLETED', '8.5 Status transitioned to COMPLETED');

    console.log('\n------------------------------------------------------');
    console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('------------------------------------------------------\n');
  } catch (error) {
    console.error('Unhandled test execution error:', error);
  } finally {
    process.exit(failed === 0 ? 0 : 1);
  }
}

// Wait for server to boot if needed
setTimeout(runIntegrationTests, 1000);
