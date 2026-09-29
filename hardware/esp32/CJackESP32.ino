/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * Master ESP32 Firmware (CJackESP32.ino)
 * ==============================================================================
 * Target: ESP32-WROOM-32 + MAX30102 / MAX30100 + 3.5" TFT LCD (ILI9488)
 * 
 * Architecture:
 * - Local-First Resilient Design: Sensor sampling & TFT display execute on Core 1
 *   and NEVER freeze or stop when Wi-Fi/Backend is disconnected.
 * - FreeRTOS Task on Core 0 handles background network telemetry (REST / WebSocket).
 * - Real Sensor Reading: Validates PPG, filters noise, detects finger contact.
 * - Dynamic TFT Display: Updates heart rate, SpO2, and emergency dispatch status.
 * ==============================================================================
 */

#include <Arduino.h>
#include "config/hardware_config.h"
#include "sensors/SensorManager.h"
#include "display/TFTDashboard.h"
#include "network/NetworkClient.h"

// System Singletons
SensorManager sensorManager;
TFTDashboard dashboard;
NetworkClient networkClient;

// Shared State Mutex for FreeRTOS
portMUX_TYPE sharedStateMutex = portMUX_INITIALIZER_UNLOCKED;

struct SharedSystemState {
    SensorVitals vitals;
    int batteryPct;
    bool cprActive;
    int cprRate;
    bool gpsConnected;
    bool wifiConnected;
    bool backendOnline;
    EmergencyDisplayState emergencyState;
    char assignedAmbulanceId[16];
};

SharedSystemState globalState;

// FreeRTOS Background Task: Network Telemetry Sync (Core 0)
void networkSyncTask(void* parameter) {
    networkClient.begin(DEFAULT_WIFI_SSID, DEFAULT_WIFI_PASS);

    while (true) {
        // 1. Maintain Wi-Fi and WebSocket
        networkClient.maintainConnection();

        // 2. Read latest sensor snapshot safely
        SensorVitals vSnapshot;
        int battSnapshot;
        bool cprActiveSnapshot;
        int cprRateSnapshot;

        portENTER_CRITICAL(&sharedStateMutex);
        vSnapshot = globalState.vitals;
        battSnapshot = globalState.batteryPct;
        cprActiveSnapshot = globalState.cprActive;
        cprRateSnapshot = globalState.cprRate;
        globalState.wifiConnected = networkClient.isWifiConnected();
        globalState.backendOnline = networkClient.isBackendReachable();
        portEXIT_CRITICAL(&sharedStateMutex);

        // 3. Dispatch Live Vitals to Backend (POST /api/device/vitals)
        if (networkClient.isWifiConnected()) {
            networkClient.sendVitals(vSnapshot, battSnapshot, cprActiveSnapshot, cprRateSnapshot);
        }

        vTaskDelay(pdMS_TO_TICKS(TELEMETRY_POST_INTERVAL_MS));
    }
}

void setup() {
    Serial.begin(115200);
    delay(200);
    Serial.println("\n========================================================");
    Serial.println("  C-JACK SMART FIRST-AID VEST — ESP32 HARDWARE BOOTING");
    Serial.println("  Firmware: " FIRMWARE_VERSION);
    Serial.println("  Device ID: " DEVICE_ID);
    Serial.println("========================================================");

    // 1. Initialize Shared State Defaults
    globalState.vitals.heartRate = -1;
    globalState.vitals.spo2 = -1;
    globalState.vitals.perfusionIndex = 0.0f;
    globalState.vitals.fingerDetected = false;
    globalState.vitals.status = SENSOR_DISCONNECTED;
    globalState.vitals.isSimulated = true;
    globalState.batteryPct = 82; // LiFePO4 battery monitoring
    globalState.cprActive = false;
    globalState.cprRate = 0;
    globalState.gpsConnected = true;
    globalState.wifiConnected = false;
    globalState.backendOnline = false;
    globalState.emergencyState = EMG_STATE_READY;
    strcpy(globalState.assignedAmbulanceId, "AMB-02");

    // 2. Initialize TFT Dashboard (Local-First Priority)
    Serial.println("[Init] Starting TFT Display Shield...");
    dashboard.begin();

    // 3. Initialize Heart Rate Sensor
    Serial.println("[Init] Initializing Heart Rate & SpO2 Sensor...");
    sensorManager.begin();

    // 4. Spawn Background Network Task on Core 0
    xTaskCreatePinnedToCore(
        networkSyncTask,      // Task function
        "NetworkSyncTask",    // Name of task
        8192,                 // Stack size (bytes)
        NULL,                 // Parameter
        1,                    // Priority
        NULL,                 // Task handle
        0                     // Core 0 (Core 1 reserved for Sensors & Display)
    );

    Serial.println("[Init] Boot sequence complete. Real-time monitoring loop engaged.");
}

void loop() {
    static unsigned long lastSensorSample = 0;
    static unsigned long lastDisplayRender = 0;
    unsigned long now = millis();

    // 1. Sample Optical Sensor at 50Hz (Every 20ms)
    if (now - lastSensorSample >= SENSOR_SAMPLE_INTERVAL_MS) {
        lastSensorSample = now;
        SensorVitals currentVitals = sensorManager.getVitals();

        portENTER_CRITICAL(&sharedStateMutex);
        globalState.vitals = currentVitals;
        portEXIT_CRITICAL(&sharedStateMutex);
    }

    // 2. Render TFT Dashboard at ~15Hz (Smooth dynamic updates)
    if (now - lastDisplayRender >= TFT_RENDER_INTERVAL_MS) {
        lastDisplayRender = now;

        TFTDashboardData uiData;
        portENTER_CRITICAL(&sharedStateMutex);
        uiData.heartRate = globalState.vitals.heartRate;
        uiData.spo2 = globalState.vitals.spo2;
        uiData.perfusionIndex = globalState.vitals.perfusionIndex;
        uiData.sensorStatusText = sensorManager.getSensorStatusText();
        uiData.sensorConnected = sensorManager.isPhysicalConnected();
        uiData.cprActive = globalState.cprActive;
        uiData.cprRate = globalState.cprRate;
        uiData.gpsConnected = globalState.gpsConnected;
        uiData.wifiConnected = globalState.wifiConnected;
        uiData.batteryPercentage = globalState.batteryPct;
        uiData.emergencyState = globalState.emergencyState;
        strncpy(uiData.assignedAmbulanceId, globalState.assignedAmbulanceId, sizeof(uiData.assignedAmbulanceId));
        portEXIT_CRITICAL(&sharedStateMutex);

        dashboard.update(uiData);
    }

    delay(2); // Small yield
}
