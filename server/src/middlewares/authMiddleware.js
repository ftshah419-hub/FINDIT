import { tokenService } from '../services/tokenService.js';
import { User } from '../models/User.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Authenticate incoming requests using Bearer Access JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided.',
        errorCode: ERROR_CODES.UNAUTHORIZED,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyAccessToken(token);

    if (!decoded || !decoded.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token.',
        errorCode: ERROR_CODES.UNAUTHORIZED,
      });
    }

    // Always fetch fresh user from database to enforce current role and status in real-time
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account associated with this token no longer exists.',
        errorCode: ERROR_CODES.ACCOUNT_NOT_FOUND,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact support.',
        errorCode: ERROR_CODES.ACCOUNT_INACTIVE,
      });
    }

    // Check if password was changed after this access token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat && decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          message: 'Password was recently changed. Please log in again.',
          errorCode: ERROR_CODES.UNAUTHORIZED,
        });
      }
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role-Based Access Control Middleware
 * Example: authorize('ADMIN')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
        errorCode: ERROR_CODES.UNAUTHORIZED,
      });
    }

    // Strict role check against fresh MongoDB user document
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: this action requires one of the following roles: [${allowedRoles.join(', ')}].`,
        errorCode: ERROR_CODES.FORBIDDEN,
      });
    }

    next();
  };
};
