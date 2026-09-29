/**
 * GPS & GNSS Hardware Service
 * 
 * Target hardware: u-blox NEO-6M / NEO-M8N / LILYGO T-Beam on-board GNSS Receiver
 * Interface: UART Serial (ESP32 RX: GPIO 34, TX: GPIO 12, Baud: 9600 / 115200)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class GpsService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'gps',
      name: 'GNSS / GPS Receiver (NEO-6M)',
      targetChip: 'u-blox NEO-6M / T-Beam GNSS Engine',
      busType: HARDWARE_BUS_TYPES.UART,
      defaultPinOrAddress: 'UART1 (RX: GPIO34, TX: GPIO12, Baud: 9600)'
    });
  }

  processTelemetry(raw) {
    if (!raw) return {};

    const latitude = typeof raw.latitude === 'number' ? raw.latitude : 12.9716;
    const longitude = typeof raw.longitude === 'number' ? raw.longitude : 77.5946;
    const accuracy = typeof raw.accuracy === 'number' ? raw.accuracy : 2.5;
    const satellites = typeof raw.satellites === 'number' ? raw.satellites : 11;
    const fixType = raw.fixType || (satellites >= 4 ? '3D_FIX' : satellites >= 3 ? '2D_FIX' : 'NO_FIX');
    const isLocked = fixType === '3D_FIX' || fixType === '2D_FIX' || raw.gps === 'LOCKED';

    if (this.state !== 'SIMULATED' && !isLocked) {
      this.setFault('WARN_GPS_NO_FIX', 'GPS antenna has not acquired satellite constellation lock');
    }

    return {
      latitude,
      longitude,
      accuracy,
      satellites,
      fixType,
      isLocked,
      altitudeMeters: raw.altitudeMeters || 920,
      speedKmh: raw.speedKmh || 0,
      hdop: raw.hdop || 0.9,
      nmeaValid: isLocked
    };
  }
}

module.exports = new GpsService();
