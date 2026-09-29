const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return ApiResponse.badRequest(res, 'Name, email, and password are required');
      }

      if (password.length < 6) {
        return ApiResponse.badRequest(res, 'Password must be at least 6 characters');
      }

      const result = await authService.register({ name, email, password, role });
      return ApiResponse.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return ApiResponse.badRequest(res, 'Email and password are required');
      }

      const result = await authService.login({ email, password });
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Not authenticated');
      }
      return ApiResponse.success(res, req.user, 'Current user profile');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
