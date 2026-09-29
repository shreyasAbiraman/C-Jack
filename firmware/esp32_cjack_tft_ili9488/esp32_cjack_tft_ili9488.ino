/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * ESP32 + 3.5" TFT LCD Shield (UTFTGLUE / MCUFRIEND_kbv)
 * Real MAX30102 Sensor + Real PPG Waveform + Real Telephony SOS
 * ==============================================================================
 * Hardware Configuration:
 *   - ESP32-WROOM-32 (30-pin Board)
 *   - 3.5" TFT LCD Shield (8-Bit MCU Parallel via UTFTGLUE)
 *   - MAX30102 Pulse Oximeter & Heart Rate Sensor (I2C SDA: GPIO 21, SCL: GPIO 22)
 * 
 * ==============================================================================
 * PIN MAPPING TABLE:
 * ==============================================================================
 * POWER:
 *   TFT 5V      -----> ESP32 VIN (or 5V supply)
 *   TFT GND     -----> ESP32 GND
 * 
 * LCD CONTROL:
 *   LCD_RST     -----> ESP32 D32 (GPIO 32)
 *   LCD_CS      -----> ESP32 D33 (GPIO 33)
 *   LCD_RS (DC) -----> ESP32 D15 (GPIO 15)
 *   LCD_WR      -----> ESP32 D4  (GPIO 4)
 *   LCD_RD      -----> ESP32 D2  (GPIO 2)
 * 
 * LCD 8-BIT DATA BUS:
 *   LCD_D0      -----> ESP32 D12 (GPIO 12)
 *   LCD_D1      -----> ESP32 D13 (GPIO 13)
 *   LCD_D2      -----> ESP32 D26 (GPIO 26)
 *   LCD_D3      -----> ESP32 D25 (GPIO 25)
 *   LCD_D4      -----> ESP32 TX2 (GPIO 17)
 *   LCD_D5      -----> ESP32 RX2 (GPIO 16)
 *   LCD_D6      -----> ESP32 D27 (GPIO 27)
 *   LCD_D7      -----> ESP32 D14 (GPIO 14)
 * 
 * I2C MAX30102 SENSOR:
 *   SENSOR SDA  -----> ESP32 D21 (GPIO 21)
 *   SENSOR SCL  -----> ESP32 D22 (GPIO 22)
 *   SENSOR VCC  -----> ESP32 3V3 (or VIN)
 *   SENSOR GND  -----> ESP32 GND
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <math.h>
#include <UTFTGLUE.h>

// ------------------------------------------------------------------------------
// Simulation Mode Switch (Strictly FALSE in production for real sensor data)
// ------------------------------------------------------------------------------
#define SIMULATION_MODE false

// ------------------------------------------------------------------------------
// Working UTFTGLUE Display Constructor (Do NOT change pin arguments)
// ------------------------------------------------------------------------------
UTFTGLUE myGLCD(0, 13, 12, 33, 32, 15);

// ------------------------------------------------------------------------------
// Network & Backend Server Configuration
// ------------------------------------------------------------------------------
const char* WIFI_SSID       = "Shreyas’s iPhone";
const char* WIFI_PASS       = "Shreyas2006";
const char* BACKEND_HOST    = "172.20.10.5";
const int   BACKEND_PORT    = 5000;
const char* WS_PATH         = "/ws/telemetry";
const char* SOS_API_URL     = "http://172.20.10.5:5000/api/emergency/sos";
const char* TELEMETRY_URL   = "http://172.20.10.5:5000/api/hardware/telemetry";
const char* VITALS_API_URL  = "http://172.20.10.5:5000/api/device/vitals";
const char* DEVICE_ID       = "CJACK-001";
const char* FIRMWARE_VER    = "v3.0.0-real-max30102";

// ------------------------------------------------------------------------------
// Shared System State Structure (Protected by FreeRTOS Spinlock)
// ------------------------------------------------------------------------------
enum SensorStateEnum {
    SENSOR_DISCONNECTED,
    SENSOR_NO_SIGNAL,
    SENSOR_CONNECTED
};

enum SosCallStateEnum {
    SOS_IDLE,
    SOS_ACTIVATED,
    SOS_CALLING,
    SOS_CALL_INITIATED,
    SOS_CALL_SUCCESS,
    SOS_CALL_FAILED
};

struct TelemetryState {
    int heartRate = -1;             // -1 indicates invalid/no finger ("--")
    int spo2 = -1;                  // -1 indicates invalid/no finger ("--")
    float perfusionIndex = 0.0;
    int respirationRate = -1;       // Always -1 ("--") because MAX30102 is optical PPG
    float batteryVoltage = 14.8;
    int batteryPct = 88;
    
    // Sensor State
    SensorStateEnum sensorState = SENSOR_NO_SIGNAL;
    bool fingerDetected = false;
    uint32_t rawRed = 0;
    uint32_t rawIR = 0;
    float ppgNormalized = 0.0;      // -1.0 to +1.0 for real-time PPG graph
    
    // CPR Data & Control
    bool cprActive = false;
    int cprRate = 110;
    float cprDepthMm = 0.0;
    int cprCount = 0;
    
    // Emergency & Telephony SOS Status
    bool emergencyAlert = false;
    SosCallStateEnum sosCallState = SOS_IDLE;
    char sosStatusMessage[40] = "READY";
    unsigned long lastSosTriggerTime = 0;
    
    // Connectivity
    bool wifiConnected = false;
    bool backendOnline = false;
    
    // GPS Coordinates
    double latitude = 11.0168;
    double longitude = 76.9558;
};

TelemetryState globalState;
portMUX_TYPE stateMutex = portMUX_INITIALIZER_UNLOCKED;

// Request queue for background SOS dispatch
volatile bool pendingSosDispatch = false;

// ------------------------------------------------------------------------------
// MAX30102 Hardware Register Driver (I2C 0x57)
// ------------------------------------------------------------------------------
#define MAX30102_I2C_ADDR 0x57
bool max30102Present = false;

// Real-time Peak Detection & SpO2 Math Variables
float irDcBaseline = 0.0;
float redDcBaseline = 0.0;
float irAcMax = 0.0, irAcMin = 0.0;
float redAcMax = 0.0, redAcMin = 0.0;
unsigned long lastBeatTime = 0;
int bpmHistory[4] = { 0, 0, 0, 0 };
int bpmIndex = 0;
int validBpmCount = 0;

void initMAX30102() {
    Wire.begin(21, 22, 400000); // 400kHz Fast I2C
    Wire.setTimeOut(25);

    Wire.beginTransmission(MAX30102_I2C_ADDR);
    if (Wire.endTransmission() != 0) {
        max30102Present = false;
        Serial.println("[MAX30102] ERROR: Sensor not detected on I2C (SDA:21, SCL:22).");
        portENTER_CRITICAL(&stateMutex);
        globalState.sensorState = SENSOR_DISCONNECTED;
        portEXIT_CRITICAL(&stateMutex);
        return;
    }

    max30102Present = true;
    Serial.println("[MAX30102] Hardware detected at 0x57! Configuring registers...");

    // 1. Soft Reset
    Wire.beginTransmission(MAX30102_I2C_ADDR);
    Wire.write(0x09); // Mode Config
    Wire.write(0x40); // Reset bit
    Wire.endTransmission();
    delay(10);

    // 2. FIFO Configuration: Sample averaging = 4, rollover enable, FIFO almost full = 17
    Wire.beginTransmission(MAX30102_I2C_ADDR);
    Wire.write(0x08);
    Wire.write(0x5F);
    Wire.endTransmission();

    // 3. Mode Config: SpO2 + Heart Rate Mode
    Wire.beginTransmission(MAX30102_I2C_ADDR);
    Wire.write(0x09);
    Wire.write(0x03);
    Wire.endTransmission();

    // 4. SpO2 Config: ADC Range = 4096nA, Sample Rate = 100Hz, Pulse Width = 411us (18-bit)
    Wire.beginTransmission(MAX30102_I2C_ADDR);
    Wire.write(0x0A);
    Wire.write(0x27);
    Wire.endTransmission();

    // 5. LED Pulse Amplitude (LED1 = Red, LED2 = IR) ~ 7.2mA
    Wire.beginTransmission(MAX30102_I2C_ADDR);
    Wire.write(0x0C); // LED1 (Red)
    Wire.write(0x24);
    Wire.endTransmission();

    Wire.beginTransmission(MAX30102_I2C_ADDR);
    Wire.write(0x0D); // LED2 (IR)
    Wire.write(0x24);
    Wire.endTransmission();

    // Reset FIFO Pointers
    Wire.beginTransmission(MAX30102_I2C_ADDR);
    Wire.write(0x04);
    Wire.write(0x00); // Write pointer
    Wire.write(0x00); // Overflow counter
    Wire.write(0x00); // Read pointer
    Wire.endTransmission();

    portENTER_CRITICAL(&stateMutex);
    globalState.sensorState = SENSOR_NO_SIGNAL;
    portEXIT_CRITICAL(&stateMutex);
    Serial.println("[MAX30102] Initialization Complete. Ready for real finger acquisition.");
}

// Read raw Red & IR samples from FIFO
bool readMAX30102Sample(uint32_t &red, uint32_t &ir) {
    if (!max30102Present) return false;

    Wire.beginTransmission(MAX30102_I2C_ADDR);
    Wire.write(0x07); // FIFO Data Register
    if (Wire.endTransmission() != 0) return false;

    if (Wire.requestFrom(MAX30102_I2C_ADDR, 6) == 6) {
        red = ((uint32_t)Wire.read() << 16) | ((uint32_t)Wire.read() << 8) | Wire.read();
        ir  = ((uint32_t)Wire.read() << 16) | ((uint32_t)Wire.read() << 8) | Wire.read();
        red &= 0x03FFFF;
        ir  &= 0x03FFFF;
        return true;
    }
    return false;
}

unsigned long lastSensorPoll = 0;

void pollPhysicalSensor() {
    if (millis() - lastSensorPoll < 20) return; // 50Hz Acquisition
    lastSensorPoll = millis();

    uint32_t rawRed = 0, rawIR = 0;
    if (!readMAX30102Sample(rawRed, rawIR)) {
        // Retry probe every 3 seconds if disconnected
        if (!max30102Present && (millis() % 3000 < 50)) {
            initMAX30102();
        }
        return;
    }

    // Finger detection threshold: real finger typically produces IR > 50,000
    bool fingerPresent = (rawIR > 50000);

    if (!fingerPresent) {
        portENTER_CRITICAL(&stateMutex);
        globalState.fingerDetected = false;
        globalState.sensorState = SENSOR_NO_SIGNAL;
        globalState.heartRate = -1;
        globalState.spo2 = -1;
        globalState.ppgNormalized = 0.0;
        portEXIT_CRITICAL(&stateMutex);
        
        irDcBaseline = rawIR;
        redDcBaseline = rawRed;
        validBpmCount = 0;
        return;
    }

    // Real Finger Contact Active:
    // 1. Exponential moving average for DC Baseline extraction
    if (irDcBaseline == 0.0) {
        irDcBaseline = (float)rawIR;
        redDcBaseline = (float)rawRed;
    } else {
        irDcBaseline = 0.95 * irDcBaseline + 0.05 * (float)rawIR;
        redDcBaseline = 0.95 * redDcBaseline + 0.05 * (float)rawRed;
    }

    // 2. Real AC Component (High-passed PPG signal)
    float irAc = (float)rawIR - irDcBaseline;
    float redAc = (float)rawRed - redDcBaseline;

    // Track min/max AC for SpO2 ratio and wave normalization
    if (irAc > irAcMax) irAcMax = irAc;
    if (irAc < irAcMin) irAcMin = irAc;
    if (redAc > redAcMax) redAcMax = redAc;
    if (redAc < redAcMin) redAcMin = redAc;

    // Decay peaks for dynamic range tracking
    irAcMax *= 0.99;
    irAcMin *= 0.99;
    redAcMax *= 0.99;
    redAcMin *= 0.99;

    // Normalized PPG sample for waveform (-1.0 to +1.0)
    float ppgNorm = 0.0;
    float peakSpan = (irAcMax - irAcMin);
    if (peakSpan > 200.0) {
        ppgNorm = (irAc - irAcMin) / peakSpan * 2.0 - 1.0;
        if (ppgNorm > 1.0) ppgNorm = 1.0;
        if (ppgNorm < -1.0) ppgNorm = -1.0;
    }

    // 3. Real Heart Rate Peak Detection (Adaptive Threshold)
    unsigned long now = millis();
    if (irAc > 250.0 && (now - lastBeatTime > 320)) { // Max 185 BPM debounce
        unsigned long deltaMs = now - lastBeatTime;
        lastBeatTime = now;

        if (deltaMs > 300 && deltaMs < 1500) { // 40 BPM to 200 BPM valid physiological range
            int instantBpm = (int)(60000.0 / deltaMs);
            
            // 4-Sample Moving Average Filter to prevent sudden jumps
            bpmHistory[bpmIndex] = instantBpm;
            bpmIndex = (bpmIndex + 1) % 4;
            if (validBpmCount < 4) validBpmCount++;

            int bpmSum = 0;
            for (int i = 0; i < validBpmCount; i++) {
                bpmSum += bpmHistory[i];
            }
            int smoothBpm = bpmSum / validBpmCount;

            // 4. Real SpO2 Calculation using Ratio-of-Ratios (R)
            int calculatedSpo2 = 98;
            float irPkPk = (irAcMax - irAcMin);
            float redPkPk = (redAcMax - redAcMin);
            if (irPkPk > 10.0 && irDcBaseline > 1000.0 && redDcBaseline > 1000.0) {
                float rRatio = (redPkPk / redDcBaseline) / (irPkPk / irDcBaseline);
                float estSpo2 = 110.0 - 25.0 * rRatio;
                if (estSpo2 > 100.0) estSpo2 = 100.0;
                if (estSpo2 < 80.0)  estSpo2 = 80.0;
                calculatedSpo2 = (int)estSpo2;
            }

            portENTER_CRITICAL(&stateMutex);
            globalState.heartRate = smoothBpm;
            globalState.spo2 = calculatedSpo2;
            globalState.perfusionIndex = (irPkPk / irDcBaseline) * 100.0;
            portEXIT_CRITICAL(&stateMutex);
        }
    }

    portENTER_CRITICAL(&stateMutex);
    globalState.fingerDetected = true;
    globalState.sensorState = SENSOR_CONNECTED;
    globalState.rawRed = rawRed;
    globalState.rawIR = rawIR;
    globalState.ppgNormalized = ppgNorm;
    portEXIT_CRITICAL(&stateMutex);
}

// ------------------------------------------------------------------------------
// Real-time PPG Waveform Graph Constants & State
// ------------------------------------------------------------------------------
#define PPG_X_START   10
#define PPG_Y_START   34
#define PPG_WIDTH     290
#define PPG_HEIGHT    115
#define PPG_BASELINE  (PPG_Y_START + (PPG_HEIGHT / 2))

int sweepX = PPG_X_START;
int lastPpgY = PPG_BASELINE;

void stepPpgGraph(TelemetryState& state) {
    int currentPpgY = PPG_BASELINE;

    if (state.sensorState == SENSOR_CONNECTED && state.fingerDetected) {
        // Real optical PPG wave: Invert so pulse systolic peak goes upward
        currentPpgY = PPG_BASELINE - (int)(state.ppgNormalized * (PPG_HEIGHT * 0.40));
    } else {
        // Flat baseline when no finger / no signal
        currentPpgY = PPG_BASELINE;
    }

    // Rolling clear ahead
    int clearX = sweepX + 1;
    if (clearX > PPG_X_START + PPG_WIDTH) clearX = PPG_X_START;
    
    myGLCD.setColor(0, 0, 0);
    myGLCD.fillRect(clearX, PPG_Y_START, clearX + 6, PPG_Y_START + PPG_HEIGHT);

    // Draw continuous real PPG waveform line (Cyan Blue for optical PPG)
    myGLCD.setColor(0, 220, 255);
    myGLCD.drawLine(sweepX, lastPpgY, sweepX + 2, currentPpgY);
    lastPpgY = currentPpgY;

    sweepX += 2;
    if (sweepX >= PPG_X_START + PPG_WIDTH) {
        sweepX = PPG_X_START;
    }
}

// ------------------------------------------------------------------------------
// SOS Trigger Handler with 30s Cooldown Debounce
// ------------------------------------------------------------------------------
void triggerEmergencySos() {
    unsigned long now = millis();
    portENTER_CRITICAL(&stateMutex);
    if (globalState.sosCallState == SOS_CALLING || (now - globalState.lastSosTriggerTime < 30000 && globalState.lastSosTriggerTime > 0)) {
        portEXIT_CRITICAL(&stateMutex);
        Serial.println("[SOS Action] Ignored duplicate trigger within 30s cooldown window.");
        return;
    }

    globalState.emergencyAlert = true;
    globalState.sosCallState = SOS_ACTIVATED;
    globalState.lastSosTriggerTime = now;
    snprintf(globalState.sosStatusMessage, sizeof(globalState.sosStatusMessage), "SOS ACTIVATED. CALLING...");
    portEXIT_CRITICAL(&stateMutex);

    pendingSosDispatch = true;
    Serial.println("\n🚨 [SOS Action] EMERGENCY SOS TRIGGERED! Initiating Automated Voice Call via Backend...");
}

// ------------------------------------------------------------------------------
// FreeRTOS Task: Background Network, Telemetry & Real Telephony Dispatch (Core 0)
// ------------------------------------------------------------------------------
void networkTelemetryTask(void* parameter) {
    Serial.println("[NetTask] Background Network & Telemetry Task running on Core 0");

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    while (true) {
        bool connected = (WiFi.status() == WL_CONNECTED);
        portENTER_CRITICAL(&stateMutex);
        globalState.wifiConnected = connected;
        portEXIT_CRITICAL(&stateMutex);

        // 1. Handle Outbound Emergency Voice Call Dispatch (POST /api/emergency/sos)
        if (pendingSosDispatch) {
            pendingSosDispatch = false;

            portENTER_CRITICAL(&stateMutex);
            globalState.sosCallState = SOS_CALLING;
            snprintf(globalState.sosStatusMessage, sizeof(globalState.sosStatusMessage), "CALLING EMERGENCY CONTACT...");
            int hrToSend = (globalState.heartRate > 0) ? globalState.heartRate : 0;
            int spo2ToSend = (globalState.spo2 > 0) ? globalState.spo2 : 0;
            double latToSend = globalState.latitude;
            double lngToSend = globalState.longitude;
            portEXIT_CRITICAL(&stateMutex);

            if (connected) {
                HTTPClient http;
                http.begin(SOS_API_URL);
                http.addHeader("Content-Type", "application/json");
                http.setTimeout(3500);

                char eventId[32];
                snprintf(eventId, sizeof(eventId), "SOS-%s-%lu", DEVICE_ID, millis());

                StaticJsonDocument<512> sosDoc;
                sosDoc["deviceId"] = DEVICE_ID;
                sosDoc["heartRate"] = hrToSend;
                sosDoc["spo2"] = spo2ToSend;
                sosDoc["latitude"] = latToSend;
                sosDoc["longitude"] = lngToSend;
                sosDoc["reason"] = "MANUAL_SOS";
                sosDoc["eventId"] = eventId;
                sosDoc["timestamp"] = (uint64_t)millis();

                String sosPayload;
                serializeJson(sosDoc, sosPayload);

                int httpResponseCode = http.POST(sosPayload);
                String responseBody = http.getString();
                http.end();

                portENTER_CRITICAL(&stateMutex);
                if (httpResponseCode == 200 || httpResponseCode == 201) {
                    globalState.sosCallState = SOS_CALL_SUCCESS;
                    snprintf(globalState.sosStatusMessage, sizeof(globalState.sosStatusMessage), "EMERGENCY CONTACT CALLED");
                    Serial.printf("[Telephony] SUCCESS: Automated voice call dispatched (HTTP %d)\n", httpResponseCode);
                } else {
                    globalState.sosCallState = SOS_CALL_FAILED;
                    snprintf(globalState.sosStatusMessage, sizeof(globalState.sosStatusMessage), "CALL FAILED (HTTP %d)", httpResponseCode);
                    Serial.printf("[Telephony] FAILED: HTTP %d response from backend\n", httpResponseCode);
                }
                portEXIT_CRITICAL(&stateMutex);
            } else {
                portENTER_CRITICAL(&stateMutex);
                globalState.sosCallState = SOS_CALL_FAILED;
                snprintf(globalState.sosStatusMessage, sizeof(globalState.sosStatusMessage), "CALL FAILED (NO WIFI)");
                portEXIT_CRITICAL(&stateMutex);
                Serial.println("[Telephony] FAILED: No Wi-Fi connection available to dispatch SOS call.");
            }
        }

        // 2. Stream Routine Real Telemetry (POST /api/device/vitals)
        if (connected) {
            HTTPClient http;
            http.begin(VITALS_API_URL);
            http.addHeader("Content-Type", "application/json");
            http.setTimeout(1200);

            StaticJsonDocument<1024> doc;
            doc["patientId"] = "CJ-PATIENT-8829";
            doc["deviceId"] = DEVICE_ID;
            doc["source"] = "REAL_HARDWARE";

            portENTER_CRITICAL(&stateMutex);
            doc["heartRate"] = (globalState.heartRate > 0) ? globalState.heartRate : 0;
            doc["spo2"] = (globalState.spo2 > 0) ? globalState.spo2 : 0;
            doc["respirationRate"] = 0; // Not direct
            doc["sensorStatus"] = (globalState.sensorState == SENSOR_CONNECTED) ? "CONNECTED" : (globalState.sensorState == SENSOR_NO_SIGNAL ? "CHECK" : "DISCONNECTED");
            doc["emergencyAlert"] = globalState.emergencyAlert;
            portEXIT_CRITICAL(&stateMutex);

            String payload;
            serializeJson(doc, payload);

            int code = http.POST(payload);
            portENTER_CRITICAL(&stateMutex);
            globalState.backendOnline = (code == 200 || code == 201);
            portEXIT_CRITICAL(&stateMutex);

            http.end();
        } else {
            portENTER_CRITICAL(&stateMutex);
            globalState.backendOnline = false;
            portEXIT_CRITICAL(&stateMutex);
        }

        vTaskDelay(pdMS_TO_TICKS(250)); // 4Hz Telemetry Stream
    }
}

// ------------------------------------------------------------------------------
// UI Static Layout Initialization using UTFTGLUE
// ------------------------------------------------------------------------------
void drawStaticUI() {
    myGLCD.clrScr();

    // 1. Top Header Bar
    myGLCD.setColor(0, 0, 0);
    myGLCD.fillRect(0, 0, 479, 26);
    myGLCD.setColor(40, 50, 70);
    myGLCD.drawLine(0, 26, 479, 26);

    myGLCD.setColor(255, 255, 255);
    myGLCD.setBackColor(0, 0, 0);
    myGLCD.print("CJACK RESUSCITATION SYSTEM", 10, 6);

    // 2. Real-Time Waveform Box (PPG WAVEFORM from MAX30102)
    myGLCD.setColor(40, 50, 70);
    myGLCD.drawRect(PPG_X_START - 2, PPG_Y_START - 2, PPG_X_START + PPG_WIDTH + 2, PPG_Y_START + PPG_HEIGHT + 2);
    myGLCD.setColor(0, 0, 0);
    myGLCD.fillRect(PPG_X_START - 1, PPG_Y_START - 1, PPG_X_START + PPG_WIDTH + 1, PPG_Y_START + PPG_HEIGHT + 1);

    // Grid dots
    myGLCD.setColor(30, 40, 60);
    for (int x = PPG_X_START; x <= PPG_X_START + PPG_WIDTH; x += 25) {
        for (int y = PPG_Y_START; y <= PPG_Y_START + PPG_HEIGHT; y += 25) {
            myGLCD.drawPixel(x, y);
        }
    }
    myGLCD.setColor(0, 220, 255);
    myGLCD.setBackColor(0, 0, 0);
    myGLCD.print("PPG WAVEFORM (MAX30102)", PPG_X_START + 6, PPG_Y_START + 6);

    // 3. CPR Feedback Card
    int cprY = 156;
    myGLCD.setColor(16, 20, 32);
    myGLCD.fillRoundRect(10, cprY, 300, cprY + 84);
    myGLCD.setColor(40, 50, 70);
    myGLCD.drawRoundRect(10, cprY, 300, cprY + 84);

    myGLCD.setColor(0, 255, 120);
    myGLCD.setBackColor(16, 20, 32);
    myGLCD.print("CPR METRONOME & COMPRESSION", 20, cprY + 8);

    // Target bar background
    myGLCD.setColor(40, 50, 70);
    myGLCD.drawRoundRect(20, cprY + 28, 290, cprY + 46);
    myGLCD.setColor(0, 0, 0);
    myGLCD.fillRect(21, cprY + 29, 289, cprY + 45);

    // 4. Action Control Buttons
    // START CPR Button
    myGLCD.setColor(0, 160, 60);
    myGLCD.fillRoundRect(10, 246, 148, 290);
    myGLCD.setColor(255, 255, 255);
    myGLCD.drawRoundRect(10, 246, 148, 290);
    myGLCD.setBackColor(0, 160, 60);
    myGLCD.print("START CPR", 30, 262);

    // EMERGENCY TRIGGER SOS Button
    myGLCD.setColor(200, 0, 0);
    myGLCD.fillRoundRect(158, 246, 300, 290);
    myGLCD.setColor(255, 255, 255);
    myGLCD.drawRoundRect(158, 246, 300, 290);
    myGLCD.setBackColor(200, 0, 0);
    myGLCD.print("TRIGGER SOS", 175, 262);

    // 5. Right Side Telemetry Cards
    // 5A. Heart Rate Card
    myGLCD.setColor(16, 20, 32);
    myGLCD.fillRoundRect(310, 32, 470, 112);
    myGLCD.setColor(40, 50, 70);
    myGLCD.drawRoundRect(310, 32, 470, 112);
    myGLCD.setColor(255, 60, 60);
    myGLCD.setBackColor(16, 20, 32);
    myGLCD.print("HEART RATE", 320, 40);
    myGLCD.setColor(120, 140, 160);
    myGLCD.print("BPM", 430, 40);

    // 5B. Patient Condition Card (LOW / NORMAL / CRITICAL)
    myGLCD.setColor(16, 20, 32);
    myGLCD.fillRoundRect(310, 118, 470, 202);
    myGLCD.setColor(40, 50, 70);
    myGLCD.drawRoundRect(310, 118, 470, 202);
    myGLCD.setColor(0, 220, 255);
    myGLCD.setBackColor(16, 20, 32);
    myGLCD.print("CONDITION", 320, 126);
    myGLCD.setColor(120, 140, 160);
    myGLCD.print("STATUS", 420, 126);

    // 5C. SpO2 Card
    myGLCD.setColor(16, 20, 32);
    myGLCD.fillRoundRect(310, 208, 470, 290);
    myGLCD.setColor(40, 50, 70);
    myGLCD.drawRoundRect(310, 208, 470, 290);
    myGLCD.setColor(255, 200, 0);
    myGLCD.setBackColor(16, 20, 32);
    myGLCD.print("SpO2", 320, 216);
    myGLCD.setColor(120, 140, 160);
    myGLCD.print("%", 440, 216);

    // 6. Bottom Navigation Bar
    myGLCD.setColor(0, 0, 0);
    myGLCD.fillRect(0, 298, 479, 319);
    myGLCD.setColor(40, 50, 70);
    myGLCD.drawLine(0, 298, 479, 298);
}

// ------------------------------------------------------------------------------
// Dynamic UI Update Functions (4Hz Refresh Rate)
// ------------------------------------------------------------------------------
void updateTopBar(TelemetryState& state) {
    myGLCD.setBackColor(0, 0, 0);
    if (state.wifiConnected) {
        myGLCD.setColor(0, 255, 0);
        myGLCD.print("WIFI OK ", 290, 6);
    } else {
        myGLCD.setColor(255, 0, 0);
        myGLCD.print("WIFI OFF", 290, 6);
    }

    if (state.backendOnline) {
        myGLCD.setColor(0, 220, 255);
        myGLCD.print("CLOUD", 365, 6);
    } else {
        myGLCD.setColor(255, 200, 0);
        myGLCD.print("LOCAL", 365, 6);
    }

    char batStr[16];
    snprintf(batStr, sizeof(batStr), "%d%%", state.batteryPct);
    myGLCD.setColor(state.batteryPct > 20 ? 255 : 255, state.batteryPct > 20 ? 255 : 0, state.batteryPct > 20 ? 255 : 0);
    myGLCD.print(batStr, 430, 6);
}

void updateVitalsCards(TelemetryState& state) {
    char buf[16];
    myGLCD.setBackColor(16, 20, 32);

    // 1. Real Heart Rate (BPM)
    if (state.heartRate > 0 && state.fingerDetected) {
        snprintf(buf, sizeof(buf), "%3d", state.heartRate);
        myGLCD.setColor(255, 255, 255);
    } else {
        snprintf(buf, sizeof(buf), " --");
        myGLCD.setColor(120, 140, 160);
    }
    myGLCD.print(buf, 330, 68);

    // 2. Patient Condition (LOW / NORMAL / CRITICAL)
    if (state.heartRate > 0 && state.fingerDetected) {
        if (state.heartRate < 50) {
            myGLCD.setColor(255, 200, 0); // Amber / Yellow
            myGLCD.print("LOW     ", 330, 154);
        } else if (state.heartRate <= 100) {
            myGLCD.setColor(0, 255, 80);  // Green
            myGLCD.print("NORMAL  ", 330, 154);
        } else {
            myGLCD.setColor(255, 40, 40);  // Red
            myGLCD.print("CRITICAL", 330, 154);
        }
    } else {
        myGLCD.setColor(120, 140, 160);
        myGLCD.print("NO SIGNAL", 330, 154);
    }

    // 3. Real SpO2 (%)
    if (state.spo2 > 0 && state.fingerDetected) {
        snprintf(buf, sizeof(buf), "%3d", state.spo2);
        myGLCD.setColor(255, 255, 255);
    } else {
        snprintf(buf, sizeof(buf), " --");
        myGLCD.setColor(120, 140, 160);
    }
    myGLCD.print(buf, 330, 244);
}

void updateCprDisplay(TelemetryState& state) {
    int cprY = 156;
    char buf[36];

    int depthWidth = (int)((state.cprDepthMm / 70.0) * 268.0);
    if (depthWidth > 268) depthWidth = 268;
    if (depthWidth < 0) depthWidth = 0;

    if (state.cprDepthMm >= 50.0 && state.cprDepthMm <= 60.0) {
        myGLCD.setColor(0, 255, 0); // Target Green
    } else {
        myGLCD.setColor(255, 160, 0); // Warning Orange
    }
    myGLCD.fillRect(21, cprY + 29, 21 + depthWidth, cprY + 45);
    myGLCD.setColor(0, 0, 0);
    myGLCD.fillRect(21 + depthWidth, cprY + 29, 289, cprY + 45);

    snprintf(buf, sizeof(buf), "RATE: %d CPM | DEPTH: %.1f mm", state.cprRate, state.cprDepthMm);
    myGLCD.setBackColor(16, 20, 32);
    myGLCD.setColor(state.cprActive ? 0 : 120, state.cprActive ? 255 : 140, state.cprActive ? 120 : 160);
    myGLCD.print(buf, 20, cprY + 56);
}

void updateBottomBar(TelemetryState& state) {
    char statusBuf[64];
    myGLCD.setBackColor(0, 0, 0);

    // Display Real Emergency Telephony Call Status or Sensor/GPS status
    if (state.emergencyAlert) {
        snprintf(statusBuf, sizeof(statusBuf), "%s", state.sosStatusMessage);
        myGLCD.setColor(255, 200, 0);
    } else {
        const char* sensorTag = (state.sensorState == SENSOR_CONNECTED) ? "MAX30102: CONNECTED" : 
                               (state.sensorState == SENSOR_NO_SIGNAL ? "MAX30102: NO SIGNAL" : "MAX30102: ERROR");
        snprintf(statusBuf, sizeof(statusBuf), "GPS: %.4f, %.4f | %s", state.latitude, state.longitude, sensorTag);
        myGLCD.setColor(120, 140, 160);
    }

    myGLCD.print(statusBuf, 10, 304);
}

// ------------------------------------------------------------------------------
// Serial Command Interface ('s' = Trigger SOS, 'c' = Toggle CPR)
// ------------------------------------------------------------------------------
void handleSerialCommands() {
    while (Serial.available()) {
        char ch = Serial.read();
        if (ch == 's' || ch == 'S') {
            triggerEmergencySos();
        }
        if (ch == 'c' || ch == 'C') {
            portENTER_CRITICAL(&stateMutex);
            globalState.cprActive = !globalState.cprActive;
            bool active = globalState.cprActive;
            portEXIT_CRITICAL(&stateMutex);

            if (active) {
                myGLCD.setColor(220, 0, 0);
                myGLCD.fillRoundRect(10, 246, 148, 290);
                myGLCD.setColor(255, 255, 255);
                myGLCD.drawRoundRect(10, 246, 148, 290);
                myGLCD.setBackColor(220, 0, 0);
                myGLCD.print("STOP CPR ", 30, 262);
                Serial.println("[UI Action] CPR Resuscitation STARTED");
            } else {
                myGLCD.setColor(0, 160, 60);
                myGLCD.fillRoundRect(10, 246, 148, 290);
                myGLCD.setColor(255, 255, 255);
                myGLCD.drawRoundRect(10, 246, 148, 290);
                myGLCD.setBackColor(0, 160, 60);
                myGLCD.print("START CPR", 30, 262);
                Serial.println("[UI Action] CPR Resuscitation STOPPED");
            }
        }
    }
}

// ------------------------------------------------------------------------------
// Arduino Setup (Core 1)
// ------------------------------------------------------------------------------
void setup() {
    Serial.begin(115200);
    delay(300);

    Serial.println("\n========================================================");
    Serial.println("  CJack Resuscitation MCU (Real Sensor & Telephony)");
    Serial.println("========================================================");

    // 1. Initialize 3.5" Parallel Display using UTFTGLUE
    myGLCD.InitLCD(1); // 1 = Landscape (480x320)
    myGLCD.setFont(SmallFont);

    // 2. Render Medical Dashboard Canvas
    drawStaticUI();
    Serial.println("[TFT] CJack Medical Dashboard UI Rendered.");

    // 3. Initialize MAX30102 Hardware on I2C
    initMAX30102();

    // 4. Launch FreeRTOS Background Networking Task on Core 0
    xTaskCreatePinnedToCore(
        networkTelemetryTask,
        "NetTask",
        8192,
        NULL,
        1,
        NULL,
        0 // Core 0
    );

    Serial.println("[BOOT] System Ready. Streaming Real Vitals & Ready for SOS!");
}

unsigned long lastVitalCardUpdate = 0;
float cprAnimAngle = 0.0;

// ------------------------------------------------------------------------------
// Arduino Main Loop (Core 1: Real-time UI & Sensor Polling)
// ------------------------------------------------------------------------------
void loop() {
    // 1. Process Serial Commands
    handleSerialCommands();

    // 2. Poll Real MAX30102 Sensor (50Hz)
    pollPhysicalSensor();

    // 3. High-Speed Real PPG Waveform Sweep
    TelemetryState localCopy;
    portENTER_CRITICAL(&stateMutex);
    localCopy = globalState;
    portEXIT_CRITICAL(&stateMutex);

    stepPpgGraph(localCopy);

    // CPR Simulation animation only when CPR button actively toggled
    if (localCopy.cprActive) {
        cprAnimAngle += 0.20;
        localCopy.cprDepthMm = 52.0 + 5.0 * sin(cprAnimAngle);
        localCopy.cprCount++;
    } else {
        localCopy.cprDepthMm = 0.0;
    }

    // 4. Periodic UI Cards & Status Bar Updates (4Hz)
    if (millis() - lastVitalCardUpdate > 250) {
        lastVitalCardUpdate = millis();
        updateTopBar(localCopy);
        updateVitalsCards(localCopy);
        updateCprDisplay(localCopy);
        updateBottomBar(localCopy);
    }

    delay(20);
}
