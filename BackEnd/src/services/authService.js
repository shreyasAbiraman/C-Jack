const { User } = require('../models');
const { isConnected } = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { inMemoryUsers } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.demoUsers = [
      {
        id: 'usr-admin-01',
        name: 'System Administrator',
        email: 'admin@cjack.health',
        passwordHash: bcrypt.hashSync('Admin@1234', 10),
        role: 'admin',
        isActive: true,
      },
      {
        id: 'usr-medic-01',
        name: 'Dr. Marcus Vance (ALS Lead)',
        email: 'medic@cjack.health',
        passwordHash: bcrypt.hashSync('Medic@1234', 10),
        role: 'responder',
        isActive: true,
      },
      {
        id: 'usr-user-01',
        name: 'John Doe (Patient)',
        email: 'user@cjack.health',
        passwordHash: bcrypt.hashSync('User@1234', 10),
        role: 'user',
        isActive: true,
      },
    ];

    // Seed into inMemoryUsers map
    this.demoUsers.forEach((u) => {
      inMemoryUsers.set(u.id, {
        _id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
      });
    });
  }

  async register({ name, email, password, role = 'user' }) {
    if (isConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        throw new Error('User with this email already exists');
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
      });

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } else {
      // In-memory fallback
      const exists = this.demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('User with this email already exists');
      }

      const id = `usr-${Date.now().toString(36)}`;
      const newUser = {
        id,
        name,
        email: email.toLowerCase(),
        passwordHash: bcrypt.hashSync(password, 10),
        role,
        isActive: true,
      };

      this.demoUsers.push(newUser);
      inMemoryUsers.set(id, {
        _id: id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: true,
      });

      const token = generateToken({ id, email: newUser.email, role: newUser.role });

      return {
        user: {
          id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      };
    }
  }

  async login({ email, password }) {
    if (isConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('Your account is deactivated. Contact admin.');
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } else {
      // In-memory fallback authentication
      const user = this.demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      };
    }
  }

  async getProfile(userId) {
    if (isConnected()) {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } else {
      const user = inMemoryUsers.get(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }
  }
}

module.exports = new AuthService();
