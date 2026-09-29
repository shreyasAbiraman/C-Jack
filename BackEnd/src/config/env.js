require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cjack_db',
  JWT_SECRET: process.env.JWT_SECRET || 'cjack_super_secure_jwt_dev_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SIMULATION_MODE: process.env.SIMULATION_MODE !== 'false', // Defaults to true
  HARDWARE_API_KEY: process.env.HARDWARE_API_KEY || 'cjack_dev_hw_key_2026',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || process.env.TELEPHONY_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || process.env.TELEPHONY_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || process.env.TELEPHONY_FROM_NUMBER,
  EMERGENCY_PHONE_NUMBER: process.env.EMERGENCY_PHONE_NUMBER || '+919876543210',
};

module.exports = env;
