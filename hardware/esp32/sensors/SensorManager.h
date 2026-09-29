/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * Sensor Manager (SensorManager.h)
 * ==============================================================================
 * Manages sensor lifecycle, automatic probe/identification, and fallback handling:
 * 1. Probes I2C bus for MAX30102 (Part ID 0x15) or MAX30100 (Part ID 0x11).
 * 2. If physical sensor is detected: Activates real hardware readings.
 * 3. If physical sensor is NOT detected: Stays in SIMULATION MODE and reports
 *    SENSOR_DISCONNECTED without fabricating fake "real" readings.
 * ==============================================================================
 */

#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include "HeartRateSensor.h"
#include "MAX30102Sensor.h"
#include "MAX30100Sensor.h"
#include "../config/hardware_config.h"

class SensorManager {
private:
    HeartRateSensor* activeSensor;
    MAX30102Sensor max30102;
    MAX30100Sensor max30100;
    bool isPhysicalHardwareDetected;
    unsigned long lastRetryTimestamp;
    SensorVitals lastValidVitals;

public:
    SensorManager() :
        activeSensor(nullptr),
        isPhysicalHardwareDetected(false),
        lastRetryTimestamp(0)
    {
        lastValidVitals.heartRate = -1;
        lastValidVitals.spo2 = -1;
        lastValidVitals.perfusionIndex = 0.0f;
        lastValidVitals.fingerDetected = false;
        lastValidVitals.status = SENSOR_DISCONNECTED;
        lastValidVitals.isSimulated = true;
        lastValidVitals.timestamp = 0;
    }

    bool begin() {
        Serial.println("[SensorManager] Initializing I2C bus and auto-detecting Heart Rate Sensor...");
        
        // 1. Try MAX30102 first
        if (max30102.connect()) {
            activeSensor = &max30102;
            isPhysicalHardwareDetected = true;
            Serial.printf("[SensorManager] Physical Hardware ACTIVE: %s\n", activeSensor->getSensorName());
            return true;
        }

        // 2. Try MAX30100
        if (max30100.connect()) {
            activeSensor = &max30100;
            isPhysicalHardwareDetected = true;
            Serial.printf("[SensorManager] Physical Hardware ACTIVE: %s\n", activeSensor->getSensorName());
            return true;
        }

        // 3. Neither physical sensor found -> Fallback to Simulation Mode
        isPhysicalHardwareDetected = false;
        activeSensor = nullptr;
        Serial.println("[SensorManager] WARNING: No physical MAX30100/MAX30102 sensor detected.");
        Serial.println("[SensorManager] Operating in Simulation / Standby Mode. (No fake real readings generated)");
        return false;
    }

    void update() {
        unsigned long now = millis();

        // If no physical sensor, attempt periodic re-connect every SENSOR_RETRY_INTERVAL_MS
        if (!isPhysicalHardwareDetected && (now - lastRetryTimestamp > SENSOR_RETRY_INTERVAL_MS)) {
            lastRetryTimestamp = now;
            begin();
        }
    }

    SensorVitals getVitals() {
        update();

        if (isPhysicalHardwareDetected && activeSensor != nullptr) {
            SensorVitals v = activeSensor->readVitals();
            lastValidVitals = v;
            return v;
        }

        // Return Disconnected / Standby state (NEVER falsify as real hardware)
        SensorVitals v;
        v.heartRate = -1; // Displays "--" on TFT and Dashboard
        v.spo2 = -1;
        v.perfusionIndex = 0.0f;
        v.fingerDetected = false;
        v.status = SENSOR_DISCONNECTED;
        v.isSimulated = true;
        v.timestamp = millis();
        return v;
    }

    bool isPhysicalConnected() const {
        return isPhysicalHardwareDetected && activeSensor != nullptr && (activeSensor->getStatus() == SENSOR_CONNECTED);
    }

    const char* getSensorStatusText() const {
        if (!isPhysicalHardwareDetected || activeSensor == nullptr) {
            return "HR SENSOR: DISCONNECTED";
        }
        SensorStatus st = activeSensor->getStatus();
        if (st == SENSOR_CONNECTED) {
            return "HR SENSOR: CONNECTED";
        } else if (st == SENSOR_CHECK) {
            return "HR SENSOR: CHECK FINGER";
        } else {
            return "HR SENSOR: DISCONNECTED";
        }
    }

    const char* getSensorModel() const {
        if (activeSensor) return activeSensor->getSensorName();
        return "NONE (SIMULATION)";
    }
};

#endif // SENSOR_MANAGER_H
