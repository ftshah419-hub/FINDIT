const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for one or more fields.',
      errorCode: 'VALIDATION_ERROR',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('[Server Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An internal server error occurred.';
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  validate,
  errorHandler,
};
