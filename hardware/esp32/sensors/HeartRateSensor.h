/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * HeartRateSensor Abstract Interface (HeartRateSensor.h)
 * ==============================================================================
 * Sensor Abstraction Interface:
 * ├── connect()
 * ├── readHeartRate()
 * ├── readSpO2()
 * ├── getStatus()
 * └── disconnect()
 * ==============================================================================
 */

#ifndef HEART_RATE_SENSOR_H
#define HEART_RATE_SENSOR_H

#include <Arduino.h>

enum SensorStatus {
    SENSOR_DISCONNECTED = 0,
    SENSOR_CONNECTED    = 1,
    SENSOR_CHECK        = 2, // Sensor present but finger not detected or signal unstable
    SENSOR_FAULT        = 3
};

enum SensorType {
    TYPE_UNKNOWN  = 0,
    TYPE_MAX30100 = 1,
    TYPE_MAX30102 = 2,
    TYPE_SIMULATOR = 3
};

struct SensorVitals {
    int heartRate;            // BPM (e.g. 78, or -1 if invalid/disconnected)
    int spo2;                 // % (e.g. 97, or -1 if invalid/disconnected)
    float perfusionIndex;     // Perfusion Index (e.g. 4.2)
    bool fingerDetected;      // Optical detection of human finger/tissue
    SensorStatus status;      // Current health status
    bool isSimulated;         // True if in simulation fallback
    unsigned long timestamp;  // Millis timestamp of reading
};

class HeartRateSensor {
public:
    virtual ~HeartRateSensor() {}

    /**
     * Initializes I2C bus and configures sensor registers
     * Returns true if sensor is successfully detected and initialized
     */
    virtual bool connect() = 0;

    /**
     * Samples optical PPG data and returns filtered heart rate in BPM
     * Returns -1 if reading is invalid or finger is not present
     */
    virtual int readHeartRate() = 0;

    /**
     * Returns blood oxygen saturation level in percentage (0-100%)
     * Returns -1 if reading is invalid
     */
    virtual int readSpO2() = 0;

    /**
     * Returns current operational status of the sensor
     */
    virtual SensorStatus getStatus() = 0;

    /**
     * Powers down optical LEDs and releases I2C bus resources
     */
    virtual void disconnect() = 0;

    /**
     * Returns complete composite vitals packet
     */
    virtual SensorVitals readVitals() = 0;

    /**
     * Returns descriptive model name of the sensor
     */
    virtual const char* getSensorName() const = 0;

    /**
     * Returns underlying hardware sensor type
     */
    virtual SensorType getSensorType() const = 0;
};

#endif // HEART_RATE_SENSOR_H
