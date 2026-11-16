import { Session } from '../models/Session.js';
import { tokenService } from './tokenService.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const sessionService = {
  /**
   * Create a new session with hashed refresh token
   */
  async createSession({ userId, rawRefreshToken, userAgent, ipAddress }) {
    const refreshTokenHash = tokenService.hashRefreshToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await Session.create({
      userId,
      refreshTokenHash,
      userAgent: userAgent || 'Unknown Client',
      ipAddress: ipAddress || null,
      expiresAt,
      revokedAt: null,
    });

    return session;
  },

  /**
   * Validate and rotate refresh token with reuse detection
   */
  async rotateSession({ rawRefreshToken, userAgent, ipAddress }) {
    if (!rawRefreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 401;
      error.errorCode = ERROR_CODES.UNAUTHORIZED;
      throw error;
    }

    const refreshTokenHash = tokenService.hashRefreshToken(rawRefreshToken);
    const now = new Date();

    // Query session including the hashed token
    const session = await Session.findOne({ refreshTokenHash }).select('+refreshTokenHash');

    // Token Reuse Detection
    if (!session) {
      const error = new Error('Invalid refresh token.');
      error.statusCode = 401;
      error.errorCode = ERROR_CODES.INVALID_REFRESH_TOKEN;
      throw error;
    }

    if (session.revokedAt) {
      // Security: Attempted reuse of an already-revoked session!
      // Revoke all sessions belonging to this compromised user account
      console.warn(`[Security Alert] Refresh token reuse detected for user ${session.userId}. Revoking all sessions.`);
      await this.revokeAllUserSessions(session.userId);

      const error = new Error('Compromised or revoked session detected. All sessions terminated for security. Please log in again.');
      error.statusCode = 401;
      error.errorCode = ERROR_CODES.SESSION_REVOKED;
      throw error;
    }

    // Check expiration
    if (session.expiresAt <= now) {
      session.revokedAt = now;
      await session.save();

      const error = new Error('Session has expired. Please log in again.');
      error.statusCode = 401;
      error.errorCode = ERROR_CODES.SESSION_REVOKED;
      throw error;
    }

    // Rotate token: generate a new refresh token and update the existing session
    const newRawRefreshToken = tokenService.generateRefreshToken();
    const newRefreshTokenHash = tokenService.hashRefreshToken(newRawRefreshToken);

    session.refreshTokenHash = newRefreshTokenHash;
    session.userAgent = userAgent || session.userAgent;
    session.ipAddress = ipAddress || session.ipAddress;
    session.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // extend 7 days
    await session.save();

    return {
      session,
      newRawRefreshToken,
      userId: session.userId,
    };
  },

  /**
   * Revoke single session by refresh token (Logout)
   */
  async revokeSession(rawRefreshToken) {
    if (!rawRefreshToken) return;

    const refreshTokenHash = tokenService.hashRefreshToken(rawRefreshToken);
    await Session.findOneAndUpdate(
      { refreshTokenHash, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  },

  /**
   * Revoke all active sessions belonging to a user (Logout All / Password Reset)
   */
  async revokeAllUserSessions(userId) {
    await Session.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  },
};
