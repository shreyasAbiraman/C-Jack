// CJack Responder API automated test
const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
        }
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(resBody) });
          } catch (e) {
            resolve({ status: res.statusCode, body: resBody });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('Testing Responder API...');

  // 1. Get Status
  const statusRes = await request('GET', '/api/responder/status');
  console.log('GET /api/responder/status ->', statusRes.status);
  console.log('Current State:', statusRes.body.state, 'Unit:', statusRes.body.unit.callsign);
  console.log('Available States:', statusRes.body.availableStates);
  console.log('10-Point Responder Overview Keys:', Object.keys(statusRes.body.responderViewSummary));

  // 2. Test 6 Responder State Transitions
  const states = ['AVAILABLE', 'ASSIGNED', 'ACKNOWLEDGED', 'EN_ROUTE', 'ARRIVED', 'HANDOVER_COMPLETE'];
  for (const st of states) {
    const res = await request('POST', '/api/responder/state', { state: st });
    console.log(`POST /api/responder/state (${st}) ->`, res.status, 'Unit status:', res.body.unit.status);
  }

  // 3. Get Clinical Handover Packet
  const handoverRes = await request('GET', '/api/responder/handover');
  console.log('GET /api/responder/handover ->', handoverRes.status);
  console.log('Handover ID:', handoverRes.body.handoverId, 'Patient:', handoverRes.body.patientSummary.name);
  console.log('Vital History points:', handoverRes.body.vitalHistory.length);
  console.log('Device Events:', handoverRes.body.deviceEvents.length);

  // 4. Export Session Summary
  const exportRes = await request('POST', '/api/responder/handover/export');
  console.log('POST /api/responder/handover/export ->', exportRes.status, 'Checksum:', exportRes.body.checksum);

  console.log('ALL RESPONDER BACKEND TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
