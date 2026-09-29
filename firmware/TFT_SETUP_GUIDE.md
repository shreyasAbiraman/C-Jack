# CJack TFT LCD (ILI9488 / ILI9486 480x320 Touch Display) Guide

This guide details how to run the interactive CJack Resuscitation Monitor on an **ESP32** connected to a **3.5" ILI9488 / ILI9486 SPI TFT Display with XPT2046 Touch Screen**.

---

## 1. Hardware Pinout Wiring Diagram (Display + Touch)

The 3.5" TFT module exposes pins for both the **LCD display** and the **Touch screen (XPT2046)**. Both devices share the same hardware SPI bus lines (`SCK`, `MOSI`, `MISO`), each with its own Chip Select (`CS` and `T_CS`).

| Module Pin Label | ESP32 Pin | Function / Description |
| :--- | :--- | :--- |
| **VCC** | **5V** or **3.3V** | Module Power |
| **GND** | **GND** | Ground |
| **LCD_CS / CS** | **GPIO 15** | LCD Display Chip Select |
| **RESET / RST** | **GPIO 4** | Hardware Reset (or connect to ESP32 `EN`) |
| **DC / RS** | **GPIO 2** | Data / Command Select |
| **SDI (MOSI) / T_DIN** | **GPIO 23** | SPI Master Out Slave In (Shared for LCD + Touch) |
| **SCK / T_CLK** | **GPIO 18** | SPI Clock (Shared for LCD + Touch) |
| **LED / BL** | **3.3V** or **GPIO 32** | Backlight Power / Control |
| **SDO (MISO) / T_DO** | **GPIO 19** | SPI Master In (**Required for Touch reading**) |
| **T_CS** | **GPIO 21** | **Touch Controller (XPT2046) Chip Select** |
| **T_IRQ** | *Not Connected* / **GPIO 27** | Touch Interrupt (Optional) |

---

## 2. On-Screen Interactive Touch Features

1. **START / STOP CPR Button**:
   - Tapping toggles the automated chest compression subsystem and visual metronome (100–120 CPM).
   - Inverts color to High-Vis Red ("STOP CPR") when active.
2. **TRIGGER SOS Button**:
   - One-touch emergency trigger.
   - Immediately alerts the cloud backend and EMS dispatch with GPS location.
3. **Auto Touch Calibration**:
   - On the first boot, the firmware displays a quick 4-corner touch calibration wizard.
   - Calibration offsets are saved to SPIFFS flash memory so you only need to calibrate once.

---

## 3. Arduino IDE Setup Instructions

### Step 1: Install Required Libraries
In Arduino IDE (**Tools -> Manage Libraries...**):
- **`TFT_eSPI`** (by Bodmer)
- **`ArduinoJson`** (by Benoit Blanchon, v6 or v7)

### Step 2: Configure `TFT_eSPI`
1. Navigate to: `Documents/Arduino/libraries/TFT_eSPI/`
2. Replace `User_Setup.h` in that folder with [`firmware/User_Setup_ILI9488.h`](file:///c:/Users/TUF/Desktop/C-JACKDSP/firmware/User_Setup_ILI9488.h) (rename it to `User_Setup.h`).

### Step 3: Flash to ESP32
1. Open [`firmware/esp32_cjack_tft_ili9488/esp32_cjack_tft_ili9488.ino`](file:///c:/Users/TUF/Desktop/C-JACKDSP/firmware/esp32_cjack_tft_ili9488/esp32_cjack_tft_ili9488.ino).
2. Update your `WIFI_SSID`, `WIFI_PASS`, and `BACKEND_URL`.
3. Board: **ESP32 Dev Module**
4. Flash Size: **4MB (SPIFFS enabled)**
5. Click **Upload**.
