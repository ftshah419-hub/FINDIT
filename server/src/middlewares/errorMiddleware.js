import { ERROR_CODES } from '../constants/errorCodes.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;

  // Handle Mongoose Duplicate Key Error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'This email is already registered. Please log in using your existing email and password.';
    errorCode = ERROR_CODES.EMAIL_ALREADY_REGISTERED;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  }

  // Handle invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier: ${err.value}`;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  }

  // Don't leak stack traces in production
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[Unhandled Server Exception]:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(err.secondsLeft !== undefined && { secondsLeft: err.secondsLeft }),
    ...(err.remainingAttempts !== undefined && { remainingAttempts: err.remainingAttempts }),
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on path: ${req.originalUrl}`,
    errorCode: 'NOT_FOUND',
  });
};
