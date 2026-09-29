# CJack Hardware Data Contract & Integration Specification

**Version**: `v1.0.0-hw`  
**Target Hardware Platforms**: 
- Espressif ESP32-WROOM-32 (Main Vest Controller)
- LILYGO TTGO T-Beam v1.1 (LoRa SX1262 + u-blox NEO-6M GNSS)

---

## 1. Zero-Pretense Invariant

> [!IMPORTANT]
> The CJack software strictly distinguishes between:
> - **`SIMULATED`**: The system is operating in pure demonstration / simulation mode with synthetic test vectors. No physical MCU is linked.
> - **`CONNECTED`**: An authentic physical microcontroller is actively transmitting valid telemetry packets matching the contract within the heartbeat timeout window (8,000 ms).
> - **`DISCONNECTED`**: Physical mode is active or was previously active, but no telemetry packet has arrived within the 8,000 ms timeout window. The system displays `DISCONNECTED` and alerts the operator.
> - **`FAULT`**: The physical device has communicated, but reported an active sensor or actuator fault (e.g. electrode detachment, probe loss, motor thermal shutdown).
> - **`UNKNOWN`**: Uninitialized or pending boot verification.
>
> **The system will NEVER mask a disconnected hardware device with fake data.**

---

## 2. Peripheral Bus & Pinout Assignment

| Subsystem | Target IC / Transducer | Interface Bus | Microcontroller Pins |
| :--- | :--- | :--- | :--- |
| **ECG** | Analog Devices AD8232 / ADS1292R | Analog ADC + GPIO | ADC1_CH0 (GPIO36), LO+ (GPIO34), LO- (GPIO35) |
| **SpO2 / HR** | Maxim MAX30102 Optical PPG | I2C (Addr: `0x57`) | SDA (GPIO21), SCL (GPIO22), INT (GPIO19) |
| **Motion** | TDK InvenSense MPU6050 6-Axis | I2C (Addr: `0x68`) | SDA (GPIO21), SCL (GPIO22), INT (GPIO18) |
| **Respiration** | Thoracic Piezo Strain Transducer | Analog ADC | ADC1_CH3 (GPIO39 / VN) |
| **Load Cell** | Avia Semi HX711 24-bit ADC | 2-Wire Serial | DOUT (GPIO16), SCK (GPIO4) |
| **CPR Motor** | TI DRV8825 / BTS7960 43A Driver | High-Power PWM | PWM (GPIO25), DIR (GPIO26), EN (GPIO27), FAULT (GPIO33) |
| **GPS / GNSS** | u-blox NEO-6M GNSS Engine | UART Serial (9600) | RX (GPIO34), TX (GPIO12) |
| **LoRa** | Semtech SX1262 Sub-GHz Radio | SPI | CS (GPIO18), SCK (GPIO5), MISO (GPIO19), MOSI (GPIO27), DIO1 (GPIO23) |
| **Battery BMS** | LiFePO4 4S2P / TI BQ27441 | I2C (Addr: `0x55`) | SDA (GPIO21), SCL (GPIO22) |
| **Vest Display**| Solomon Systech SSD1306 OLED | I2C (Addr: `0x3C`) | SDA (GPIO21), SCL (GPIO22) |
| **Speaker** | Maxim MAX98357A I2S DAC | Digital I2S Audio | BCLK (GPIO26), LRC/WS (GPIO25), DIN (GPIO22) |

---

## 3. Telemetry JSON Data Contract

### Endpoint:
`POST /api/hardware/telemetry`

### Headers:
- `Content-Type: application/json`
- `X-CJack-Hardware-Source: physical`

### Example Payload:
```json
{
  "deviceId": "CJACK-ESP32-01",
  "firmwareVersion": "v1.0.0-hw",
  "timestamp": 1726900000000,
  "hardwareSource": "PHYSICAL",
  "sensors": {
    "ecg": {
      "leadsConnected": true,
      "leadOffPlus": false,
      "leadOffMinus": false,
      "rawMv": 1.24,
      "signalQuality": 96
    },
    "heartRate": 74,
    "spo2": {
      "percentage": 98,
      "perfusionIndex": 4.2,
      "fingerDetected": true,
      "ambientLightFault": false
    },
    "motion": {
      "ax": 0.02,
      "ay": 0.01,
      "az": 0.98,
      "gx": 0.1,
      "gy": -0.2,
      "gz": 0.0,
      "fallDetected": false,
      "posture": "SUPINE"
    },
    "respiration": {
      "rate": 16,
      "amplitude": 45,
      "sensorFault": false
    }
  },
  "cpr": {
    "active": false,
    "rate": 0,
    "depth": 0,
    "force": 0,
    "compressionCount": 0,
    "motorStatus": "STANDBY",
    "driverTempC": 31.8,
    "fault": false
  },
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "accuracy": 2.5,
    "fixType": "3D_FIX",
    "satellites": 11
  },
  "connectivity": {
    "gps": "LOCKED",
    "lora": "JOINED",
    "backend": "CONNECTED",
    "loraRssi": -72,
    "loraSnr": 9.5
  },
  "battery": {
    "percentage": 88,
    "voltage": 14.8,
    "currentMa": 120,
    "isCharging": false,
    "fault": false
  }
}
```

---

## 4. Downlink Hardware Commands

The backend returns pending commands in the HTTP response of `POST /api/hardware/telemetry`, or when dispatched via `POST /api/hardware/command`:

### Motor Command:
```json
{
  "command": "START_CPR",
  "targetRate": 110,
  "targetDepthMm": 55,
  "timestamp": "2026-09-23T07:30:00.000Z"
}
```

### Emergency Cutoff Command:
```json
{
  "command": "EMERGENCY_BRAKE",
  "cutoffSpeedMs": 15,
  "timestamp": "2026-09-23T07:30:00.000Z"
}
```

### Metronome Audio Command:
```json
{
  "command": "PLAY_METRONOME",
  "bpm": 110,
  "frequencyHz": 880
}
```
