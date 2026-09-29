/**
 * Standardized API Response Helper for CJack Backend
 * Consistent structure across all endpoints:
 * Success: { success: true, data: {}, message: "" }
 * Error:   { success: false, message: "", errors: [] }
 */

class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, meta = undefined) {
    const payload = {
      success: true,
      message,
      data,
    };
    if (meta !== undefined) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = undefined) {
    const payload = {
      success: false,
      message,
    };
    if (errors !== undefined) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }

  static badRequest(res, message = 'Bad request', errors = undefined) {
    return ApiResponse.error(res, message, 400, errors);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return ApiResponse.error(res, message, 401);
  }

  static forbidden(res, message = 'Forbidden access') {
    return ApiResponse.error(res, message, 403);
  }

  static notFound(res, message = 'Resource not found') {
    return ApiResponse.error(res, message, 404);
  }
}

module.exports = ApiResponse;
