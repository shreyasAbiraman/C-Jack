const ApiResponse = require('../utils/apiResponse');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required before checking permissions.');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required: [${roles.join(', ')}]`
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};
