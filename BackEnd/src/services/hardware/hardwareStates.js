/**
 * CJack Hardware State Enumeration & Constants
 * 
 * Rules:
 * - DO NOT pretend hardware is connected if it is not.
 * - If no physical telemetry arrives within HEARTBEAT_TIMEOUT_MS, state drops to DISCONNECTED.
 * - SIMULATED is explicitly marked as synthetic data and never labeled as live physical hardware.
 */

const HardwareState = Object.freeze({
  SIMULATED: 'SIMULATED',       // Pure software simulation / demo mode. Synthetic data.
  CONNECTED: 'CONNECTED',       // Physical MCU (ESP32/T-Beam) sending live packets within timeout window.
  DISCONNECTED: 'DISCONNECTED', // Physical device mode expected, but no packet received within timeout.
  FAULT: 'FAULT',               // Physical device is communicating, but reports sensor/driver fault.
  UNKNOWN: 'UNKNOWN'            // Subsystem uninitialized, initializing bootloader, or self-test pending.
});

const HARDWARE_TIMEOUTS = Object.freeze({
  HEARTBEAT_TIMEOUT_MS: 8000,    // 8 seconds without a packet triggers DISCONNECTED
  STALE_WARNING_MS: 4000,        // 4 seconds without a packet triggers warning
  RECONNECT_GRACE_MS: 2000       // Grace period on reconnect
});

const HARDWARE_BUS_TYPES = Object.freeze({
  I2C: 'I2C',
  SPI: 'SPI',
  UART: 'UART',
  ADC: 'ADC',
  PWM: 'PWM',
  I2S: 'I2S',
  GPIO: 'GPIO'
});

module.exports = {
  HardwareState,
  HARDWARE_TIMEOUTS,
  HARDWARE_BUS_TYPES
};
