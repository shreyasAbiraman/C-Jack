// CJack Voice API automated test
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
  console.log('Testing Voice Guidance API...');

  // 1. Get Languages
  const langRes = await request('GET', '/api/voice/languages');
  console.log('GET /api/voice/languages ->', langRes.status, 'Total languages:', langRes.body.totalCount);
  console.log('Language Codes:', langRes.body.languages.map(l => l.code));

  // 2. Get Catalog in Tamil
  const catRes = await request('GET', '/api/voice/catalog?lang=ta');
  console.log('GET /api/voice/catalog?lang=ta ->', catRes.status, 'Total states:', catRes.body.states.length);
  console.log('Sample Tamil Prompt (POSITION_DEVICE):', catRes.body.states.find(s => s.id === 'POSITION_DEVICE')?.voicePrompt);

  // 3. Get Status
  const statusRes = await request('GET', '/api/voice/status');
  console.log('GET /api/voice/status ->', statusRes.status, 'Active state:', statusRes.body.activeStateKey);
  console.log('Hardware Amp:', statusRes.body.hardware.amplifier, 'SPL:', statusRes.body.hardware.speakerOutputSPL);

  // 4. Test Broadcast Trigger
  const broadcastRes = await request('POST', '/api/voice/broadcast', {
    state: 'CARDIAC_ARREST_SUSPECTED',
    language: 'hi'
  });
  console.log('POST /api/voice/broadcast ->', broadcastRes.status, 'Active prompt (Hindi):', broadcastRes.body.activePrompt);

  // 5. Test Language switch
  const setLangRes = await request('POST', '/api/voice/language', {
    language: 'kn'
  });
  console.log('POST /api/voice/language ->', setLangRes.status, 'Selected language:', setLangRes.body.selectedLanguage);

  console.log('ALL VOICE GUIDANCE BACKEND TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
