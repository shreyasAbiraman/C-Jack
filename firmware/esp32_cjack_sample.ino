/**
 * CJack ESP32 Firmware Telemetry Transmitter (Sample)
 * 
 * Hardware Target: ESP32-WROOM-32 / LILYGO T-Beam v1.1
 * Framework: Arduino / ESP-IDF
 * Libraries Required:
 *   - ArduinoJson (v6 or v7)
 *   - HTTPClient / WiFi
 *   - Adafruit_MPU6050 (I2C)
 *   - SparkFun_MAX3010x (I2C)
 *   - TinyGPSPlus (UART)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "cjack_protocol.h"

// Wi-Fi Credentials
const char* WIFI_SSID = "Shreyas’s iPhone";
const char* WIFI_PASS = "Shreyas2006";

// CJack Backend Endpoint
const char* BACKEND_INGEST_URL = "http://172.20.10.5:5000/api/hardware/telemetry";
const char* DEVICE_ID = "CJACK-ESP32-01";
const char* FIRMWARE_VER = "v1.0.0-hw";

// Heartbeat transmission period
const unsigned long TRANSMIT_INTERVAL_MS = 1000;
unsigned long lastTransmitTime = 0;

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n[CJack Hardware] Initializing ESP32 Resuscitation Subsystem...");

    // Connect to Wi-Fi
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print("[CJack Hardware] Connecting to Wi-Fi");
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
        delay(500);
        Serial.print(".");
        retries++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[CJack Hardware] Wi-Fi Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.println("\n[CJack Hardware] Wi-Fi Connection Failed, continuing in offline/LoRa mode");
    }
}

void loop() {
    unsigned long currentMillis = millis();
    if (currentMillis - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
        lastTransmitTime = currentMillis;
        sendHardwareTelemetryPacket();
    }
}

void sendHardwareTelemetryPacket() {
    if (WiFi.status() != WL_CONNECTED) return;

    HTTPClient http;
    http.begin(BACKEND_INGEST_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-CJack-Hardware-Source", "physical");

    // Construct JSON Data Contract
    StaticJsonDocument<1536> doc;

    doc["deviceId"] = DEVICE_ID;
    doc["firmwareVersion"] = FIRMWARE_VER;
    doc["timestamp"] = (uint64_t)time(NULL) * 1000;
    doc["hardwareSource"] = "PHYSICAL";

    // Sensors
    JsonObject sensors = doc.createNestedObject("sensors");
    sensors["heartRate"] = 74;
    sensors["spo2"] = 98;

    JsonObject ecg = sensors.createNestedObject("ecg");
    ecg["leadsConnected"] = true;
    ecg["leadOffPlus"] = false;
    ecg["leadOffMinus"] = false;
    ecg["rawMv"] = 1.24;
    ecg["signalQuality"] = 96;

    JsonObject motion = sensors.createNestedObject("motion");
    motion["ax"] = 0.02;
    motion["ay"] = 0.01;
    motion["az"] = 0.98;
    motion["gx"] = 0.1;
    motion["gy"] = -0.2;
    motion["gz"] = 0.0;
    motion["fallDetected"] = false;
    motion["posture"] = "SUPINE";

    JsonObject respiration = sensors.createNestedObject("respiration");
    respiration["rate"] = 16;
    respiration["amplitude"] = 45;
    respiration["sensorFault"] = false;

    // CPR
    JsonObject cpr = doc.createNestedObject("cpr");
    cpr["active"] = false;
    cpr["rate"] = 0;
    cpr["depth"] = 0;
    cpr["force"] = 0;
    cpr["compressionCount"] = 0;
    cpr["motorStatus"] = "STANDBY";
    cpr["driverTempC"] = 31.8;
    cpr["fault"] = false;

    // Location
    JsonObject loc = doc.createNestedObject("location");
    loc["latitude"] = 12.9716;
    loc["longitude"] = 77.5946;
    loc["accuracy"] = 2.5;
    loc["fixType"] = "3D_FIX";
    loc["satellites"] = 11;

    // Connectivity
    JsonObject conn = doc.createNestedObject("connectivity");
    conn["gps"] = "LOCKED";
    conn["lora"] = "JOINED";
    conn["backend"] = "CONNECTED";
    conn["loraRssi"] = -72;
    conn["loraSnr"] = 9.5;

    // Battery
    JsonObject bat = doc.createNestedObject("battery");
    bat["percentage"] = 88;
    bat["voltage"] = 14.8;
    bat["currentMa"] = 120;
    bat["isCharging"] = false;
    bat["fault"] = false;

    String jsonString;
    serializeJson(doc, jsonString);

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("[CJack Hardware] Packet Delivered (%d): %s\n", httpResponseCode, response.c_str());

        // Process potential downlink commands (CPR Motor start/stop, metronome, OLED)
        StaticJsonDocument<512> responseDoc;
        DeserializationError err = deserializeJson(responseDoc, response);
        if (!err && responseDoc["data"]["commands"]) {
            JsonArray commands = responseDoc["data"]["commands"].as<JsonArray>();
            for (JsonObject cmd : commands) {
                const char* commandName = cmd["command"];
                Serial.printf("[CJack Hardware] Executing Downlink Command: %s\n", commandName);
                if (strcmp(commandName, "START_CPR") == 0) {
                    // Activate motor driver PWM
                } else if (strcmp(commandName, "EMERGENCY_BRAKE") == 0) {
                    // Cut off motor driver immediately
                }
            }
        }
    } else {
        Serial.printf("[CJack Hardware] HTTP POST Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
}
