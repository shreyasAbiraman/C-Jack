/**
 * Speaker & Acoustic Feedback Hardware Service
 * 
 * Target hardware: Maxim MAX98357A I2S Class-D Audio Amplifier / Piezo Metronome Buzzer
 * Interface: I2S Digital Audio (ESP32 BCLK: GPIO 26, LRC/WS: GPIO 25, DIN: GPIO 22) or PWM Buzzer (GPIO 14)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class SpeakerService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'speaker',
      name: 'I2S Audio Speaker & Metronome',
      targetChip: 'Maxim MAX98357A I2S DAC / 3W Speaker',
      busType: HARDWARE_BUS_TYPES.I2S,
      defaultPinOrAddress: 'BCLK: GPIO26, LRC: GPIO25, DIN: GPIO22'
    });

    this.volume = 80;
    this.metronomeActive = false;
    this.metronomeBpm = 110;
    this.currentVoicePrompt = null;
    this.isMuted = false;
  }

  processTelemetry(raw) {
    if (!raw) return {};

    return {
      volume: raw.volume !== undefined ? raw.volume : this.volume,
      isMuted: raw.isMuted !== undefined ? Boolean(raw.isMuted) : this.isMuted,
      metronomeActive: raw.metronomeActive !== undefined ? Boolean(raw.metronomeActive) : this.metronomeActive,
      metronomeBpm: raw.metronomeBpm || this.metronomeBpm,
      currentVoicePrompt: raw.currentVoicePrompt || this.currentVoicePrompt,
      impedanceOhm: 4,
      dacOutputHealthy: true
    };
  }

  // Downlink command to play audio cues / metronome
  playMetronome(bpm = 110) {
    this.metronomeActive = true;
    this.metronomeBpm = bpm;
    return {
      command: 'PLAY_METRONOME',
      bpm,
      frequencyHz: 880,
      timestamp: new Date().toISOString()
    };
  }

  stopMetronome() {
    this.metronomeActive = false;
    return {
      command: 'STOP_METRONOME',
      timestamp: new Date().toISOString()
    };
  }

  playVoiceCue(promptId, phrase) {
    this.currentVoicePrompt = promptId;
    return {
      command: 'PLAY_VOICE_CUE',
      promptId,
      phrase,
      timestamp: new Date().toISOString()
    };
  }

  setVolume(volumePct) {
    this.volume = Math.max(0, Math.min(100, volumePct));
    return {
      command: 'SET_VOLUME',
      volume: this.volume,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new SpeakerService();
