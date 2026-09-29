/**
 * ==============================================================================
 * CJack First-Aid Vest & Resuscitation Platform
 * Dedicated TFT Display Dashboard Driver (TFTDashboard.h)
 * ==============================================================================
 * Implements clean medical-device style interface:
 * - High-contrast dark theme
 * - Extra-large dynamic Heart-Rate indicator (shows real value or "-- BPM")
 * - Optical sensor health badge (CONNECTED / DISCONNECTED / CHECK)
 * - Real-time SpO2, CPR, GPS, Wi-Fi, and Battery telemetry
 * - Dynamic Multi-State Emergency Dispatch Banner
 * ==============================================================================
 */

#ifndef TFT_DASHBOARD_H
#define TFT_DASHBOARD_H

#include <TFT_eSPI.h>
#include "../config/hardware_config.h"
#include "../sensors/HeartRateSensor.h"

// Medical Color Palette (RGB565)
#define COLOR_DARK_BG       0x0821  // Deep Hospital Dark Navy/Charcoal
#define COLOR_CARD_BG       0x1082  // Card Surface
#define COLOR_CARD_BORDER   0x2124  // Border Accent
#define COLOR_HEADER_TEXT   0x07FF  // Cyan
#define COLOR_HR_RED        0xF800  // Cardiac Red
#define COLOR_SPO2_CYAN     0x07FF  // SpO2 Cyan
#define COLOR_TEXT_WHITE    0xFFFF  // Crisp White
#define COLOR_TEXT_MUTED    0x8410  // Medical Gray
#define COLOR_STATUS_GREEN  0x07E0  // Healthy Green
#define COLOR_STATUS_WARN   0xFDA0  // Warning Amber
#define COLOR_STATUS_RED    0xF800  // Alarm Red
#define COLOR_STATUS_BLUE   0x3D9F  // En Route Blue

enum EmergencyDisplayState {
    EMG_STATE_READY = 0,
    EMG_STATE_DISPATCHING,
    EMG_STATE_CALLING_3,
    EMG_STATE_ASSIGNED,
    EMG_STATE_EN_ROUTE,
    EMG_STATE_ARRIVED
};

struct TFTDashboardData {
    int heartRate;
    int spo2;
    float perfusionIndex;
    const char* sensorStatusText;
    bool sensorConnected;
    bool cprActive;
    int cprRate;
    bool gpsConnected;
    bool wifiConnected;
    int batteryPercentage;
    EmergencyDisplayState emergencyState;
    char assignedAmbulanceId[16];
    char patientName[32];
};

class TFTDashboard {
private:
    TFT_eSPI tft;
    int prevHeartRate;
    int prevSpO2;
    bool prevWifi;
    bool prevGps;
    bool prevCpr;
    int prevBattery;
    EmergencyDisplayState prevEmgState;
    unsigned long lastBlinkMs;
    bool blinkState;

public:
    TFTDashboard() :
        tft(TFT_eSPI()),
        prevHeartRate(-999),
        prevSpO2(-999),
        prevWifi(false),
        prevGps(false),
        prevCpr(false),
        prevBattery(-1),
        prevEmgState(EMG_STATE_READY),
        lastBlinkMs(0),
        blinkState(false)
    {}

    void begin() {
        tft.init();
        tft.setRotation(TFT_ROTATION);
        tft.fillScreen(COLOR_DARK_BG);
        drawStaticLayout();
    }

    void drawStaticLayout() {
        tft.fillScreen(COLOR_DARK_BG);

        // 1. Header Bar
        tft.fillRect(0, 0, 480, 42, 0x0000);
        tft.drawFastHLine(0, 42, 480, COLOR_HEADER_TEXT);
        tft.setTextColor(COLOR_HEADER_TEXT, 0x0000);
        tft.setTextSize(2);
        tft.setCursor(15, 12);
        tft.print("C-JACK | SMART FIRST-AID VEST");

        tft.setTextColor(COLOR_TEXT_MUTED, 0x0000);
        tft.setTextSize(1);
        tft.setCursor(350, 16);
        tft.print("NODE: " DEVICE_ID);

        // 2. Primary Vitals Card (Left Column)
        tft.fillRoundRect(10, 50, 240, 200, 8, COLOR_CARD_BG);
        tft.drawRoundRect(10, 50, 240, 200, 8, COLOR_CARD_BORDER);

        tft.setTextColor(COLOR_HR_RED, COLOR_CARD_BG);
        tft.setTextSize(2);
        tft.setCursor(22, 60);
        tft.print("<3 HEART RATE");

        // 3. SpO2 & Status Card (Right Column)
        tft.fillRoundRect(260, 50, 210, 200, 8, COLOR_CARD_BG);
        tft.drawRoundRect(260, 50, 210, 200, 8, COLOR_CARD_BORDER);

        tft.setTextColor(COLOR_SPO2_CYAN, COLOR_CARD_BG);
        tft.setTextSize(2);
        tft.setCursor(272, 60);
        tft.print("SpO2 LEVEL");

        // 4. Emergency & System Status Bottom Banner
        drawEmergencyBanner(EMG_STATE_READY, "");
    }

    void update(const TFTDashboardData& data) {
        // --- 1. Heart Rate Rendering ---
        if (data.heartRate != prevHeartRate) {
            prevHeartRate = data.heartRate;

            // Clear HR number area inside card
            tft.fillRect(20, 90, 220, 75, COLOR_CARD_BG);
            tft.setTextColor(COLOR_TEXT_WHITE, COLOR_CARD_BG);

            if (data.heartRate > 0) {
                tft.setTextSize(6); // Extra Large Number
                tft.setCursor(25, 95);
                tft.printf("%3d", data.heartRate);

                tft.setTextSize(2);
                tft.setTextColor(COLOR_HR_RED, COLOR_CARD_BG);
                tft.setCursor(160, 130);
                tft.print("BPM");
            } else {
                tft.setTextSize(6);
                tft.setTextColor(COLOR_TEXT_MUTED, COLOR_CARD_BG);
                tft.setCursor(30, 95);
                tft.print("--");

                tft.setTextSize(2);
                tft.setCursor(130, 130);
                tft.print("BPM");
            }

            // Sensor Status Indicator Badge
            tft.fillRect(20, 195, 220, 30, COLOR_CARD_BG);
            tft.setTextSize(1);
            if (data.sensorConnected) {
                tft.setTextColor(COLOR_STATUS_GREEN, COLOR_CARD_BG);
                tft.setCursor(25, 200);
                tft.print("[OK] ");
                tft.print(data.sensorStatusText);
            } else {
                tft.setTextColor(COLOR_STATUS_WARN, COLOR_CARD_BG);
                tft.setCursor(25, 200);
                tft.print("[!] ");
                tft.print(data.sensorStatusText);
            }
        }

        // --- 2. SpO2 Rendering ---
        if (data.spo2 != prevSpO2) {
            prevSpO2 = data.spo2;
            tft.fillRect(270, 90, 190, 45, COLOR_CARD_BG);

            if (data.spo2 > 0) {
                tft.setTextSize(4);
                tft.setTextColor(COLOR_SPO2_CYAN, COLOR_CARD_BG);
                tft.setCursor(275, 95);
                tft.printf("%2d %%", data.spo2);
            } else {
                tft.setTextSize(4);
                tft.setTextColor(COLOR_TEXT_MUTED, COLOR_CARD_BG);
                tft.setCursor(275, 95);
                tft.print("-- %");
            }
        }

        // --- 3. Hardware Status Indicators List ---
        // CPR Status
        tft.setTextSize(1);
        tft.setCursor(272, 145);
        tft.setTextColor(COLOR_TEXT_MUTED, COLOR_CARD_BG);
        tft.print("CPR: ");
        if (data.cprActive) {
            tft.setTextColor(COLOR_STATUS_GREEN, COLOR_CARD_BG);
            tft.printf("ACTIVE (%d CPM)", data.cprRate);
        } else {
            tft.setTextColor(COLOR_TEXT_MUTED, COLOR_CARD_BG);
            tft.print("INACTIVE           ");
        }

        // GPS Status
        tft.setCursor(272, 165);
        tft.setTextColor(COLOR_TEXT_MUTED, COLOR_CARD_BG);
        tft.print("GPS: ");
        if (data.gpsConnected) {
            tft.setTextColor(COLOR_STATUS_GREEN, COLOR_CARD_BG);
            tft.print("CONNECTED    ");
        } else {
            tft.setTextColor(COLOR_STATUS_WARN, COLOR_CARD_BG);
            tft.print("SEARCHING... ");
        }

        // Wi-Fi Status
        tft.setCursor(272, 185);
        tft.setTextColor(COLOR_TEXT_MUTED, COLOR_CARD_BG);
        tft.print("WiFi: ");
        if (data.wifiConnected) {
            tft.setTextColor(COLOR_STATUS_GREEN, COLOR_CARD_BG);
            tft.print("CONNECTED    ");
        } else {
            tft.setTextColor(COLOR_STATUS_RED, COLOR_CARD_BG);
            tft.print("DISCONNECTED ");
        }

        // Battery Status
        tft.setCursor(272, 205);
        tft.setTextColor(COLOR_TEXT_MUTED, COLOR_CARD_BG);
        tft.print("BATTERY: ");
        if (data.batteryPercentage > 20) {
            tft.setTextColor(COLOR_STATUS_GREEN, COLOR_CARD_BG);
        } else {
            tft.setTextColor(COLOR_STATUS_RED, COLOR_CARD_BG);
        }
        tft.printf("%d%%     ", data.batteryPercentage);

        // --- 4. Bottom Emergency Banner ---
        if (data.emergencyState != prevEmgState || (millis() - lastBlinkMs > 600)) {
            prevEmgState = data.emergencyState;
            lastBlinkMs = millis();
            blinkState = !blinkState;
            drawEmergencyBanner(data.emergencyState, data.assignedAmbulanceId);
        }
    }

    void drawEmergencyBanner(EmergencyDisplayState state, const char* assignedId) {
        int bannerY = 258;
        int bannerH = 54;

        switch (state) {
            case EMG_STATE_READY:
                tft.fillRoundRect(10, bannerY, 460, bannerH, 6, 0x0320); // Dark Green
                tft.drawRoundRect(10, bannerY, 460, bannerH, 6, COLOR_STATUS_GREEN);
                tft.setTextColor(COLOR_STATUS_GREEN, 0x0320);
                tft.setTextSize(2);
                tft.setCursor(130, bannerY + 18);
                tft.print("[ SYSTEM: READY ]");
                break;

            case EMG_STATE_DISPATCHING:
            case EMG_STATE_CALLING_3:
                {
                    uint16_t bg = blinkState ? COLOR_STATUS_RED : 0x5000;
                    tft.fillRoundRect(10, bannerY, 460, bannerH, 6, bg);
                    tft.drawRoundRect(10, bannerY, 460, bannerH, 6, COLOR_TEXT_WHITE);
                    tft.setTextColor(COLOR_TEXT_WHITE, bg);
                    tft.setTextSize(2);
                    tft.setCursor(25, bannerY + 8);
                    tft.print("!! EMERGENCY: DISPATCHING !!");
                    tft.setTextSize(1);
                    tft.setCursor(25, bannerY + 32);
                    tft.print("Simultaneously calling 3 configured ambulances...");
                }
                break;

            case EMG_STATE_ASSIGNED:
                tft.fillRoundRect(10, bannerY, 460, bannerH, 6, 0x0015); // Deep Blue
                tft.drawRoundRect(10, bannerY, 460, bannerH, 6, COLOR_STATUS_BLUE);
                tft.setTextColor(COLOR_TEXT_WHITE, 0x0015);
                tft.setTextSize(2);
                tft.setCursor(25, bannerY + 8);
                tft.print("EMERGENCY: AMBULANCE ASSIGNED");
                tft.setTextSize(1);
                tft.setTextColor(COLOR_SPO2_CYAN, 0x0015);
                tft.setCursor(25, bannerY + 34);
                tft.printf("RESPONDER ID: %s (ACCEPTED FIRST)", (assignedId && strlen(assignedId)) ? assignedId : "AMB-02");
                break;

            case EMG_STATE_EN_ROUTE:
                tft.fillRoundRect(10, bannerY, 460, bannerH, 6, 0x0210); // Medical Navy
                tft.drawRoundRect(10, bannerY, 460, bannerH, 6, COLOR_HEADER_TEXT);
                tft.setTextColor(COLOR_HEADER_TEXT, 0x0210);
                tft.setTextSize(2);
                tft.setCursor(50, bannerY + 18);
                tft.print("AMBULANCE EN ROUTE TO SCENE");
                break;

            case EMG_STATE_ARRIVED:
                tft.fillRoundRect(10, bannerY, 460, bannerH, 6, 0x0320);
                tft.drawRoundRect(10, bannerY, 460, bannerH, 6, COLOR_STATUS_GREEN);
                tft.setTextColor(COLOR_TEXT_WHITE, 0x0320);
                tft.setTextSize(2);
                tft.setCursor(60, bannerY + 18);
                tft.print("RESPONDER ARRIVED AT SCENE");
                break;
        }
    }
};

#endif // TFT_DASHBOARD_H
