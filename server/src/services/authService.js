import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { otpService } from './otpService.js';
import { emailService } from './emailService.js';
import { tokenService } from './tokenService.js';
import { sessionService } from './sessionService.js';
import { ROLES } from '../constants/roles.js';
import { TOKEN_PURPOSES } from '../constants/purposes.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const authService = {
  /**
   * Register a new user account
   */
  async register({ name, email, password, phone }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check for existing account
    const existingUser = await User.findOne({ email: normalizedEmail }).select('+password');

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        // Critical requirement: Already registered & verified account must not be duplicated or overwritten
        const error = new Error('This email is already registered. Please log in using your existing email and password.');
        error.statusCode = 409;
        error.errorCode = ERROR_CODES.EMAIL_ALREADY_REGISTERED;
        throw error;
      }

      // Existing unverified account: update user details and allow completing original registration
      const hashedPassword = await bcrypt.hash(password, 12);
      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      if (phone) existingUser.phone = phone.trim();
      await existingUser.save();

      // Issue fresh verification OTP
      const challenge = await otpService.createChallenge({
        userId: existingUser._id,
        purpose: TOKEN_PURPOSES.EMAIL_VERIFICATION,
      });

      await emailService.sendVerificationOTP({
        to: existingUser.email,
        name: existingUser.name,
        otp: challenge.rawOTP,
      });

      return {
        challengeId: challenge.challengeId,
        email: existingUser.email,
        name: existingUser.name,
        message: 'A verification code has been sent to your email address.',
      };
    }

    // 2. Hash password with bcrypt (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create new user with forced USER role (public registration never assigns ADMIN)
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      role: ROLES.USER,
      isEmailVerified: false,
      isActive: true,
    });

    // 4. Create and dispatch 6-digit email verification OTP
    const challenge = await otpService.createChallenge({
      userId: newUser._id,
      purpose: TOKEN_PURPOSES.EMAIL_VERIFICATION,
    });

    await emailService.sendVerificationOTP({
      to: newUser.email,
      name: newUser.name,
      otp: challenge.rawOTP,
    });

    return {
      challengeId: challenge.challengeId,
      email: newUser.email,
      name: newUser.name,
      message: 'Account registered. Please enter the verification code sent to your email.',
    };
  },

  /**
   * Verify registration email OTP
   */
  async verifyEmailOTP({ challengeId, otp }) {
    // 1. Verify and consume OTP challenge atomically
    const { userId } = await otpService.verifyChallenge({
      challengeId,
      purpose: TOKEN_PURPOSES.EMAIL_VERIFICATION,
      rawOTP: otp,
    });

    // 2. Mark user's email as verified
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      error.errorCode = ERROR_CODES.ACCOUNT_NOT_FOUND;
      throw error;
    }

    user.isEmailVerified = true;
    await user.save();

    return {
      success: true,
      email: user.email,
      message: 'Email verified successfully. You can now log in using your email and password.',
    };
  },

  /**
   * Resend verification OTP for unverified accounts
   */
  async resendVerificationOTP({ email }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const error = new Error('No account found with this email.');
      error.statusCode = 404;
      error.errorCode = ERROR_CODES.ACCOUNT_NOT_FOUND;
      throw error;
    }

    if (user.isEmailVerified) {
      const error = new Error('This email is already verified. Please proceed to login.');
      error.statusCode = 400;
      error.errorCode = ERROR_CODES.EMAIL_ALREADY_REGISTERED;
      throw error;
    }

    // Creates challenge with rate-limiting and cooldown enforcement
    const challenge = await otpService.createChallenge({
      userId: user._id,
      purpose: TOKEN_PURPOSES.EMAIL_VERIFICATION,
    });

    await emailService.sendVerificationOTP({
      to: user.email,
      name: user.name,
      otp: challenge.rawOTP,
    });

    return {
      challengeId: challenge.challengeId,
      email: user.email,
      message: 'A fresh verification code has been sent to your email.',
    };
  },

  /**
   * Login Step 1: Verify email + password, dispatch login OTP
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user with password hash
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.errorCode = ERROR_CODES.INVALID_CREDENTIALS;
      throw error;
    }

    // 2. Check if account is locked
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      const error = new Error(`Account temporarily locked due to multiple failed login attempts. Please try again in ${minutesLeft} minutes.`);
      error.statusCode = 403;
      error.errorCode = ERROR_CODES.ACCOUNT_LOCKED;
      throw error;
    }

    // 3. Check if account is active
    if (!user.isActive) {
      const error = new Error('Your account is inactive. Please contact support.');
      error.statusCode = 403;
      error.errorCode = ERROR_CODES.ACCOUNT_INACTIVE;
      throw error;
    }

    // 4. Check if email is verified
    if (!user.isEmailVerified) {
      const error = new Error('Email verification is required before logging in. Please verify your email.');
      error.statusCode = 403;
      error.errorCode = ERROR_CODES.EMAIL_NOT_VERIFIED;
      error.email = user.email;
      throw error;
    }

    // 5. Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.recordFailedAttempt();
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.errorCode = ERROR_CODES.INVALID_CREDENTIALS;
      throw error;
    }

    // 6. Reset failed attempts on valid password
    await user.resetFailedAttempts();

    // 7. Generate login OTP challenge
    const challenge = await otpService.createChallenge({
      userId: user._id,
      purpose: TOKEN_PURPOSES.LOGIN,
    });

    // 8. Send Login OTP email
    await emailService.sendLoginOTP({
      to: user.email,
      name: user.name,
      otp: challenge.rawOTP,
    });

    return {
      challengeId: challenge.challengeId,
      email: user.email,
      message: 'Login credentials verified. Please enter the security code sent to your email.',
    };
  },

  /**
   * Login Step 2: Verify login OTP, create Session, issue Access JWT and Refresh Token
   */
  async verifyLoginOTP({ challengeId, otp, userAgent, ipAddress }) {
    // 1. Verify and consume OTP challenge
    const { userId } = await otpService.verifyChallenge({
      challengeId,
      purpose: TOKEN_PURPOSES.LOGIN,
      rawOTP: otp,
    });

    // 2. Fetch fresh user
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      const error = new Error('User account not found or inactive.');
      error.statusCode = 403;
      error.errorCode = ERROR_CODES.ACCOUNT_INACTIVE;
      throw error;
    }

    // 3. Issue Access JWT (15m) & Refresh Token (7d)
    const accessToken = tokenService.generateAccessToken(user);
    const rawRefreshToken = tokenService.generateRefreshToken();

    // 4. Create new Session in MongoDB Atlas
    await sessionService.createSession({
      userId: user._id,
      rawRefreshToken,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      rawRefreshToken,
      user: user.toJSON(),
      message: 'Login successful.',
    };
  },

  /**
   * Refresh Access Token using HttpOnly Refresh Cookie
   */
  async refreshToken({ rawRefreshToken, userAgent, ipAddress }) {
    // 1. Rotate session with reuse detection
    const { newRawRefreshToken, userId } = await sessionService.rotateSession({
      rawRefreshToken,
      userAgent,
      ipAddress,
    });

    // 2. Fetch fresh user to enforce current database role and status
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      const error = new Error('Account inactive or not found.');
      error.statusCode = 403;
      error.errorCode = ERROR_CODES.ACCOUNT_INACTIVE;
      throw error;
    }

    // 3. Issue new Access JWT
    const accessToken = tokenService.generateAccessToken(user);

    return {
      accessToken,
      newRawRefreshToken,
      user: user.toJSON(),
    };
  },

  /**
   * Logout current session
   */
  async logout({ rawRefreshToken }) {
    await sessionService.revokeSession(rawRefreshToken);
    return { success: true, message: 'Logged out successfully.' };
  },

  /**
   * Logout all sessions for user
   */
  async logoutAll({ userId }) {
    await sessionService.revokeAllUserSessions(userId);
    return { success: true, message: 'All active sessions have been terminated.' };
  },

  /**
   * Retrieve current authenticated user profile
   */
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      error.errorCode = ERROR_CODES.ACCOUNT_NOT_FOUND;
      throw error;
    }
    return user.toJSON();
  },

  /**
   * Request password reset OTP
   */
  async forgotPassword({ email }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Anti-enumeration: always return generic success message
    const genericResponse = {
      message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
    };

    if (!user || !user.isActive) {
      return genericResponse;
    }

    // Create PASSWORD_RESET OTP challenge
    const challenge = await otpService.createChallenge({
      userId: user._id,
      purpose: TOKEN_PURPOSES.PASSWORD_RESET,
    });

    await emailService.sendPasswordResetOTP({
      to: user.email,
      name: user.name,
      otp: challenge.rawOTP,
    });

    return {
      challengeId: challenge.challengeId,
      message: genericResponse.message,
    };
  },

  /**
   * Verify password reset OTP and return a 5-minute single-use reset grant
   */
  async verifyResetOTP({ challengeId, otp }) {
    const { userId } = await otpService.verifyChallenge({
      challengeId,
      purpose: TOKEN_PURPOSES.PASSWORD_RESET,
      rawOTP: otp,
    });

    // Create 5-minute single-use reset grant
    const { resetGrant } = await otpService.createResetGrant({ userId });

    return {
      userId: userId.toString(),
      resetGrant,
      message: 'Verification code confirmed. You may now set your new password.',
    };
  },

  /**
   * Set new password using reset grant
   */
  async resetPassword({ userId, resetGrant, newPassword }) {
    // 1. Verify and consume reset grant
    await otpService.verifyAndConsumeResetGrant({ userId, rawGrant: resetGrant });

    // 2. Fetch existing user
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      error.errorCode = ERROR_CODES.ACCOUNT_NOT_FOUND;
      throw error;
    }

    // 3. Hash new password (12 rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 4. Update existing user document (never recreate or delete account)
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // 5. Revoke all active sessions on all devices for this user
    await sessionService.revokeAllUserSessions(user._id);

    return {
      success: true,
      message: 'Password has been reset successfully. Please log in using your new password.',
    };
  },
};
