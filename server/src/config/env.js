import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/findit',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'findit_default_access_secret_key_change_in_production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'findit_default_refresh_secret_key_change_in_production',
  OTP_SECRET: process.env.OTP_SECRET || 'findit_default_otp_secret_key_change_in_production',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'FINDIT Security <onboarding@resend.dev>',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
};

// Validate critical secrets in production
export const validateEnv = () => {
  const missing = [];
  if (ENV.NODE_ENV === 'production') {
    if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
    if (!process.env.JWT_ACCESS_SECRET) missing.push('JWT_ACCESS_SECRET');
    if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');
    if (!process.env.OTP_SECRET) missing.push('OTP_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(`CRITICAL: Missing required environment variables in production: ${missing.join(', ')}`);
  }
};
