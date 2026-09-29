# CJack Platform Backend

A clean, production-grade Express.js backend for the CJack Smart Wearable First-Aid Jacket system.

## Quick Start

```powershell
cd BackEnd
npm install
npm run dev     # Starts on http://localhost:5000
npm test        # Runs automated test suite (39 tests)
```

## Architecture

Layered architecture with strict separation of concerns:
- **`config/`**: Centralized environment validation (`env.js`) and resilient MongoDB connection (`database.js`).
- **`models/`**: 10 Mongoose schemas (`User`, `Patient`, `Device`, `VitalReading`, `CPRSession`, `Emergency`, `Location`, `Responder`, `DeviceEvent`, `CommunicationPacket`).
- **`middleware/`**: JWT authentication (`authMiddleware.js`), RBAC (`roleMiddleware.js`), payload validation (`validateMiddleware.js`), and centralized error handling (`errorHandler.js`).
- **`services/`**: Business logic completely decoupled from HTTP protocols.
- **`controllers/`**: Request/response orchestration returning standard `{ success, data, message, errors }` envelopes.
- **`routes/`**: 10 REST API groups + simulation endpoints + backward compatible route aliases.
- **`utils/`**: `apiResponse.js`, `jwt.js`, `logger.js`.

For full documentation of environment variables, endpoints, and data contracts, see the root [`README.md`](../README.md).
