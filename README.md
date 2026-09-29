# CJack — Smart Automated First-Aid Jacket

> **Emergency Medical & IoT Platform Specification**  
> *Autonomous Cardiac Arrest Detection, Automated Resuscitation Mechanics, Multi-Sensor Telemetry, and LoRaWAN Dispatch Infrastructure.*

---

## ⚠️ Prototype / Simulation Platform Notice
> **IMPORTANT**: This software platform is a simulation, development, and research harness for the CJack wearable smart first-aid system. Simulated physiological metrics, telemetry packets, and diagnostics are for testing hardware-in-the-loop logic and user interfaces, **not for real clinical diagnosis or direct medical use**.

---

## System Overview

CJack is a wearable emergency medical vest designed to save lives during out-of-hospital cardiac arrests (OHCA). It continuously monitors patient biometrics, detects sudden cardiac arrests using dual-sensor cross-validation, arms and drives automated chest compressions with precise force and depth closed-loop feedback, provides motorized ambient-air assistance, obtains GPS coordinates, and broadcasts high-priority emergency telemetry over LoRa and cellular bridges.

---

## Backend Architecture

The CJack backend is engineered as a clean, production-ready layered Express application adhering to strict separation of concerns:

```
BackEnd/
├── src/
│   ├── config/
│   │   ├── env.js                  # Centralized environment variable validation & defaults
│   │   └── database.js             # Mongoose connection manager with non-blocking fallback
│   ├── models/
│   │   ├── index.js                # Single import point for all 10 models
│   │   ├── User.js                 # RBAC, bcrypt password hashing, JWT credentials
│   │   ├── Patient.js              # Demographics, blood group, allergies, medical notes
│   │   ├── Device.js               # Hardware serial, firmware, operating mode, diagnostics
│   │   ├── VitalReading.js         # HR, SpO2, EtCO2, respiration, ECG rhythm, motion
│   │   ├── CPRSession.js           # Closed-loop resuscitation metrics, depth, rate, recoil
│   │   ├── Emergency.js            # Cardiac arrest lifecycle, escalation flow, timeline
│   │   ├── Location.js             # GNSS / GPS coordinates, altitude, accuracy, routing
│   │   ├── Responder.js            # ALS ambulances, paramedic units, dispatch status
│   │   ├── DeviceEvent.js          # Hardware event log, self-test records, alarms
│   │   └── CommunicationPacket.js  # Dual-path telemetry (LoRa, 4G LTE-M, BLE, Sat)
│   ├── utils/
│   │   ├── apiResponse.js          # Standardized { success, data, message, errors } builder
│   │   ├── jwt.js                  # JWT token signing & verification
│   │   └── logger.js               # Structured logger with ISO timestamps and log levels
│   ├── middleware/
│   │   ├── authMiddleware.js       # Bearer JWT verification & req.user injection
│   │   ├── roleMiddleware.js       # Role-based authorization guard (admin, responder, etc.)
│   │   ├── validateMiddleware.js   # Request payload validation helper
│   │   └── errorHandler.js         # Centralized Mongoose, CastError & syntax error handler
│   ├── services/
│   │   ├── authService.js          # User registration, login, profile management
│   │   ├── patientService.js       # Patient CRUD, clinical records, simulation sync
│   │   ├── deviceService.js        # Device registry, operational modes, diagnostics
│   │   ├── vitalService.js         # Telemetry ingestion, historical ranges, alerts
│   │   ├── cprService.js           # Resuscitation state machine & compression analytics
│   │   ├── emergencyService.js     # SOS dispatch, flow progression, timeline management
│   │   ├── locationService.js      # GPS telemetry recording, proximity & routing
│   │   ├── responderService.js     # Responder dispatch, status & clinical handover packets
│   │   ├── eventService.js         # Device telemetry logs, event queries, audit trails
│   │   ├── communicationService.js # Packet ingestion, LoRa gateway metrics, offline queue
│   │   └── simulationService.js    # Simulation engines with explicit isSimulated: true labeling
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── deviceController.js
│   │   ├── vitalController.js
│   │   ├── cprController.js
│   │   ├── emergencyController.js
│   │   ├── locationController.js
│   │   ├── responderController.js
│   │   ├── eventController.js
│   │   ├── communicationController.js
│   │   └── simulationController.js
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth
│   │   ├── patientRoutes.js        # /api/patients & /api/patient
│   │   ├── deviceRoutes.js         # /api/devices & /api/device
│   │   ├── vitalRoutes.js          # /api/vitals
│   │   ├── cprRoutes.js            # /api/cpr
│   │   ├── emergencyRoutes.js      # /api/emergencies & /api/emergency
│   │   ├── locationRoutes.js       # /api/location
│   │   ├── responderRoutes.js      # /api/responders & /api/responder
│   │   ├── eventRoutes.js          # /api/events
│   │   ├── communicationRoutes.js  # /api/communication & /api/connectivity
│   │   ├── simulationRoutes.js     # /api/simulation
│   │   ├── systemRoutes.js         # Legacy compatibility
│   │   ├── telemetryRoutes.js      # Legacy compatibility
│   │   └── voiceRoutes.js          # Voice guidance compatibility
│   └── server.js                   # Application bootstrap & middleware pipeline
├── .env.example
├── .env
├── package.json
└── test_production_backend.js       # End-to-end automated API verification suite
```

---

## Environment Variables

Configure backend settings via `BackEnd/.env`:

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | HTTP port for the Express application |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed origin for Cross-Origin Resource Sharing |
| `SIMULATION_MODE` | `true` | When `true`, realistic simulated physiological metrics are generated |
| `HARDWARE_API_KEY` | `cjack_dev_hw_key_2026` | Token required for ESP32 / LoRa hardware ingestion |
| `JWT_SECRET` | `cjack_super_secure_jwt_dev_secret_key_2026` | Secret key for JWT generation and verification |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `MONGODB_URI` | `mongodb://localhost:27017/cjack_db` | MongoDB connection URI (falls back gracefully if offline) |

---

## Database Setup

1. **MongoDB Connection**:
   - The backend uses Mongoose 8 to connect to MongoDB at `MONGODB_URI`.
   - Start your local MongoDB server (e.g., via `mongod` or Docker):
     ```bash
     docker run -d -p 27017:27017 --name cjack-mongo mongo:latest
     ```
2. **Resilient In-Memory Fallback Mode**:
   - If MongoDB is not running or unreachable, the backend logs a connection notice and **automatically falls back to in-memory simulation stores**.
   - Demo mode, frontend testing, automated tests, and local development remain **100% operational out of the box** without crashing.
   - When MongoDB is active, data is automatically indexed and persisted across collections.

---

## Mongoose Models

1. **`User`**: Authentication credentials, hashed password (bcrypt), role (`admin`, `responder`, `doctor`, `technician`, `user`), activity timestamps.
2. **`Patient`**: Demographics (`patientId`, `name`, `age`, `gender`, `bloodGroup`), emergency contacts, allergies, medical notes.
3. **`Device`**: Hardware registry (`deviceId`, `serialNumber`, `firmwareVersion`), battery voltage/health, actuator pressure, operational mode, diagnostics.
4. **`VitalReading`**: Time-series biometrics (`heartRate`, `spo2`, `respirationRate`, `perfusionIndex`, `etco2`, `ecgRhythm`, `motionState`, `temperature`), source, `isSimulated`.
5. **`CPRSession`**: Compression analytics (`totalCompressions`, `targetRate`, `currentRate`, `targetDepthMm`, `currentDepthMm`, `chestRecoilPercentage`, `appliedForceNewtons`, `roscAchieved`).
6. **`Emergency`**: Emergency state machine (`status`, `alertLevel`, `cardiacArrestDetected`, `flowStage`, `gpsCoordinates`, `timeline` audit entries).
7. **`Location`**: GNSS / GPS telemetry (`latitude`, `longitude`, `altitudeMeters`, `accuracyMeters`, `speedKmh`, `heading`, `addressHint`).
8. **`Responder`**: First responder and ambulance tracking (`responderId`, `callsign`, `unitType`, `status`, `currentLocation`, `etaMinutes`, `distanceKm`).
9. **`DeviceEvent`**: System event audit log (`eventId`, `eventType`, `category`, `message`, `severity`, `rawPayload`).
10. **`CommunicationPacket`**: Telemetry packets across LoRa, 4G LTE-M, BLE, or Satellite (`protocol`, `payloadType`, `rawData`, `parsedData`, `rssi`, `snr`, `frequency`, `gatewayId`).

---

## REST API Groups

All endpoints return a consistent JSON response structure:
- **Success**: `{ "success": true, "data": { ... }, "message": "..." }`
- **Error**: `{ "success": false, "message": "...", "errors": [ ... ] }`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user and receive Bearer JWT |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile (requires `Bearer <token>`) |

### 2. Patients (`/api/patients` & `/api/patient`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/patients` | Retrieve current patient profile |
| `GET` | `/api/patients/all` | List all registered patient records |
| `GET` | `/api/patients/:id` | Get specific patient profile |
| `PUT` | `/api/patients` | Update patient profile with clinical validation |
| `POST` | `/api/patients` | Register new patient profile |

### 3. Devices (`/api/devices` & `/api/device`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/devices` | List registered CJack devices |
| `GET` | `/api/devices/overview` | 11-point device telemetry overview |
| `GET` | `/api/devices/sensors` | 7-channel diagnostic sensor array table |
| `GET` | `/api/devices/modes` | Operating mode definitions and capabilities |
| `POST` | `/api/devices/mode` | Set device operating mode (`MONITORING`, `CPR_CLOSED_LOOP`, etc.) |
| `GET` | `/api/devices/maintenance` | Maintenance records, SoH scores, and error history |
| `POST` | `/api/devices/maintenance/self-test` | Trigger diagnostic self-test |

### 4. Physiological Vitals (`/api/vitals`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vitals` | Retrieve current live vitals (HR, SpO2, EtCO2, ECG, Motion) |
| `GET` | `/api/vitals/history` | Historical vital series (`?range=1m\|5m\|15m\|session`) |
| `POST` | `/api/vitals` | Ingest physiological measurement |
| `POST` | `/api/vitals/simulate` | Generate simulated vitals reading |

### 5. Resuscitation & CPR (`/api/cpr`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cpr` or `/api/cpr/state` | Current CPR state, active metrics, and safety flags |
| `POST` | `/api/cpr/transition` | State machine transition request (`MONITORING`, `CPR_ACTIVE`, etc.) |
| `POST` | `/api/cpr/emergency-stop` | Instantaneous hardware/software E-Stop |
| `POST` | `/api/cpr/simulator` | Update simulation cadence and closed-loop parameters |
| `GET` | `/api/cpr/analytics` | Active or previous session compression analytics |
| `POST` | `/api/cpr/reset` | Reset CPR session counters |

### 6. Emergencies (`/api/emergencies` & `/api/emergency`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/emergencies` | Current emergency state, alert status, and telemetry |
| `POST` | `/api/emergencies/alert-state` | Transition alert state (`STANDBY`, `SOS BROADCASTING`, etc.) |
| `POST` | `/api/emergencies/advance-flow` | Advance or jump emergency workflow stage |
| `POST` | `/api/emergencies/trigger` | Trigger simulated cardiac arrest sequence |
| `POST` | `/api/emergencies/reset` | Reset emergency to normal standby |
| `GET` | `/api/emergencies/timeline` | Chronological emergency event audit timeline |
| `POST` | `/api/emergencies/contact/notify` | Simulate emergency contact notification |

### 7. Location & GNSS (`/api/location`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/location` | Current GPS coordinates and positioning metrics |
| `GET` | `/api/location/history` | GPS waypoint history points |
| `POST` | `/api/location` | Ingest/update GPS coordinates |
| `POST` | `/api/location/simulate-packet` | Generate simulated GPS telemetry packet |

### 8. Responders & ALS (`/api/responders` & `/api/responder`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/responders` | List active emergency responder units |
| `GET` | `/api/responders/status` | Current responder status, unit callsign, ETA, and distance |
| `POST` | `/api/responders/state` | Transition responder machine (`EN_ROUTE`, `ARRIVED`, etc.) |
| `GET` | `/api/responders/handover` | Full clinical handover data packet |
| `POST` | `/api/responders/handover/export` | Export structured clinical session audit record |

### 9. Events & Audit (`/api/events`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | Retrieve device & system events log (`?limit=25&category=&severity=`) |
| `POST` | `/api/events` | Record a new device event |
| `POST` | `/api/events/simulate` | Generate a simulated diagnostic event |

### 10. Communication & Radios (`/api/communication` & `/api/connectivity`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/communication/status` | LoRa, GNSS, Gateway, Signal, and diagnostic network states |
| `POST` | `/api/communication/packet` | Ingest structured telemetry packet |
| `GET` | `/api/communication/packets` | Retrieve packet buffer log |
| `POST` | `/api/communication/offline-queue/simulate` | Step or control offline queue simulation |
| `POST` | `/api/communication/network-state` | Update multi-state diagnostic flags |

---

## Simulation Mode API (`/api/simulation`)

The simulation subsystem allows frontend demo mode to generate realistic synthetic telemetry for demonstration and verification. All simulated data is clearly labeled with `"isSimulated": true` and `"simulation": true`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/simulation/status` | Full simulated system state snapshot |
| `POST` | `/api/simulation/vitals` | Generate simulated vitals reading with natural physiological jitter |
| `POST` | `/api/simulation/cpr` | Generate simulated CPR compression metrics |
| `POST` | `/api/simulation/sensors` | Generate simulated 7-channel sensor diagnostic array status |
| `POST` | `/api/simulation/device` | Generate simulated device health and battery status |
| `POST` | `/api/simulation/emergency` | Generate simulated cardiac arrest emergency sequence |
| `POST` | `/api/simulation/gps` | Generate simulated GNSS GPS packet with coordinate jitter |
| `POST` | `/api/simulation/reset` | Reset all simulation parameters to normal standby |

---

## Development Commands

### Backend Commands
From `c:\Users\TUF\Desktop\C-JACKDSP\BackEnd`:
```powershell
# Install dependencies
npm install

# Start development server with auto-reload (nodemon)
npm run dev

# Start production server
npm start

# Run end-to-end automated API verification test suite (39 tests)
npm test
```

### Frontend Commands
From `c:\Users\TUF\Desktop\C-JACKDSP\FrontEnd`:
```powershell
# Install frontend dependencies
npm install

# Start Vite development server (http://localhost:5173)
npm run dev

# Build production bundle
npm run build
```

---

## Pre-Seeded Demo Credentials

For testing authentication immediately without manual database seeding:

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@cjack.health` | `Admin@1234` |
| First Responder / Paramedic | `medic@cjack.health` | `Medic@1234` |
| Patient / Wearer | `user@cjack.health` | `User@1234` |
