import { authService } from '../services/authService.js';
import { tokenService } from '../services/tokenService.js';

export const authController = {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;
      const result = await authService.register({ name, email, password, phone });

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          challengeId: result.challengeId,
          email: result.email,
          name: result.name,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/verify-otp
   */
  async verifyOTP(req, res, next) {
    try {
      const { challengeId, otp } = req.body;
      const result = await authService.verifyEmailOTP({ challengeId, otp });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          email: result.email,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/resend-otp
   */
  async resendOTP(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required to resend verification code.',
          errorCode: 'VALIDATION_ERROR',
        });
      }

      const result = await authService.resendVerificationOTP({ email });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          challengeId: result.challengeId,
          email: result.email,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          challengeId: result.challengeId,
          email: result.email,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/verify-login-otp
   */
  async verifyLoginOTP(req, res, next) {
    try {
      const { challengeId, otp } = req.body;
      const userAgent = req.headers['user-agent'] || 'Unknown Client';
      const ipAddress = req.ip || req.socket?.remoteAddress;

      const result = await authService.verifyLoginOTP({
        challengeId,
        otp,
        userAgent,
        ipAddress,
      });

      // Set HttpOnly, Secure refresh-token cookie
      res.cookie('refreshToken', result.rawRefreshToken, tokenService.getRefreshTokenCookieOptions());

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      const userAgent = req.headers['user-agent'] || 'Unknown Client';
      const ipAddress = req.ip || req.socket?.remoteAddress;

      const result = await authService.refreshToken({
        rawRefreshToken,
        userAgent,
        ipAddress,
      });

      // Rotate refresh-token cookie
      res.cookie('refreshToken', result.newRawRefreshToken, tokenService.getRefreshTokenCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Access token refreshed successfully.',
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (err) {
      // Clear cookie on invalid refresh
      res.clearCookie('refreshToken', tokenService.getClearCookieOptions());
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      await authService.logout({ rawRefreshToken });

      // Clear refresh-token cookie
      res.clearCookie('refreshToken', tokenService.getClearCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
        data: {},
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/logout-all
   */
  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll({ userId: req.user._id });

      res.clearCookie('refreshToken', tokenService.getClearCookieOptions());

      res.status(200).json({
        success: true,
        message: 'All device sessions terminated successfully.',
        data: {},
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user._id);

      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully.',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your registered email address.',
          errorCode: 'VALIDATION_ERROR',
        });
      }

      const result = await authService.forgotPassword({ email });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          challengeId: result.challengeId,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/verify-reset-otp
   */
  async verifyResetOTP(req, res, next) {
    try {
      const { challengeId, otp } = req.body;
      const result = await authService.verifyResetOTP({ challengeId, otp });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          userId: result.userId,
          resetGrant: result.resetGrant,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { userId, resetGrant, newPassword } = req.body;
      const result = await authService.resetPassword({ userId, resetGrant, newPassword });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {},
      });
    } catch (err) {
      next(err);
    }
  },
};
