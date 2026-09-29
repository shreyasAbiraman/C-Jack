/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * Firmware Data Contract Protocol Specification (v1.0.0-hw)
 * 
 * Target Microcontrollers:
 *   - Espressif ESP32-WROOM-32 (Dual Core 240MHz, Wi-Fi / Bluetooth BLE)
 *   - LILYGO TTGO T-Beam v1.1 (ESP32 + Semtech SX1262 LoRa + u-blox NEO-6M GNSS)
 * 
 * Peripheral Sensor & Actuator Bus Mapping:
 *   - ECG: Analog Devices AD8232 / ADS1292R (ADC1_CH0 / GPIO36, LO+: 34, LO-: 35)
 *   - SpO2 / HR: Maxim MAX30102 Optical PPG (I2C: 0x57, SDA: 21, SCL: 22)
 *   - Motion: TDK InvenSense MPU6050 6-Axis IMU (I2C: 0x68, SDA: 21, SCL: 22)
 *   - Respiration: Thoracic Piezo Strain Transducer (ADC1_CH3 / GPIO39)
 *   - Load Cell: Avia Semiconductor HX711 24-bit Dual 500N (DOUT: 16, SCK: 4)
 *   - CPR Motor: TI DRV8825 / BTS7960 43A H-Bridge (PWM: 25, DIR: 26, EN: 27)
 *   - GNSS: u-blox NEO-6M GPS (UART1, RX: 34, TX: 12, 9600 Baud)
 *   - LoRa: Semtech SX1262 Sub-GHz (SPI, CS: 18, SCK: 5, MISO: 19, MOSI: 27, DIO1: 23)
 *   - Battery: LiFePO4 4S2P / TI BQ27441 Fuel Gauge (I2C: 0x55)
 *   - Display: Solomon Systech SSD1306 128x64 OLED (I2C: 0x3C)
 *   - Speaker: Maxim MAX98357A I2S DAC (BCLK: 26, LRC: 25, DIN: 22)
 * ==============================================================================
 */

#ifndef CJACK_PROTOCOL_H
#define CJACK_PROTOCOL_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* -------------------------------------------------------------------------- */
/* Hardware State Enumeration                                                 */
/* -------------------------------------------------------------------------- */
typedef enum {
    CJACK_STATE_SIMULATED    = 0,
    CJACK_STATE_CONNECTED    = 1,
    CJACK_STATE_DISCONNECTED = 2,
    CJACK_STATE_FAULT        = 3,
    CJACK_STATE_UNKNOWN      = 4
} cjack_hardware_state_t;

/* -------------------------------------------------------------------------- */
/* Sensor Data Structures                                                     */
/* -------------------------------------------------------------------------- */
typedef struct {
    bool     leadsConnected;
    bool     leadOffPlus;
    bool     leadOffMinus;
    float    rawMv;
    uint16_t heartRate;
    uint8_t  signalQuality;  /* 0 - 100% */
    uint16_t impedanceOhm;
} cjack_ecg_data_t;

typedef struct {
    uint8_t percentage;      /* 0 - 100% */
    float   perfusionIndex;  /* e.g. 4.2 */
    bool    fingerDetected;
    bool    ambientLightFault;
    float   redIrRatio;
} cjack_spo2_data_t;

typedef struct {
    float ax;                /* g-force X */
    float ay;                /* g-force Y */
    float az;                /* g-force Z */
    float gx;                /* deg/sec X */
    float gy;                /* deg/sec Y */
    float gz;                /* deg/sec Z */
    bool  fallDetected;
    bool  convulsionDetected;
    char  posture[16];       /* "SUPINE", "PRONE", "UPRIGHT" */
} cjack_motion_data_t;

typedef struct {
    uint8_t rate;            /* breaths per minute */
    uint8_t amplitude;       /* relative strain 0-100 */
    bool    sensorFault;
    char    pattern[16];     /* "EUPNEA", "APNEA", "TACHYPNEA" */
} cjack_respiration_data_t;

typedef struct {
    cjack_ecg_data_t         ecg;
    uint16_t                 heartRate;
    cjack_spo2_data_t        spo2;
    cjack_motion_data_t      motion;
    cjack_respiration_data_t respiration;
} cjack_sensors_t;

/* -------------------------------------------------------------------------- */
/* CPR Actuator & Feedback Data                                               */
/* -------------------------------------------------------------------------- */
typedef struct {
    bool     active;
    uint16_t rate;           /* compressions per minute */
    float    depth;          /* sternal compression depth in mm */
    float    force;          /* sternal compression force in Newtons */
    uint32_t compressionCount;
    char     motorStatus[24];/* "STANDBY", "ACTIVE", "OVERHEAT", "FAULT" */
    float    driverTempC;
    bool     fault;
} cjack_cpr_t;

/* -------------------------------------------------------------------------- */
/* GNSS Positioning Data                                                      */
/* -------------------------------------------------------------------------- */
typedef struct {
    double  latitude;
    double  longitude;
    float   accuracy;        /* CEP in meters */
    char    fixType[12];     /* "NO_FIX", "2D_FIX", "3D_FIX" */
    uint8_t satellites;
    float   altitudeMeters;
} cjack_location_t;

/* -------------------------------------------------------------------------- */
/* Connectivity Status                                                        */
/* -------------------------------------------------------------------------- */
typedef struct {
    char  gps[16];           /* "LOCKED", "SEARCHING", "OFFLINE" */
    char  lora[16];          /* "JOINED", "TRANSMITTING", "OFFLINE" */
    char  backend[16];       /* "CONNECTED", "RETRYING", "OFFLINE" */
    int16_t loraRssi;        /* dBm, e.g. -72 */
    float   loraSnr;         /* dB, e.g. 9.5 */
} cjack_connectivity_t;

/* -------------------------------------------------------------------------- */
/* Battery & Power Management Data                                            */
/* -------------------------------------------------------------------------- */
typedef struct {
    uint8_t percentage;      /* 0 - 100% */
    float   voltage;         /* Volts, e.g. 14.8 */
    int16_t currentMa;       /* mA drain */
    bool    isCharging;
    bool    fault;
    char    status[16];      /* "NOMINAL", "LOW", "CRITICAL", "CHARGING" */
} cjack_battery_t;

/* -------------------------------------------------------------------------- */
/* Top-Level Master Telemetry Packet                                          */
/* -------------------------------------------------------------------------- */
typedef struct {
    char                 deviceId[32];        /* e.g. "CJACK-ESP32-01" */
    char                 firmwareVersion[16]; /* e.g. "v1.0.0-hw" */
    uint64_t             timestampMs;         /* Epoch timestamp */
    char                 hardwareSource[12];  /* "PHYSICAL" */
    cjack_sensors_t      sensors;
    cjack_cpr_t          cpr;
    cjack_location_t     location;
    cjack_connectivity_t connectivity;
    cjack_battery_t      battery;
} cjack_telemetry_packet_t;

#ifdef __cplusplus
}
#endif

#endif /* CJACK_PROTOCOL_H */
