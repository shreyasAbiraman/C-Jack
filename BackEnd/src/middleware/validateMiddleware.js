const ApiResponse = require('../utils/apiResponse');

/**
 * Validate request payload using a validator function or schema rules
 * @param {Function} validator - (body, req) => { isValid: boolean, errors: Object }
 */
const validate = (validator) => {
  return (req, res, next) => {
    const result = validator(req.body, req);
    if (!result.isValid) {
      return ApiResponse.badRequest(res, result.message || 'Validation failed', result.errors);
    }
    next();
  };
};

module.exports = {
  validate,
};
