import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

export const tokenService = {
  /**
   * Generate short-lived Access JWT (15 minutes)
   */
  generateAccessToken(user) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
      algorithm: 'HS256',
    });
  },

  /**
   * Generate cryptographically random Refresh Token (7 days)
   */
  generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  },

  /**
   * Hash refresh token using SHA-256 for persistent database storage
   */
  hashRefreshToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  },

  /**
   * Verify Access JWT signature and expiration
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, ENV.JWT_ACCESS_SECRET, {
        algorithms: ['HS256'],
      });
    } catch (err) {
      return null;
    }
  },

  /**
   * Cookie configuration for HttpOnly refresh token
   */
  getRefreshTokenCookieOptions() {
    return {
      httpOnly: true,
      secure: ENV.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      domain: ENV.COOKIE_DOMAIN || undefined,
    };
  },

  /**
   * Clear cookie options
   */
  getClearCookieOptions() {
    return {
      httpOnly: true,
      secure: ENV.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/api/v1/auth',
      domain: ENV.COOKIE_DOMAIN || undefined,
    };
  },
};
