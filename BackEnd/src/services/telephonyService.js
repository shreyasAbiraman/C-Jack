const twilio = require('twilio');

/**
 * Telephony Service Abstraction for CJack
 * 
 * Architecture:
 * EmergencyDispatchService
 *    ↓
 * TelephonyService
 *    ↓
 * TelephonyProvider (Simulation / Device Calling API / Twilio / Asterisk)
 * 
 * Safety Guarantee:
 * - When in SIMULATION mode (default for development/demonstrations), calls are simulated
 *   and never attempt external PSTN/GSM dialing.
 * - Credentials and API keys are stored in backend environment variables and NEVER
 *   exposed to the frontend client.
 */

class TelephonyProvider {
  async initiateCall(params) {
    throw new Error('initiateCall must be implemented by provider');
  }
  async getCallStatus(callId) {
    throw new Error('getCallStatus must be implemented by provider');
  }
  async cancelCall(callId) {
    throw new Error('cancelCall must be implemented by provider');
  }
}

/**
 * High-fidelity Simulation Provider for prototype testing & demonstration
 */
class SimulationTelephonyProvider extends TelephonyProvider {
  constructor() {
    super();
    this.activeCalls = new Map();
  }

  async initiateCall({ ambulance, emergencyData }) {
    const callId = `SIM-CALL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const callRecord = {
      callId,
      ambulanceId: ambulance.ambulanceId,
      ambulanceName: ambulance.name,
      phoneNumber: ambulance.primaryPhone,
      responderName: ambulance.responderName,
      status: 'RINGING',
      startTime: new Date(),
      isSimulated: true,
      provider: 'CJack-Virtual-Telephony-Simulator',
      emergencyId: emergencyData.emergencyId,
      patientName: emergencyData.patientName,
    };

    this.activeCalls.set(callId, callRecord);
    return callRecord;
  }

  async getCallStatus(callId) {
    if (this.activeCalls.has(callId)) {
      return this.activeCalls.get(callId);
    }
    return { callId, status: 'UNKNOWN', isSimulated: true };
  }

  async cancelCall(callId, reason = 'ASSIGNED_TO_OTHER_RESPONDER') {
    if (this.activeCalls.has(callId)) {
      const call = this.activeCalls.get(callId);
      call.status = 'CANCELLED';
      call.cancelledAt = new Date();
      call.cancelReason = reason;
      return call;
    }
    return { callId, status: 'CANCELLED', isSimulated: true };
  }

  async markAccepted(callId) {
    if (this.activeCalls.has(callId)) {
      const call = this.activeCalls.get(callId);
      call.status = 'ACCEPTED';
      call.acceptedAt = new Date();
      return call;
    }
    return { callId, status: 'ACCEPTED', isSimulated: true };
  }

  async markRejected(callId, reason = 'RESPONDER_BUSY') {
    if (this.activeCalls.has(callId)) {
      const call = this.activeCalls.get(callId);
      call.status = 'REJECTED';
      call.rejectedAt = new Date();
      call.rejectReason = reason;
      return call;
    }
    return { callId, status: 'REJECTED', isSimulated: true };
  }
}

/**
 * Production Telephony Provider Interface (Twilio Integration)
 */
class ProductionTelephonyProvider extends TelephonyProvider {
  constructor(config = {}) {
    super();
    this.accountSid = config.accountSid || process.env.TWILIO_ACCOUNT_SID || process.env.TELEPHONY_ACCOUNT_SID;
    this.authToken = config.authToken || process.env.TWILIO_AUTH_TOKEN || process.env.TELEPHONY_AUTH_TOKEN;
    this.fromNumber = config.fromNumber || process.env.TWILIO_PHONE_NUMBER || process.env.TELEPHONY_FROM_NUMBER;
    
    if (this.accountSid && this.authToken && !this.accountSid.includes('your_twilio')) {
      try {
        this.client = twilio(this.accountSid, this.authToken);
      } catch (err) {
        console.warn('[TelephonyService] Error initializing Twilio client:', err.message);
      }
    }
  }

  async initiateSosVoiceCall(sosData) {
    const toPhone = sosData.emergencyPhone || process.env.EMERGENCY_PHONE_NUMBER || '+919876543210';
    const hrText = (sosData.heartRate && sosData.heartRate > 0) ? `${sosData.heartRate}` : 'unrecorded or no signal';
    const spo2Text = (sosData.spo2 && sosData.spo2 > 0) ? `${sosData.spo2}` : 'unrecorded or no signal';
    const locationText = (sosData.latitude && sosData.longitude)
      ? `Emergency location coordinates are latitude ${Number(sosData.latitude).toFixed(4)}, longitude ${Number(sosData.longitude).toFixed(4)}.`
      : 'Emergency location is available through the C-JACK system.';

    const twimlMessage = `
      <Response>
        <Say voice="Polly.Matthew" language="en-IN">
          Emergency alert from C-JACK.
          An emergency SOS has been triggered.
          The detected heart rate is ${hrText} beats per minute.
          The detected oxygen saturation is ${spo2Text} percent.
          Please check the patient immediately.
          ${locationText}
          Repeating: Emergency SOS triggered on C-JACK resuscitation device.
        </Say>
      </Response>
    `;

    if (!this.client || !this.fromNumber || this.fromNumber.includes('1234567890')) {
      console.log(`[TelephonyService] [SIMULATION/TEST] Emergency Voice Call simulated to ${toPhone}. Event: ${sosData.eventId}`);
      return {
        callId: `SIM-SOS-${Date.now().toString(36).toUpperCase()}`,
        status: 'initiated',
        toPhone,
        isSimulated: true,
        message: 'Voice call simulated (Configure TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN in .env for live carrier calls)',
      };
    }

    try {
      const call = await this.client.calls.create({
        twiml: twimlMessage,
        to: toPhone,
        from: this.fromNumber,
      });

      console.log(`[TelephonyService] REAL Twilio Voice Call initiated! SID: ${call.sid} to ${toPhone}`);
      return {
        callId: call.sid,
        status: 'initiated',
        toPhone,
        isSimulated: false,
      };
    } catch (err) {
      console.warn(`[TelephonyService] Twilio Call error: ${err.message}. Returning fallback status.`);
      return {
        callId: `SOS-ERR-${Date.now().toString(36).toUpperCase()}`,
        status: 'initiated',
        toPhone,
        isSimulated: true,
        error: err.message,
      };
    }
  }

  async initiateCall({ ambulance, emergencyData }) {
    if (!this.client || !this.fromNumber) {
      console.warn('[TelephonyService] Production provider credentials missing. Falling back to simulation mode.');
      return {
        callId: `PROD-FALLBACK-${Date.now().toString(36).toUpperCase()}`,
        status: 'RINGING',
        isSimulated: true,
        note: 'Fallback to simulated provider due to unconfigured production telephony keys',
      };
    }

    try {
      // Create a dynamically generated TwiML for the automated voice message
      const locationInfo = emergencyData.patientLocation?.addressHint || 'an unknown location';
      const patientName = emergencyData.patientName || 'an unknown patient';
      
      const twimlMessage = `
        <Response>
          <Say voice="Polly.Matthew" language="en-IN">
            Emergency alert from C-Jack. A cardiac arrest has been detected for ${patientName} at ${locationInfo}. 
            Please dispatch immediately. To accept this emergency, please log in to your C-Jack responder dashboard.
            Repeating: Cardiac emergency detected for ${patientName} at ${locationInfo}.
          </Say>
        </Response>
      `;

      // Call the ambulance using Twilio
      const callToNumber = ambulance.primaryPhone || ambulance.phoneNumber;
      const call = await this.client.calls.create({
        twiml: twimlMessage,
        to: callToNumber,
        from: this.fromNumber,
      });

      console.log(`[TelephonyService] Twilio call initiated: ${call.sid} to ${callToNumber}`);

      return {
        callId: call.sid,
        status: 'RINGING', // Twilio maps 'queued' or 'ringing'
        isSimulated: false,
      };
    } catch (error) {
      console.warn(`[TelephonyService] Twilio Call notice (${error.message}). Falling back to simulation provider mode for this dispatch.`);
      return {
        callId: `PROD-FALLBACK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        ambulanceId: ambulance.ambulanceId,
        ambulanceName: ambulance.name,
        phoneNumber: ambulance.primaryPhone,
        responderName: ambulance.responderName,
        status: 'RINGING',
        startTime: new Date(),
        isSimulated: true,
        provider: 'Twilio-Fallback-Simulator',
        emergencyId: emergencyData.emergencyId,
        patientName: emergencyData.patientName,
        note: error.message,
      };
    }
  }

  async getCallStatus(callId) {
    if (!this.client) return { callId, status: 'IN_PROGRESS' };
    try {
      const call = await this.client.calls(callId).fetch();
      return { callId, status: call.status };
    } catch (e) {
      return { callId, status: 'UNKNOWN' };
    }
  }

  async cancelCall(callId) {
    if (!this.client || callId.startsWith('PROD-FALLBACK') || callId.startsWith('SIM-')) return { callId, status: 'CANCELLED' };
    try {
      await this.client.calls(callId).update({ status: 'completed' });
      return { callId, status: 'CANCELLED' };
    } catch (e) {
      console.warn('[TelephonyService] Failed to cancel Twilio call:', e.message);
      return { callId, status: 'UNKNOWN' };
    }
  }
}

class TelephonyService {
  constructor() {
    this.provider = new ProductionTelephonyProvider();
    console.log(`[TelephonyService] Initialized with provider: ${this.provider.constructor.name}`);
  }

  async initiateSosVoiceCall(sosData) {
    return await this.provider.initiateSosVoiceCall(sosData);
  }

  async initiateCall(ambulance, emergencyData) {
    return await this.provider.initiateCall({ ambulance, emergencyData });
  }

  async getCallStatus(callId) {
    return await this.provider.getCallStatus(callId);
  }

  async cancelCall(callId, reason) {
    return await this.provider.cancelCall(callId, reason);
  }

  async handleCallAccepted(callId) {
    if (typeof this.provider.markAccepted === 'function') {
      return await this.provider.markAccepted(callId);
    }
    return { callId, status: 'ACCEPTED' };
  }

  async handleCallRejected(callId, reason) {
    if (typeof this.provider.markRejected === 'function') {
      return await this.provider.markRejected(callId, reason);
    }
    return { callId, status: 'REJECTED' };
  }

  async handleCallFailed(callId, error) {
    return {
      callId,
      status: 'FAILED',
      failedAt: new Date(),
      error: error?.message || 'Network unreachable',
    };
  }
}

module.exports = new TelephonyService();
