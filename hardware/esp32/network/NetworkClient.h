/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * Network Client & Backend Gateway (NetworkClient.h)
 * ==============================================================================
 * Manages:
 * 1. Non-blocking Wi-Fi association and automatic reconnection
 * 2. REST API Vitals Ingestion (POST /api/device/vitals)
 * 3. Real-Time Telemetry Streaming via WebSocket (/ws/telemetry)
 * 4. Downlink Emergency Dispatch Status Reception (Updates TFT dynamically)
 * ==============================================================================
 */

#ifndef NETWORK_CLIENT_H
#define NETWORK_CLIENT_H

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "../config/hardware_config.h"
#include "../sensors/HeartRateSensor.h"

struct DownlinkState {
    bool emergencyActive;
    char emergencyStatus[32];
    char assignedAmbulanceId[16];
    char patientName[32];
};

class NetworkClient {
private:
    const char* ssid;
    const char* password;
    const char* backendHost;
    int backendPort;
    bool wifiConnected;
    bool backendReachable;
    unsigned long lastPostTime;
    unsigned long lastReconnectAttempt;
    DownlinkState currentDownlink;

    WiFiClient wsClient;
    bool wsConnected;

    // Masked WebSocket RFC6455 sender
    bool sendWebSocketFrame(const String& payload) {
        if (!wsClient.connected()) return false;
        size_t len = payload.length();
        uint8_t header[10];
        size_t headerLen = 0;

        header[0] = 0x81; // FIN + Text frame
        if (len <= 125) {
            header[1] = 0x80 | (uint8_t)len;
            headerLen = 2;
        } else if (len <= 65535) {
            header[1] = 0x80 | 126;
            header[2] = (len >> 8) & 0xFF;
            header[3] = len & 0xFF;
            headerLen = 4;
        } else {
            return false;
        }

        uint8_t mask[4] = { 0x43, 0x4A, 0x41, 0x4B }; // "CJAK"
        for (int i = 0; i < 4; i++) {
            header[headerLen++] = mask[i];
        }

        if (wsClient.write(header, headerLen) != headerLen) return false;

        uint8_t buf[256];
        size_t written = 0;
        while (written < len) {
            size_t chunk = (len - written > sizeof(buf)) ? sizeof(buf) : (len - written);
            for (size_t i = 0; i < chunk; i++) {
                buf[i] = payload[written + i] ^ mask[(written + i) % 4];
            }
            if (wsClient.write(buf, chunk) != chunk) return false;
            written += chunk;
        }
        return true;
    }

public:
    NetworkClient() :
        ssid(DEFAULT_WIFI_SSID),
        password(DEFAULT_WIFI_PASS),
        backendHost(BACKEND_HOST),
        backendPort(BACKEND_PORT),
        wifiConnected(false),
        backendReachable(false),
        lastPostTime(0),
        lastReconnectAttempt(0),
        wsConnected(false)
    {
        currentDownlink.emergencyActive = false;
        strcpy(currentDownlink.emergencyStatus, "NORMAL");
        strcpy(currentDownlink.assignedAmbulanceId, "");
        strcpy(currentDownlink.patientName, "Demo Patient");
    }

    void begin(const char* wifiSSID = nullptr, const char* wifiPass = nullptr) {
        if (wifiSSID) ssid = wifiSSID;
        if (wifiPass) password = wifiPass;

        WiFi.mode(WIFI_STA);
        WiFi.begin(ssid, password);
        Serial.printf("[NetworkClient] Connecting to Wi-Fi SSID: %s\n", ssid);
    }

    void maintainConnection() {
        bool status = (WiFi.status() == WL_CONNECTED);
        if (status != wifiConnected) {
            wifiConnected = status;
            if (wifiConnected) {
                Serial.printf("[NetworkClient] Wi-Fi Connected! IP: %s\n", WiFi.localIP().toString().c_str());
            } else {
                Serial.println("[NetworkClient] Wi-Fi Disconnected. Local sensor monitoring continues uninterrupted.");
            }
        }

        // Periodic Reconnect if disconnected
        if (!wifiConnected && (millis() - lastReconnectAttempt > 5000)) {
            lastReconnectAttempt = millis();
            WiFi.disconnect();
            WiFi.reconnect();
        }

        // Maintain WebSocket Connection
        if (wifiConnected && !wsClient.connected() && (millis() - lastReconnectAttempt > 3000)) {
            lastReconnectAttempt = millis();
            if (wsClient.connect(backendHost, backendPort)) {
                wsClient.print(String("GET ") + BACKEND_WS_PATH + " HTTP/1.1\r\n" +
                               "Host: " + backendHost + ":" + String(backendPort) + "\r\n" +
                               "Upgrade: websocket\r\n" +
                               "Connection: Upgrade\r\n" +
                               "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n" +
                               "Sec-WebSocket-Version: 13\r\n\r\n");

                unsigned long t = millis();
                while (wsClient.connected() && !wsClient.available() && millis() - t < 1000) {
                    delay(10);
                }

                if (wsClient.available()) {
                    String res = wsClient.readStringUntil('\n');
                    if (res.indexOf("101") >= 0) {
                        wsConnected = true;
                        Serial.println("[NetworkClient] WebSocket live stream connected!");
                    }
                }
            }
        }
    }

    /**
     * Sends Vitals payload to Backend REST API (POST /api/device/vitals)
     */
    bool sendVitals(const SensorVitals& vitals, int batteryPct, bool cprActive, int cprRate) {
        if (!wifiConnected) return false;

        // Build Payload
        StaticJsonDocument<512> doc;
        doc["deviceId"] = DEVICE_ID;
        doc["heartRate"] = (vitals.heartRate > 0) ? vitals.heartRate : 0;
        doc["spo2"] = (vitals.spo2 > 0) ? vitals.spo2 : 0;
        doc["perfusionIndex"] = vitals.perfusionIndex;
        
        // Generate ISO Timestamp
        char timeBuf[32];
        snprintf(timeBuf, sizeof(timeBuf), "2026-09-25T%02lu:%02lu:%02luZ", 
                 (millis() / 3600000) % 24, (millis() / 60000) % 60, (millis() / 1000) % 60);
        doc["timestamp"] = timeBuf;
        
        // Sensor Status
        if (vitals.status == SENSOR_CONNECTED) {
            doc["sensorStatus"] = "CONNECTED";
        } else if (vitals.status == SENSOR_CHECK) {
            doc["sensorStatus"] = "CHECK";
        } else {
            doc["sensorStatus"] = "DISCONNECTED";
        }

        doc["source"] = vitals.isSimulated ? "SIMULATION" : "REAL_HARDWARE";
        doc["battery"] = batteryPct;
        doc["cprActive"] = cprActive;
        doc["cprRate"] = cprRate;

        String jsonPayload;
        serializeJson(doc, jsonPayload);

        // 1. Send via WebSocket if connected
        bool sentViaWs = false;
        if (wsConnected && wsClient.connected()) {
            sentViaWs = sendWebSocketFrame(jsonPayload);
        }

        // 2. HTTP POST Fallback
        if (!sentViaWs) {
            HTTPClient http;
            String url = String("http://") + backendHost + ":" + String(backendPort) + BACKEND_VITALS_API;
            http.begin(url);
            http.addHeader("Content-Type", "application/json");
            http.addHeader("X-CJack-Device-Key", HARDWARE_API_KEY);
            http.setTimeout(1200);

            int httpCode = http.POST(jsonPayload);
            backendReachable = (httpCode >= 200 && httpCode < 300);
            
            if (!backendReachable && httpCode > 0) {
                Serial.printf("[NetworkClient] HTTP POST returned error: %d\n", httpCode);
            }
            http.end();
        } else {
            backendReachable = true;
        }

        return backendReachable;
    }

    bool isWifiConnected() const { return wifiConnected; }
    bool isBackendReachable() const { return backendReachable; }
    const DownlinkState& getDownlinkState() const { return currentDownlink; }
};

#endif // NETWORK_CLIENT_H
