/**
 * Reusable Voice Service Abstraction for CJack
 * 
 * Architecture:
 * 1. Pluggable Audio Drivers:
 *    - WebSpeechDriver: Browser SpeechSynthesis API with regional BCP-47 voice targeting
 *    - HardwareBridgeDriver: Future-ready integration for on-vest I2S DAC (MAX98357A / ESP32)
 *    - MockAudioDriver: Synthesized tone generator and logging fallback
 * 2. Playback lifecycle events and error isolation
 * 3. Volume and speech rate control
 */

class WebSpeechDriver {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.currentUtterance = null;
  }

  isSupported() {
    return Boolean(this.synth);
  }

  speak(text, { bcp47 = 'en-US', volume = 1, rate = 1.0, pitch = 1.0, onStart, onEnd, onError } = {}) {
    if (!this.synth) {
      if (onError) onError(new Error('Web Speech API not supported in this environment'));
      return;
    }

    try {
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47;
      utterance.volume = Math.max(0, Math.min(1, volume));
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Match regional voice if available
      const voices = this.synth.getVoices ? this.synth.getVoices() : [];
      const matchingVoice = voices.find(v => v.lang === bcp47 || v.lang.startsWith(bcp47.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        this.currentUtterance = null;
        if (onError) onError(err);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      if (onError) onError(err);
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

class HardwareBridgeDriver {
  constructor(endpoint = '/api/voice/broadcast') {
    this.endpoint = endpoint;
    this.isPlaying = false;
  }

  isSupported() {
    return true;
  }

  async speak(text, { stateKey, language, onStart, onEnd, onError } = {}) {
    try {
      if (onStart) onStart();
      this.isPlaying = true;

      // Broadcast to CJack physical hardware bridge
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: stateKey || 'CPR_STARTED', language: language || 'en' })
      });

      if (!response.ok) {
        throw new Error(`Hardware audio bridge returned HTTP ${response.status}`);
      }

      // Simulate hardware speaker duration
      setTimeout(() => {
        this.isPlaying = false;
        if (onEnd) onEnd();
      }, 2500);
    } catch (err) {
      this.isPlaying = false;
      if (onError) onError(err);
    }
  }

  stop() {
    this.isPlaying = false;
  }
}

class MockAudioDriver {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
  }

  isSupported() {
    return true;
  }

  _initContext() {
    if (!this.audioCtx && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
  }

  speak(text, { onStart, onEnd } = {}) {
    if (onStart) onStart();
    this.isPlaying = true;

    // Generate gentle acoustic notification chime
    try {
      this._initContext();
      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.frequency.setValueAtTime(660, this.audioCtx.currentTime); // E5 note
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      // AudioContext may be restricted by autoplay policy
    }

    setTimeout(() => {
      this.isPlaying = false;
      if (onEnd) onEnd();
    }, 2000);
  }

  stop() {
    this.isPlaying = false;
  }
}

class VoiceService {
  constructor() {
    this.drivers = {
      webSpeech: new WebSpeechDriver(),
      hardwareBridge: new HardwareBridgeDriver(),
      mock: new MockAudioDriver()
    };

    // Auto-select preferred driver
    this.activeDriverName = this.drivers.webSpeech.isSupported() ? 'webSpeech' : 'mock';
    this.volume = 0.85; // 85% standard emergency audio level
  }

  setDriver(driverName) {
    if (this.drivers[driverName]) {
      this.activeDriverName = driverName;
    }
  }

  getActiveDriver() {
    return this.drivers[this.activeDriverName] || this.drivers.mock;
  }

  speak(text, options = {}) {
    const driver = this.getActiveDriver();
    const opts = {
      volume: this.volume,
      ...options
    };

    // Primary driver execution with fallback
    driver.speak(text, {
      ...opts,
      onError: (err) => {
        console.warn(`[VoiceService] Driver ${this.activeDriverName} encountered error. Falling back to mock audio:`, err);
        this.drivers.mock.speak(text, opts);
      }
    });
  }

  stop() {
    Object.values(this.drivers).forEach(d => d.stop && d.stop());
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  getVolume() {
    return this.volume;
  }
}

export const voiceService = new VoiceService();
