import { tokenService } from '../../src/services/tokenService.js';
import mongoose from 'mongoose';

const runTokenUnitTests = () => {
  console.log('--- RUNNING TOKEN SERVICE UNIT TESTS ---');

  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Alex Chen',
    email: 'alex.chen@organization.org',
    role: 'USER',
  };

  // 1. Generate Access Token
  const token = tokenService.generateAccessToken(mockUser);
  console.log('Generated JWT:', token ? 'Token string present' : 'FAIL');
  if (!token) throw new Error('Failed to generate JWT');

  // 2. Verify Access Token
  const decoded = tokenService.verifyAccessToken(token);
  if (!decoded || decoded.sub !== mockUser._id.toString() || decoded.email !== mockUser.email) {
    throw new Error('Decoded JWT payload does not match expected user');
  }
  console.log('  ✓ PASS: Access JWT signed and verified with correct payload');

  // 3. Refresh Token Generation & Hashing
  const rawRefreshToken = tokenService.generateRefreshToken();
  if (!rawRefreshToken || rawRefreshToken.length !== 80) { // 40 bytes hex = 80 characters
    throw new Error('Refresh token length mismatch');
  }
  const hash = tokenService.hashRefreshToken(rawRefreshToken);
  if (!hash || hash.length !== 64) { // SHA256 hex = 64 characters
    throw new Error('SHA-256 hash length mismatch');
  }
  console.log('  ✓ PASS: Refresh token generated (40 bytes) and SHA-256 hashed (64 chars)');

  // 4. Cookie Configuration
  const cookieOptions = tokenService.getRefreshTokenCookieOptions();
  if (
    cookieOptions.httpOnly !== true ||
    cookieOptions.sameSite !== 'lax' ||
    cookieOptions.path !== '/api/v1/auth' ||
    cookieOptions.maxAge !== 7 * 24 * 60 * 60 * 1000
  ) {
    throw new Error('Cookie options do not match security policy');
  }
  console.log('  ✓ PASS: Refresh token cookie options strictly meet HttpOnly/SameSite/Path standards');

  console.log('--- TOKEN SERVICE UNIT TESTS PASSED ---\n');
};

runTokenUnitTests();
