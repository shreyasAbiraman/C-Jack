/**
 * Battery & Power Management Hardware Service
 * 
 * Target hardware: LiFePO4 (4S2P) / TI BQ27441 / MAX17048 Fuel Gauge IC or Calibrated ADC Voltage Divider
 * Interface: I2C (Address: 0x55 or 0x36) or ADC (GPIO 35)
 */

const BaseHardwareModule = require('./BaseHardwareModule');
const { HARDWARE_BUS_TYPES } = require('./hardwareStates');

class BatteryService extends BaseHardwareModule {
  constructor() {
    super({
      id: 'battery',
      name: 'Power & Battery Management System',
      targetChip: 'TI BQ27441 / LiFePO4 4S2P BMS',
      busType: HARDWARE_BUS_TYPES.I2C,
      defaultPinOrAddress: '0x55 (SDA: GPIO21, SCL: GPIO22)'
    });
  }

  processTelemetry(raw) {
    if (!raw) return {};

    const percentage = typeof raw.percentage === 'number' ? raw.percentage : (typeof raw.levelPercentage === 'number' ? raw.levelPercentage : 88);
    const voltage = typeof raw.voltage === 'number' ? raw.voltage : (typeof raw.voltageVolts === 'number' ? raw.voltageVolts : 14.8);
    const currentMa = typeof raw.currentMa === 'number' ? raw.currentMa : 120;
    const isCharging = Boolean(raw.isCharging);
    const isLow = percentage < 20;
    const isCritical = percentage < 10;

    if (this.state !== 'SIMULATED' && isCritical) {
      this.setFault('ERR_BATTERY_CRITICAL', `Battery charge critical (${percentage}%), connect charger immediately`);
    }

    return {
      percentage,
      voltage,
      currentMa,
      isCharging,
      isLow,
      isCritical,
      chemistry: raw.chemistry || 'LiFePO4 (4S2P / 6400mAh)',
      temperatureC: raw.temperatureC || 31.8,
      stateOfHealthPct: raw.stateOfHealthPct || 98,
      status: isCritical ? 'CRITICAL' : isLow ? 'LOW' : isCharging ? 'CHARGING' : 'NOMINAL'
    };
  }
}

module.exports = new BatteryService();
