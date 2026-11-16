import { ERROR_CODES } from '../constants/errorCodes.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const OTP_REGEX = /^\d{6}$/;

export const validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword, phone } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required and must be at least 2 characters long.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  // Password complexity check
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  // Sanitize: client cannot supply role
  delete req.body.role;

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password is required.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  next();
};

export const validateOTP = (req, res, next) => {
  const { otp, challengeId } = req.body;

  if (!challengeId || typeof challengeId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Challenge ID is required.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (!otp || !OTP_REGEX.test(otp.toString().trim())) {
    return res.status(400).json({
      success: false,
      message: 'Verification code must be a 6-digit number.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  next();
};

export const validateResetPassword = (req, res, next) => {
  const { userId, resetGrant, newPassword, confirmPassword } = req.body;

  if (!userId || !resetGrant) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password reset parameters. Please restart password reset.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return res.status(400).json({
      success: false,
      message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match.',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
    });
  }

  next();
};
