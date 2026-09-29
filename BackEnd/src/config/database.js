const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000, // Timeout fast if local Mongo is not running
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[Database] MongoDB runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[Database] MongoDB disconnected. Running with in-memory fallback state.');
    });

    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] MongoDB connection note: ${error.message}`);
    console.warn('[Database] Running in In-Memory / Simulation Store mode. Persistent DB is disabled.');
    return null;
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  databaseUri: env.MONGODB_URI ? env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@') : null,
  driver: 'mongoose',
  readyState: mongoose.connection.readyState
});

module.exports = {
  connectDB,
  getDBStatus,
  isConnected: () => isConnected,
};
