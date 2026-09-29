/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * MAX30102 Pulse Oximetry & Heart-Rate Sensor Driver (MAX30102Sensor.h)
 * ==============================================================================
 * Implements HeartRateSensor abstraction for Maxim MAX30102 high-sensitivity PPG.
 * Features:
 * - Direct I2C register configuration (LED current, sample averaging, pulse width)
 * - DC removal filter + moving average peak detection for stable BPM computation
 * - Red/IR ratio algorithm for SpO2 calculation
 * - Optical tissue detection (prevents displaying readings when sensor is off finger)
 * ==============================================================================
 */

#ifndef MAX30102_SENSOR_H
#define MAX30102_SENSOR_H

#include <Wire.h>
#include "HeartRateSensor.h"
#include "../config/hardware_config.h"

// MAX30102 Register Addresses
#define MAX30102_INT_STAT_1    0x00
#define MAX30102_INT_STAT_2    0x01
#define MAX30102_INT_EN_1      0x02
#define MAX30102_INT_EN_2      0x03
#define MAX30102_FIFO_WR_PTR   0x04
#define MAX30102_OVF_COUNTER   0x05
#define MAX30102_FIFO_RD_PTR   0x06
#define MAX30102_FIFO_DATA     0x07
#define MAX30102_FIFO_CONFIG   0x08
#define MAX30102_MODE_CONFIG   0x09
#define MAX30102_SPO2_CONFIG   0x0A
#define MAX30102_LED1_PA       0x0C // Red LED pulse amplitude
#define MAX30102_LED2_PA       0x0D // IR LED pulse amplitude
#define MAX30102_PART_ID       0xFF // Expected: 0x15

class MAX30102Sensor : public HeartRateSensor {
private:
    bool initialized;
    SensorStatus currentStatus;
    
    // PPG Signal Processing Variables
    uint32_t rawRed;
    uint32_t rawIR;
    float dcFilteredIR;
    float dcFilteredRed;
    
    // Beat Detection Variables
    unsigned long lastBeatTime;
    int beatIntervals[4];
    int beatIntervalIndex;
    int currentBPM;
    int currentSpO2;
    float perfusionIndex;
    bool fingerOnSensor;

    void writeRegister(uint8_t reg, uint8_t val) {
        Wire.beginTransmission(MAX3010X_I2C_ADDR);
        Wire.write(reg);
        Wire.write(val);
        Wire.endTransmission();
    }

    uint8_t readRegister(uint8_t reg) {
        Wire.beginTransmission(MAX3010X_I2C_ADDR);
        Wire.write(reg);
        Wire.endTransmission(false);
        Wire.requestFrom((uint8_t)MAX3010X_I2C_ADDR, (uint8_t)1);
        if (Wire.available()) {
            return Wire.read();
        }
        return 0;
    }

public:
    MAX30102Sensor() :
        initialized(false),
        currentStatus(SENSOR_DISCONNECTED),
        rawRed(0),
        rawIR(0),
        dcFilteredIR(0.0f),
        dcFilteredRed(0.0f),
        lastBeatTime(0),
        beatIntervalIndex(0),
        currentBPM(-1),
        currentSpO2(-1),
        perfusionIndex(0.0f),
        fingerOnSensor(false)
    {
        for (int i = 0; i < 4; i++) beatIntervals[i] = 0;
    }

    virtual bool connect() override {
        Wire.begin(I2C_SDA, I2C_SCL, I2C_FREQUENCY);
        delay(10);

        // Check Part ID
        uint8_t partId = readRegister(MAX30102_PART_ID);
        if (partId != 0x15) {
            Serial.printf("[MAX30102] Identification failed. Read Part ID: 0x%02X (Expected: 0x15)\n", partId);
            currentStatus = SENSOR_DISCONNECTED;
            initialized = false;
            return false;
        }

        // Reset Sensor
        writeRegister(MAX30102_MODE_CONFIG, 0x40);
        delay(50);

        // Configure FIFO: Sample averaging = 4, rollover enabled
        writeRegister(MAX30102_FIFO_CONFIG, 0x5F);

        // Configure Mode: SpO2 Mode (Red + IR)
        writeRegister(MAX30102_MODE_CONFIG, 0x03);

        // Configure SpO2: ADC range = 4096nA, Sample Rate = 100Hz, Pulse Width = 411us (18-bit)
        writeRegister(MAX30102_SPO2_CONFIG, 0x27);

        // Set LED currents: Red = ~6.4mA (0x1F), IR = ~6.4mA (0x1F)
        writeRegister(MAX30102_LED1_PA, 0x1F);
        writeRegister(MAX30102_LED2_PA, 0x1F);

        // Clear FIFO pointers
        writeRegister(MAX30102_FIFO_WR_PTR, 0x00);
        writeRegister(MAX30102_OVF_COUNTER, 0x00);
        writeRegister(MAX30102_FIFO_RD_PTR, 0x00);

        initialized = true;
        currentStatus = SENSOR_CONNECTED;
        Serial.println("[MAX30102] Sensor connected and configured successfully!");
        return true;
    }

    void sampleFIFO() {
        if (!initialized) return;

        Wire.beginTransmission(MAX3010X_I2C_ADDR);
        Wire.write(MAX30102_FIFO_DATA);
        if (Wire.endTransmission(false) != 0) {
            currentStatus = SENSOR_DISCONNECTED;
            return;
        }

        // Each sample is 6 bytes (3 bytes Red, 3 bytes IR)
        Wire.requestFrom((uint8_t)MAX3010X_I2C_ADDR, (uint8_t)6);
        if (Wire.available() >= 6) {
            uint8_t b0 = Wire.read();
            uint8_t b1 = Wire.read();
            uint8_t b2 = Wire.read();
            rawRed = ((uint32_t)(b0 & 0x03) << 16) | ((uint32_t)b1 << 8) | (uint32_t)b2;

            uint8_t b3 = Wire.read();
            uint8_t b4 = Wire.read();
            uint8_t b5 = Wire.read();
            rawIR = ((uint32_t)(b3 & 0x03) << 16) | ((uint32_t)b4 << 8) | (uint32_t)b5;

            // 1. Tissue / Finger Presence Detection
            if (rawIR < FINGER_THRESHOLD_IR) {
                fingerOnSensor = false;
                currentBPM = -1;
                currentSpO2 = -1;
                perfusionIndex = 0.0f;
                currentStatus = SENSOR_CHECK;
                return;
            }

            fingerOnSensor = true;
            currentStatus = SENSOR_CONNECTED;

            // 2. DC Removal Filter (High-Pass IIR)
            dcFilteredIR = rawIR - (0.95f * dcFilteredIR);
            dcFilteredRed = rawRed - (0.95f * dcFilteredRed);

            // 3. Peak / Pulse Detection
            unsigned long now = millis();
            static float prevIR = 0;
            static bool rising = false;

            if (dcFilteredIR > 500 && !rising && (now - lastBeatTime > 300)) {
                rising = true;
                if (lastBeatTime > 0) {
                    unsigned long delta = now - lastBeatTime;
                    int instantBPM = 60000 / delta;

                    // Validate BPM range (40 - 220)
                    if (instantBPM >= MIN_VALID_BPM && instantBPM <= MAX_VALID_BPM) {
                        beatIntervals[beatIntervalIndex] = instantBPM;
                        beatIntervalIndex = (beatIntervalIndex + 1) % 4;

                        // Moving average filter
                        int sum = 0, count = 0;
                        for (int i = 0; i < 4; i++) {
                            if (beatIntervals[i] > 0) {
                                sum += beatIntervals[i];
                                count++;
                            }
                        }
                        if (count > 0) currentBPM = sum / count;

                        // 4. SpO2 Calculation from Red/IR AC/DC ratio
                        float rRatio = (rawRed > 0) ? ((float)rawRed / (float)rawIR) : 1.0f;
                        // Empirical calibration polynomial: SpO2 = 110 - 25 * R
                        int calcSpO2 = round(110.0f - (25.0f * rRatio));
                        if (calcSpO2 < MIN_VALID_SPO2) calcSpO2 = MIN_VALID_SPO2;
                        if (calcSpO2 > MAX_VALID_SPO2) calcSpO2 = MAX_VALID_SPO2;
                        currentSpO2 = calcSpO2;

                        // Perfusion Index estimation
                        perfusionIndex = (rawIR > 0) ? (abs(dcFilteredIR) / (float)rawIR) * 100.0f : 0.0f;
                    }
                }
                lastBeatTime = now;
            } else if (dcFilteredIR < 0) {
                rising = false;
            }
            prevIR = dcFilteredIR;
        }
    }

    virtual int readHeartRate() override {
        sampleFIFO();
        return currentBPM;
    }

    virtual int readSpO2() override {
        return currentSpO2;
    }

    virtual SensorStatus getStatus() override {
        return currentStatus;
    }

    virtual void disconnect() override {
        if (initialized) {
            writeRegister(MAX30102_MODE_CONFIG, 0x80); // Shutdown mode
            initialized = false;
            currentStatus = SENSOR_DISCONNECTED;
        }
    }

    virtual SensorVitals readVitals() override {
        sampleFIFO();
        SensorVitals vitals;
        vitals.heartRate = currentBPM;
        vitals.spo2 = currentSpO2;
        vitals.perfusionIndex = perfusionIndex;
        vitals.fingerDetected = fingerOnSensor;
        vitals.status = currentStatus;
        vitals.isSimulated = false;
        vitals.timestamp = millis();
        return vitals;
    }

    virtual const char* getSensorName() const override {
        return "MAX30102 Optical PPG Sensor";
    }

    virtual SensorType getSensorType() const override {
        return TYPE_MAX30102;
    }
};

#endif // MAX30102_SENSOR_H
