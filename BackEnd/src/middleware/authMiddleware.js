const { verifyToken } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');
const { User } = require('../models');
const { isConnected } = require('../config/database');

// In-memory fallback demo users cache
const inMemoryUsers = new Map([
  [
    'demo-admin-id',
    {
      _id: 'demo-admin-id',
      name: 'System Admin',
      email: 'admin@cjack.health',
      role: 'admin',
      isActive: true,
    },
  ],
  [
    'demo-medic-id',
    {
      _id: 'demo-medic-id',
      name: 'Dr. Marcus Vance',
      email: 'marcus@cjack.health',
      role: 'responder',
      isActive: true,
    },
  ],
]);

const authenticate = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return ApiResponse.unauthorized(res, 'Authentication required. No Bearer token provided.');
  }

  try {
    const decoded = verifyToken(token);

    let user = null;
    const mongoose = require('mongoose');

    if (isConnected() && mongoose.isValidObjectId(decoded.id)) {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      // In-memory fallback authentication
      user = inMemoryUsers.get(decoded.id) || {
        _id: decoded.id,
        name: decoded.name || 'Demo User',
        email: decoded.email || 'demo@cjack.health',
        role: decoded.role || 'user',
        isActive: true,
      };
    }

    if (!user.isActive) {
      return ApiResponse.forbidden(res, 'User account is deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, `Invalid or expired token: ${error.message}`);
  }
};

// Optional auth: attaches req.user if valid token present, but doesn't block if missing
const optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    if (isConnected()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      req.user = inMemoryUsers.get(decoded.id) || {
        _id: decoded.id,
        role: decoded.role || 'user',
      };
    }
  } catch (e) {
    // Silently continue without user
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  inMemoryUsers,
};
