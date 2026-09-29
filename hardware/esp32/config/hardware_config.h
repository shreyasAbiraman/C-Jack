/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * Hardware Configuration Header (hardware_config.h)
 * ==============================================================================
 * Centralized Hardware Settings:
 * - Microcontroller: Espressif ESP32-WROOM-32 (Dual Core 240MHz)
 * - Display: 3.5" TFT LCD (ILI9488 / ILI9486 Parallel or SPI) or ST7789
 * - Sensors: MAX30102 / MAX30100 Pulse Oximeter & Heart Rate Module
 * ==============================================================================
 */

#ifndef HARDWARE_CONFIG_H
#define HARDWARE_CONFIG_H

#include <Arduino.h>

// ------------------------------------------------------------------------------
// 1. Device Identification & Firmware
// ------------------------------------------------------------------------------
#define DEVICE_ID           "CJACK-001"
#define DEVICE_NAME         "CJack Resuscitation MCU"
#define FIRMWARE_VERSION    "v2.0.0-tft-live"
#define HARDWARE_SOURCE_TAG "REAL_HARDWARE"

// ------------------------------------------------------------------------------
// 2. Display Configuration
// ------------------------------------------------------------------------------
#define TFT_DRIVER_ILI9488  1
#define TFT_WIDTH           480
#define TFT_HEIGHT          320
#define TFT_ROTATION        1   // 1 = Landscape (pins top/bottom)

// Parallel 8-Bit Pin Map (ILI9488/ILI9486 on ESP32)
#define PIN_TFT_RST         32
#define PIN_TFT_CS          33
#define PIN_TFT_DC          15  // RS
#define PIN_TFT_WR          4
#define PIN_TFT_RD          2

#define PIN_TFT_D0          12
#define PIN_TFT_D1          13
#define PIN_TFT_D2          26
#define PIN_TFT_D3          25
#define PIN_TFT_D4          17
#define PIN_TFT_D5          16
#define PIN_TFT_D6          27
#define PIN_TFT_D7          14

// ------------------------------------------------------------------------------
// 3. Heart Rate & SpO2 Sensor Configuration (MAX30102 / MAX30100)
// ------------------------------------------------------------------------------
#define HR_SENSOR_MAX30102  1
#define HR_SENSOR_MAX30100  2
#define HR_SENSOR_AUTO      0

#define SELECTED_HR_SENSOR  HR_SENSOR_AUTO  // Auto-detects MAX30102 or MAX30100 at runtime

#define I2C_SDA             21
#define I2C_SCL             22
#define I2C_FREQUENCY       400000          // 400kHz Fast I2C

#define PIN_PULSE_ANALOG    34              // 3-Pin Analog Pulse Sensor (ADC1 GPIO 34 / D34)
#define MAX3010X_I2C_ADDR   0x57            // Standard I2C address for MAX30100/MAX30102

// Sensor Thresholds & Calibration
#define FINGER_THRESHOLD_IR 50000           // Minimum raw IR reading for finger contact
#define MIN_VALID_BPM       40
#define MAX_VALID_BPM       220
#define MIN_VALID_SPO2      70
#define MAX_VALID_SPO2      100

// ------------------------------------------------------------------------------
// 4. Network & Server Settings
// ------------------------------------------------------------------------------
#define DEFAULT_WIFI_SSID   "Shreyas’s iPhone"
#define DEFAULT_WIFI_PASS   "Shreyas2006"

// Node.js Backend Endpoints
#define BACKEND_HOST        "10.196.94.231"
#define BACKEND_PORT        5000
#define BACKEND_VITALS_API  "/api/device/vitals"
#define BACKEND_SOS_API     "/api/emergency/sos"
#define BACKEND_WS_PATH     "/ws/telemetry"
#define HARDWARE_API_KEY    "cjack_dev_hw_key_2026"

// ------------------------------------------------------------------------------
// 5. Execution Timings & Interval Rates
// ------------------------------------------------------------------------------
#define SENSOR_SAMPLE_INTERVAL_MS   20      // 50Hz Sensor Sampling
#define TFT_RENDER_INTERVAL_MS      66      // ~15 FPS Smooth Dynamic Display
#define TELEMETRY_POST_INTERVAL_MS  1000    // 1Hz REST/WebSocket Sync
#define SENSOR_RETRY_INTERVAL_MS    3000    // 3s interval if sensor disconnected

#endif // HARDWARE_CONFIG_H
