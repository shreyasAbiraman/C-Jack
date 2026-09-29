/**
 * Centralized Production Error Handler Middleware
 * Guarantees standard error format:
 * {
 *   success: false,
 *   message: "...",
 *   errors: [...]
 * }
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  if (statusCode < 400) statusCode = 500;

  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation error';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate field value entered: ${field}. Must be unique.`;
    errors = [{ field, message: `${field} already exists` }];
  }

  // Handle Mongoose CastError (invalid ObjectId or type)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier: ${err.value}`;
    errors = [{ field: err.path, message: `Cast to ${err.kind} failed` }];
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Authorization denied.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please authenticate again.';
  }

  // Handle JSON parse error in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload received in request body.';
  }

  const response = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
