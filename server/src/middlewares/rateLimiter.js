import rateLimit from 'express-rate-limit';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
    errorCode: ERROR_CODES.TOO_MANY_REQUESTS,
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'API rate limit exceeded. Please slow down your requests.',
    errorCode: ERROR_CODES.TOO_MANY_REQUESTS,
  },
});
