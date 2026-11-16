import crypto from 'crypto';
import mongoose from 'mongoose';
import { AuthToken } from '../models/AuthToken.js';
import { TOKEN_PURPOSES } from '../constants/purposes.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { ENV } from '../config/env.js';

export const otpService = {
  /**
   * Generate a secure 6-digit numeric OTP
   */
  generateNumericOTP() {
    return crypto.randomInt(100000, 1000000).toString();
  },

  /**
   * Compute HMAC-SHA256 hash incorporating userId, purpose, challengeId, and the raw OTP
   */
  computeHMAC(rawOTP, userId, purpose, challengeId) {
    const data = `${userId.toString()}:${purpose}:${challengeId.toString()}:${rawOTP}`;
    return crypto.createHmac('sha256', ENV.OTP_SECRET).update(data).digest('hex');
  },

  /**
   * Create a new OTP challenge with rate limits and cooldown
   */
  async createChallenge({ userId, purpose }) {
    const now = new Date();

    // 1. Check hourly rate limit (max 5 OTP challenges per user/purpose per hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const hourlyCount = await AuthToken.countDocuments({
      userId,
      purpose,
      createdAt: { $gte: oneHourAgo },
    });

    if (hourlyCount >= 5) {
      const error = new Error('Maximum OTP requests reached. Please wait an hour before requesting another code.');
      error.statusCode = 429;
      error.errorCode = ERROR_CODES.OTP_SEND_LIMIT_REACHED;
      throw error;
    }

    // 2. Check active challenge for resend cooldown (60 seconds)
    const activeChallenge = await AuthToken.findOne({
      userId,
      purpose,
      consumedAt: null,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    if (activeChallenge && activeChallenge.resendAfter > now) {
      const secondsLeft = Math.ceil((activeChallenge.resendAfter.getTime() - now.getTime()) / 1000);
      const error = new Error(`Please wait ${secondsLeft} seconds before requesting a new code.`);
      error.statusCode = 429;
      error.errorCode = ERROR_CODES.OTP_COOLDOWN_ACTIVE;
      error.secondsLeft = secondsLeft;
      throw error;
    }

    // 3. Invalidate previous active unconsumed challenges for this user and purpose
    await AuthToken.updateMany(
      {
        userId,
        purpose,
        consumedAt: null,
      },
      {
        $set: { consumedAt: now },
      }
    );

    // 4. Generate new challenge ID and raw 6-digit OTP
    const challengeId = new mongoose.Types.ObjectId();
    const rawOTP = this.generateNumericOTP();
    const tokenHash = this.computeHMAC(rawOTP, userId, purpose, challengeId);

    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    const resendAfter = new Date(now.getTime() + 60 * 1000); // 60 seconds

    // 5. Save challenge to AuthTokens collection
    const challenge = await AuthToken.create({
      _id: challengeId,
      userId,
      tokenHash,
      purpose,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      resendAfter,
      consumedAt: null,
    });

    return {
      challengeId: challenge._id.toString(),
      rawOTP,
      expiresAt,
      resendAfter,
    };
  },

  /**
   * Verify and consume an OTP challenge atomically
   */
  async verifyChallenge({ challengeId, userId, purpose, rawOTP }) {
    const now = new Date();

    const query = {
      _id: challengeId,
      purpose,
      consumedAt: null,
    };
    if (userId) {
      query.userId = userId;
    }

    // Include +tokenHash because it is excluded by default in schema
    const challenge = await AuthToken.findOne(query).select('+tokenHash');

    if (!challenge) {
      const error = new Error('Invalid or already used verification challenge.');
      error.statusCode = 400;
      error.errorCode = ERROR_CODES.INVALID_OTP;
      throw error;
    }

    // Check expiration
    if (challenge.expiresAt <= now) {
      // Invalidate expired token
      challenge.consumedAt = now;
      await challenge.save();

      const error = new Error('This verification code has expired. Please request a new code.');
      error.statusCode = 400;
      error.errorCode = ERROR_CODES.EXPIRED_OTP;
      throw error;
    }

    // Check attempts
    if (challenge.attempts >= challenge.maxAttempts) {
      challenge.consumedAt = now;
      await challenge.save();

      const error = new Error('Maximum verification attempts exceeded. Please request a new code.');
      error.statusCode = 400;
      error.errorCode = ERROR_CODES.OTP_ATTEMPTS_EXCEEDED;
      throw error;
    }

    // Verify HMAC-SHA256
    const expectedHash = this.computeHMAC(rawOTP, challenge.userId, purpose, challenge._id);
    const candidateBuffer = Buffer.from(expectedHash, 'hex');
    const storedBuffer = Buffer.from(challenge.tokenHash, 'hex');

    const isMatch = candidateBuffer.length === storedBuffer.length && crypto.timingSafeEqual(candidateBuffer, storedBuffer);

    if (!isMatch) {
      // Atomically increment failed attempts
      const updated = await AuthToken.findByIdAndUpdate(
        challenge._id,
        { $inc: { attempts: 1 } },
        { new: true }
      );

      const remainingAttempts = Math.max(0, updated.maxAttempts - updated.attempts);

      if (remainingAttempts === 0) {
        await AuthToken.findByIdAndUpdate(challenge._id, { consumedAt: now });
        const error = new Error('Maximum verification attempts exceeded. Please request a new code.');
        error.statusCode = 400;
        error.errorCode = ERROR_CODES.OTP_ATTEMPTS_EXCEEDED;
        throw error;
      }

      const error = new Error(`Incorrect verification code. ${remainingAttempts} attempts remaining.`);
      error.statusCode = 400;
      error.errorCode = ERROR_CODES.INVALID_OTP;
      error.remainingAttempts = remainingAttempts;
      throw error;
    }

    // OTP matched! Mark challenge consumed atomically
    challenge.consumedAt = now;
    await challenge.save();

    return {
      success: true,
      userId: challenge.userId,
    };
  },

  /**
   * Create a single-use 5-minute password reset grant after successful OTP verification
   */
  async createResetGrant({ userId }) {
    const now = new Date();
    const rawGrant = crypto.randomBytes(32).toString('hex');
    const grantHash = crypto.createHash('sha256').update(rawGrant).digest('hex');
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    // Invalidate any previous reset grants for this user
    await AuthToken.updateMany(
      {
        userId,
        purpose: TOKEN_PURPOSES.PASSWORD_RESET_GRANT,
        consumedAt: null,
      },
      {
        $set: { consumedAt: now },
      }
    );

    await AuthToken.create({
      userId,
      tokenHash: grantHash,
      purpose: TOKEN_PURPOSES.PASSWORD_RESET_GRANT,
      expiresAt,
      resendAfter: now,
      consumedAt: null,
    });

    return {
      resetGrant: rawGrant,
      expiresAt,
    };
  },

  /**
   * Verify and consume single-use reset grant
   */
  async verifyAndConsumeResetGrant({ userId, rawGrant }) {
    const now = new Date();
    const grantHash = crypto.createHash('sha256').update(rawGrant).digest('hex');

    const grant = await AuthToken.findOne({
      userId,
      purpose: TOKEN_PURPOSES.PASSWORD_RESET_GRANT,
      tokenHash: grantHash,
      consumedAt: null,
    }).select('+tokenHash');

    if (!grant) {
      const error = new Error('Invalid or expired password reset session. Please restart password reset.');
      error.statusCode = 400;
      error.errorCode = ERROR_CODES.INVALID_RESET_GRANT;
      throw error;
    }

    if (grant.expiresAt <= now) {
      grant.consumedAt = now;
      await grant.save();

      const error = new Error('Password reset session has expired (5-minute limit). Please request a new code.');
      error.statusCode = 400;
      error.errorCode = ERROR_CODES.EXPIRED_RESET_GRANT;
      throw error;
    }

    grant.consumedAt = now;
    await grant.save();

    return true;
  },
};
