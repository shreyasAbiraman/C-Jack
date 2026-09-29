const env = require('./config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB, getDBStatus } = require('./config/database');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const vitalRoutes = require('./routes/vitalRoutes');
const cprRoutes = require('./routes/cprRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const locationRoutes = require('./routes/locationRoutes');
const responderRoutes = require('./routes/responderRoutes');
const eventRoutes = require('./routes/eventRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const hardwareRoutes = require('./routes/hardwareRoutes');
const ambulanceRoutes = require('./routes/ambulanceRoutes');

// Legacy Compatibility Routes
const systemRoutes = require('./routes/systemRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const aiRoutes = require('./routes/aiRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Initialize MongoDB connection (non-blocking fallback to in-memory store)
connectDB();

// Security & Core Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin === env.CORS_ORIGIN) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root / Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'CJack Emergency Telemetry & Resuscitation Platform API',
    version: '2.0.0-production',
    environment: env.NODE_ENV,
    simulationMode: env.SIMULATION_MODE,
    database: getDBStatus(),
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// REST API Groups (Standard Plural Endpoints)
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/cpr', cprRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/responders', responderRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/ai', aiRoutes);

// ==========================================
// Backward Compatibility Route Aliases
// (Ensures 100% compatibility with existing frontend)
// ==========================================
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/responder', responderRoutes);
app.use('/api/connectivity', communicationRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/voice', voiceRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const http = require('http');
const server = http.createServer(app);
const { initWebSocketServer } = require('./services/websocketServer');

// Initialize real-time WebSocket server
initWebSocketServer(server);

if (env.NODE_ENV !== 'test') {
  server.listen(env.PORT, () => {
    console.log(`====================================================`);
    console.log(`  CJack First-Aid Jacket Platform API Started`);
    console.log(`  Environment: ${env.NODE_ENV}`);
    console.log(`  Port: ${env.PORT}`);
    console.log(`  WebSocket URL: ws://localhost:${env.PORT}/ws/telemetry`);
    console.log(`  Simulation Mode: ${env.SIMULATION_MODE}`);
    console.log(`  Health Check: http://localhost:${env.PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = server;
