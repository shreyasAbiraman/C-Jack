/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * MAX30100 Pulse Oximetry & Heart-Rate Sensor Driver (MAX30100Sensor.h)
 * ==============================================================================
 * Implements HeartRateSensor abstraction for Maxim MAX30100 sensor.
 * Part ID Expected: 0x11
 * ==============================================================================
 */

#ifndef MAX30100_SENSOR_H
#define MAX30100_SENSOR_H

#include <Wire.h>
#include "HeartRateSensor.h"
#include "../config/hardware_config.h"

#define MAX30100_INT_STAT      0x00
#define MAX30100_INT_EN        0x01
#define MAX30100_FIFO_WR_PTR   0x02
#define MAX30100_OVF_COUNTER   0x03
#define MAX30100_FIFO_RD_PTR   0x04
#define MAX30100_FIFO_DATA     0x05
#define MAX30100_MODE_CONFIG   0x06
#define MAX30100_SPO2_CONFIG   0x07
#define MAX30100_LED_CONFIG    0x09
#define MAX30100_PART_ID       0xFF // Expected: 0x11

class MAX30100Sensor : public HeartRateSensor {
private:
    bool initialized;
    SensorStatus currentStatus;
    uint16_t rawIR;
    uint16_t rawRed;
    float dcFilteredIR;
    float dcFilteredRed;
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
    MAX30100Sensor() :
        initialized(false),
        currentStatus(SENSOR_DISCONNECTED),
        rawIR(0),
        rawRed(0),
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

        uint8_t partId = readRegister(MAX30100_PART_ID);
        if (partId != 0x11) {
            Serial.printf("[MAX30100] Identification failed. Part ID: 0x%02X (Expected: 0x11)\n", partId);
            currentStatus = SENSOR_DISCONNECTED;
            initialized = false;
            return false;
        }

        // Reset
        writeRegister(MAX30100_MODE_CONFIG, 0x40);
        delay(50);

        // Mode: SpO2 Enable (0x03)
        writeRegister(MAX30100_MODE_CONFIG, 0x03);

        // SpO2 Config: 100 samples/sec, 1600us pulse width
        writeRegister(MAX30100_SPO2_CONFIG, 0x07);

        // LED Current: Red ~7.6mA (0x02), IR ~14.2mA (0x04)
        writeRegister(MAX30100_LED_CONFIG, 0x24);

        initialized = true;
        currentStatus = SENSOR_CONNECTED;
        Serial.println("[MAX30100] Sensor connected successfully!");
        return true;
    }

    void sampleFIFO() {
        if (!initialized) return;

        Wire.beginTransmission(MAX3010X_I2C_ADDR);
        Wire.write(MAX30100_FIFO_DATA);
        if (Wire.endTransmission(false) != 0) {
            currentStatus = SENSOR_DISCONNECTED;
            return;
        }

        // MAX30100: 4 bytes per sample (2 bytes IR, 2 bytes Red)
        Wire.requestFrom((uint8_t)MAX3010X_I2C_ADDR, (uint8_t)4);
        if (Wire.available() >= 4) {
            uint8_t irH = Wire.read();
            uint8_t irL = Wire.read();
            rawIR = ((uint16_t)irH << 8) | irL;

            uint8_t redH = Wire.read();
            uint8_t redL = Wire.read();
            rawRed = ((uint16_t)redH << 8) | redL;

            if (rawIR < 10000) {
                fingerOnSensor = false;
                currentBPM = -1;
                currentSpO2 = -1;
                perfusionIndex = 0.0f;
                currentStatus = SENSOR_CHECK;
                return;
            }

            fingerOnSensor = true;
            currentStatus = SENSOR_CONNECTED;

            // DC Filter
            dcFilteredIR = rawIR - (0.95f * dcFilteredIR);
            dcFilteredRed = rawRed - (0.95f * dcFilteredRed);

            unsigned long now = millis();
            static float prevIR = 0;
            static bool rising = false;

            if (dcFilteredIR > 150 && !rising && (now - lastBeatTime > 300)) {
                rising = true;
                if (lastBeatTime > 0) {
                    unsigned long delta = now - lastBeatTime;
                    int instantBPM = 60000 / delta;

                    if (instantBPM >= MIN_VALID_BPM && instantBPM <= MAX_VALID_BPM) {
                        beatIntervals[beatIntervalIndex] = instantBPM;
                        beatIntervalIndex = (beatIntervalIndex + 1) % 4;

                        int sum = 0, count = 0;
                        for (int i = 0; i < 4; i++) {
                            if (beatIntervals[i] > 0) {
                                sum += beatIntervals[i];
                                count++;
                            }
                        }
                        if (count > 0) currentBPM = sum / count;

                        float rRatio = (rawRed > 0) ? ((float)rawRed / (float)rawIR) : 1.0f;
                        int calcSpO2 = round(110.0f - (25.0f * rRatio));
                        if (calcSpO2 < MIN_VALID_SPO2) calcSpO2 = MIN_VALID_SPO2;
                        if (calcSpO2 > MAX_VALID_SPO2) calcSpO2 = MAX_VALID_SPO2;
                        currentSpO2 = calcSpO2;

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
            writeRegister(MAX30100_MODE_CONFIG, 0x80);
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
        return "MAX30100 Optical PPG Sensor";
    }

    virtual SensorType getSensorType() const override {
        return TYPE_MAX30100;
    }
};

#endif // MAX30100_SENSOR_H
