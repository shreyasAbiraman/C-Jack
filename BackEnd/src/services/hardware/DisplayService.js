/**
 * Display Hardware Service
 * 
 * Target hardware: Solomon Systech SSD1306 0.96" / 1.3" 128x64 Monochrome I2C OLED Display
 * Interface: I2C (Address: 0x3C, ESP32 SDA: GPIO 21, SCL: GPIO 22)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class DisplayService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'display',
      name: 'Vest OLED Status Display (SSD1306)',
      targetChip: 'Solomon Systech SSD1306 (128x64)',
      busType: HARDWARE_BUS_TYPES.I2C,
      defaultPinOrAddress: '0x3C (SDA: GPIO21, SCL: GPIO22)'
    });

    this.activeScreen = 'STATUS_MONITOR';
    this.brightness = 255;
    this.screenContent = {
      line1: 'C-JACK SYSTEM',
      line2: 'STATUS: READY',
      line3: 'HR: -- | SPO2: --',
      line4: 'CPR: STANDBY'
    };
  }

  processTelemetry(raw) {
    if (!raw) return {};

    return {
      activeScreen: raw.activeScreen || this.activeScreen,
      brightness: raw.brightness !== undefined ? raw.brightness : this.brightness,
      screenContent: raw.screenContent || this.screenContent,
      resolution: '128x64 px',
      refreshRateHz: raw.refreshRateHz || 30,
      displayReady: true
    };
  }

  // Downlink command to update physical OLED display
  updateDisplay({ activeScreen, line1, line2, line3, line4, brightness }) {
    if (activeScreen) this.activeScreen = activeScreen;
    if (brightness !== undefined) this.brightness = brightness;
    this.screenContent = {
      line1: line1 || this.screenContent.line1,
      line2: line2 || this.screenContent.line2,
      line3: line3 || this.screenContent.line3,
      line4: line4 || this.screenContent.line4
    };

    return {
      command: 'UPDATE_DISPLAY',
      activeScreen: this.activeScreen,
      brightness: this.brightness,
      screenContent: this.screenContent,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new DisplayService();
