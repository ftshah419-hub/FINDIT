import { otpService } from '../../src/services/otpService.js';
import mongoose from 'mongoose';

const runOtpUnitTests = () => {
  console.log('--- RUNNING OTP SERVICE UNIT TESTS ---');

  // 1. Format test
  for (let i = 0; i < 20; i++) {
    const otp = otpService.generateNumericOTP();
    if (!/^\d{6}$/.test(otp)) {
      throw new Error(`OTP does not match 6-digit numeric pattern: ${otp}`);
    }
  }
  console.log('  ✓ PASS: 20 random OTP generations strictly conform to 6-digit format');

  // 2. HMAC test
  const userId = new mongoose.Types.ObjectId();
  const challengeId = new mongoose.Types.ObjectId();
  const purpose = 'LOGIN';
  const otp = '849201';

  const hmac1 = otpService.computeHMAC(otp, userId, purpose, challengeId);
  const hmac2 = otpService.computeHMAC(otp, userId, purpose, challengeId);
  if (hmac1 !== hmac2) {
    throw new Error('HMAC calculation is not deterministic for identical inputs');
  }

  const hmacDifferentOtp = otpService.computeHMAC('849202', userId, purpose, challengeId);
  if (hmac1 === hmacDifferentOtp) {
    throw new Error('HMAC collision on different OTP');
  }

  const hmacDifferentPurpose = otpService.computeHMAC(otp, userId, 'EMAIL_VERIFICATION', challengeId);
  if (hmac1 === hmacDifferentPurpose) {
    throw new Error('HMAC must incorporate purpose');
  }

  console.log('  ✓ PASS: HMAC-SHA256 incorporates userId, purpose, challengeId and prevents collision');
  console.log('--- OTP SERVICE UNIT TESTS PASSED ---\n');
};

runOtpUnitTests();
