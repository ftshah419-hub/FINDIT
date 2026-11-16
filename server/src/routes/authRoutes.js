import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateOTP,
  validateResetPassword,
} from '../validators/authValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Registration
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/verify-otp', validateOTP, authController.verifyOTP);
router.post('/resend-otp', authLimiter, authController.resendOTP);

// Login (Password + OTP)
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/verify-login-otp', validateOTP, authController.verifyLoginOTP);

// Refresh & Logout
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);

// Current User Profile
router.get('/me', authenticate, authController.getMe);

// Password Reset
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/verify-reset-otp', validateOTP, authController.verifyResetOTP);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

export default router;
