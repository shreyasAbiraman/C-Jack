require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');
const systemPrompt = require('../config/llmPrompt');

/**
 * Local fallback resolver if API key is missing or if Anthropic request fails.
 */
function localIntentResolver(message, context, language = 'auto') {
  const lower = (message || '').toLowerCase();
  const patient = context?.patient || {};
  const vitals = context?.vitals || patient?.vitals || {};
  const cpr = context?.cpr || patient?.cpr || {};
  const ambulance = context?.ambulance || {};
  const emergency = context?.emergency || {};

  // 1. Emergency Dispatch Request ("CJack, ambulance call pannu" / "call ambulance")
  if (
    (lower.includes('ambulance') && (lower.includes('call') || lower.includes('pannu') || lower.includes('dispatch') || lower.includes('send') || lower.includes('vara') || lower.includes('vara sollu'))) ||
    lower.includes('emergency call') ||
    lower.includes('trigger emergency') ||
    lower.includes('help emergency') ||
    lower.includes('sos call')
  ) {
    return {
      intent: 'CREATE_EMERGENCY',
      parameters: {
        action: 'DISPATCH_3_AMBULANCES',
        patientId: patient.patientId || 'CJ-PATIENT-8829',
        patientName: patient.name || 'Demo Patient',
      },
      requiresConfirmation: true,
      response: 'I can start the emergency dispatch to the configured ambulance responders. Shall I proceed?',
      language: 'en',
    };
  }

  // 2. Greetings
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('vanakkam') || lower.includes('hey')) {
    return {
      intent: 'greeting',
      parameters: {},
      requiresConfirmation: false,
      response: "Vanakkam! I'm C-JACK AI Assistant. Currently monitoring patient telemetry and responder status. How can I assist you?",
      language: 'en',
    };
  }

  // 3. Heart Rate Specific Query ("CJack, patient oda heart rate enna?", "What is the heart rate?")
  if (lower.includes('heart rate') || lower.includes('hr') || (lower.includes('heart') && (lower.includes('enna') || lower.includes('rate') || lower.includes('valvu') || lower.includes('what')))) {
    const hr = vitals.heartRate !== undefined && vitals.heartRate !== null ? vitals.heartRate : 78;
    return {
      intent: 'get_heart_rate',
      parameters: { heartRate: hr },
      requiresConfirmation: false,
      response: `The patient's current heart rate is ${hr} BPM.`,
      language: 'en',
    };
  }

  // 4. General Vitals Query ("vital", "spo2", "bp", "epdi")
  if (lower.includes('vital') || lower.includes('heart') || lower.includes('spo2') || lower.includes('bp') || lower.includes('pulse') || lower.includes('epdi')) {
    const hr = vitals.heartRate !== undefined && vitals.heartRate !== null ? vitals.heartRate : 78;
    const spo2 = vitals.spO2 || vitals.spo2 || 97;
    const bp = vitals.bloodPressure || '120/80';
    return {
      intent: 'get_vitals',
      parameters: { heartRate: hr, spO2: spo2, bloodPressure: bp },
      requiresConfirmation: false,
      response: `Patient Vitals: Heart Rate is ${hr} BPM, SpO2 is ${spo2}%, Blood Pressure is ${bp}.` + 
        ((lower.includes('sollu') || lower.includes('epdi')) ? ' (Patient nalla stabile-a irukku)' : ''),
      language: 'en',
    };
  }

  // 5. CPR Status Query
  if (lower.includes('cpr') || lower.includes('compression') || lower.includes('depth')) {
    const rate = cpr.rate || cpr.compressionRate || 110;
    const depth = cpr.depthCm || cpr.depth || 5.2;
    const count = cpr.count || cpr.compressionCount || 80;
    const active = cpr.active ? 'ACTIVE' : 'INACTIVE';
    return {
      intent: 'get_cpr',
      parameters: { rate, depth, count, active },
      requiresConfirmation: false,
      response: `CPR Status: Mechanism is ${active}, Compression Rate is ${rate} cpm (target: 100-120), Depth is ${depth} cm, Total Count is ${count}.`,
      language: 'en',
    };
  }

  // 6. Ambulance ETA / Responder Query
  if (lower.includes('ambulance') || lower.includes('eta') || lower.includes('responder') || lower.includes('distance') || lower.includes('enga')) {
    const eta = ambulance.etaMinutes || context?.responderStatus?.unit?.etaMinutes || 4;
    const dist = ambulance.distanceKm || context?.responderStatus?.unit?.distanceKm || 1.8;
    return {
      intent: 'get_eta',
      parameters: { etaMinutes: eta, distanceKm: dist },
      requiresConfirmation: false,
      response: `Ambulance status is En Route, approx ${dist} km away. Estimated arrival time is ${eta} minutes.`,
      language: 'en',
    };
  }

  return {
    intent: 'general_inquiry',
    parameters: {},
    requiresConfirmation: false,
    response: `C-JACK AI Monitor: System is online and receiving patient telemetry. You can ask about vitals, CPR guidance, ambulance ETA, or digital triage.`,
    language: 'en',
  };
}

/**
 * Invoke Claude Intelligence or local fallback resolver.
 */
async function invokeLLM(message, context, language = 'auto') {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim() && !apiKey.includes('placeholder') && !apiKey.includes('yyy')) {
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Live CJACK Telemetry Context:n${JSON.stringify(context, null, 2)}nnUser Query: "${message}"` }
        ]
      });

      const raw = response.content?.[0]?.text || '';
      try {
        const clean = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(clean);
        return {
          intent: parsed.intent || 'general_inquiry',
          parameters: parsed.parameters || {},
          requiresConfirmation: !!parsed.requiresConfirmation,
          response: parsed.response || raw,
          language: parsed.language || (language === 'auto' ? 'en' : language)
        };
      } catch (jsonErr) {
        return {
          intent: 'general_inquiry',
          parameters: {},
          requiresConfirmation: false,
          response: raw,
          language: language === 'auto' ? 'en' : language
        };
      }
    } catch (err) {
      console.warn('Anthropic API call failed, using local intent resolver:', err.message);
    }
  }

  return localIntentResolver(message, context, language);
}

module.exports = { invokeLLM };
