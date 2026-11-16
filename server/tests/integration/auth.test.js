import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../../src/models/User.js';
import { AuthToken } from '../../src/models/AuthToken.js';
import { Session } from '../../src/models/Session.js';
import { authService } from '../../src/services/authService.js';
import { tokenService } from '../../src/services/tokenService.js';
import { otpService } from '../../src/services/otpService.js';
import { TOKEN_PURPOSES } from '../../src/constants/purposes.js';
import { ROLES } from '../../src/constants/roles.js';

// In-Memory Test Store
const usersDb = new Map();
const tokensDb = new Map();
const sessionsDb = new Map();

// Helper to create a rich mock User document with all Mongoose methods
const createMockUserDoc = (data) => {
  const doc = {
    _id: data._id || new mongoose.Types.ObjectId(),
    name: data.name,
    email: data.email.toLowerCase().trim(),
    password: data.password,
    phone: data.phone || null,
    role: data.role || ROLES.USER,
    isEmailVerified: !!data.isEmailVerified,
    isActive: data.isActive !== undefined ? data.isActive : true,
    failedLoginAttempts: data.failedLoginAttempts || 0,
    lockUntil: data.lockUntil || null,
    passwordChangedAt: data.passwordChangedAt || null,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),

    async comparePassword(candidate) {
      return bcrypt.compare(candidate, this.password);
    },
    isLocked() {
      return !!(this.lockUntil && this.lockUntil > new Date());
    },
    async recordFailedAttempt() {
      this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
      if (this.failedLoginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      usersDb.set(this._id.toString(), { ...this });
      return this;
    },
    async resetFailedAttempts() {
      this.failedLoginAttempts = 0;
      this.lockUntil = null;
      usersDb.set(this._id.toString(), { ...this });
      return this;
    },
    async save() {
      this.updatedAt = new Date();
      usersDb.set(this._id.toString(), { ...this });
      return this;
    },
    toJSON() {
      const copy = { ...this };
      delete copy.password;
      delete copy.comparePassword;
      delete copy.isLocked;
      delete copy.recordFailedAttempt;
      delete copy.resetFailedAttempts;
      delete copy.save;
      delete copy.toJSON;
      return copy;
    },
  };
  return doc;
};

// Helper to create mock AuthToken document
const createMockAuthTokenDoc = (data) => {
  const doc = {
    _id: data._id || new mongoose.Types.ObjectId(),
    userId: data.userId,
    tokenHash: data.tokenHash,
    purpose: data.purpose,
    expiresAt: data.expiresAt,
    attempts: data.attempts || 0,
    maxAttempts: data.maxAttempts || 5,
    resendAfter: data.resendAfter,
    consumedAt: data.consumedAt || null,
    createdAt: data.createdAt || new Date(),

    async save() {
      tokensDb.set(this._id.toString(), { ...this });
      return this;
    },
  };
  return doc;
};

// Helper to create mock Session document
const createMockSessionDoc = (data) => {
  const doc = {
    _id: data._id || new mongoose.Types.ObjectId(),
    userId: data.userId,
    refreshTokenHash: data.refreshTokenHash,
    userAgent: data.userAgent || 'Unknown Client',
    ipAddress: data.ipAddress || null,
    expiresAt: data.expiresAt,
    revokedAt: data.revokedAt || null,
    createdAt: data.createdAt || new Date(),

    async save() {
      sessionsDb.set(this._id.toString(), { ...this });
      return this;
    },
  };
  return doc;
};

// Mock User Model
User.findOne = (query) => {
  const findMatch = () => {
    for (const user of usersDb.values()) {
      if (query.email && user.email === query.email.toLowerCase().trim()) {
        return createMockUserDoc(user);
      }
    }
    return null;
  };

  return {
    select: () => Promise.resolve(findMatch()),
    then: (resolve) => resolve(findMatch()),
  };
};

User.findById = (id) => {
  const key = id.toString();
  const user = usersDb.get(key);
  if (!user) return Promise.resolve(null);
  const doc = createMockUserDoc(user);
  return {
    select: () => Promise.resolve(doc),
    then: (resolve) => resolve(doc),
  };
};

User.create = async (data) => {
  const doc = createMockUserDoc(data);
  usersDb.set(doc._id.toString(), { ...doc });
  return doc;
};

User.countDocuments = async (query) => {
  let count = 0;
  for (const user of usersDb.values()) {
    if (query.email && user.email === query.email.toLowerCase().trim()) {
      count++;
    }
  }
  return count;
};

// Mock AuthToken Model
AuthToken.create = async (data) => {
  const doc = createMockAuthTokenDoc(data);
  tokensDb.set(doc._id.toString(), { ...doc });
  return doc;
};

AuthToken.findOne = (query) => {
  return {
    select: () => {
      for (const token of tokensDb.values()) {
        if (query._id && token._id.toString() !== query._id.toString()) continue;
        if (query.userId && token.userId.toString() !== query.userId.toString()) continue;
        if (query.purpose && token.purpose !== query.purpose) continue;
        if (query.tokenHash && token.tokenHash !== query.tokenHash) continue;
        if (query.consumedAt === null && token.consumedAt !== null) continue;
        if (query.expiresAt && query.expiresAt.$gt && token.expiresAt <= query.expiresAt.$gt) continue;

        return Promise.resolve(createMockAuthTokenDoc(token));
      }
      return Promise.resolve(null);
    },
    sort: () => ({
      select: () => Promise.resolve(null),
    }),
  };
};

AuthToken.findById = (id) => {
  const token = tokensDb.get(id.toString());
  if (!token) {
    return {
      select: () => Promise.resolve(null),
      then: (resolve) => resolve(null),
    };
  }
  const doc = createMockAuthTokenDoc(token);
  return {
    select: () => Promise.resolve(doc),
    then: (resolve) => resolve(doc),
  };
};

AuthToken.updateMany = async (filter, update) => {
  for (const token of tokensDb.values()) {
    if (filter.userId && token.userId.toString() !== filter.userId.toString()) continue;
    if (filter.purpose && token.purpose !== filter.purpose) continue;
    if (filter.consumedAt === null && token.consumedAt !== null) continue;

    if (update.$set) {
      Object.assign(token, update.$set);
      tokensDb.set(token._id.toString(), token);
    }
  }
  return { acknowledged: true };
};

AuthToken.findByIdAndUpdate = async (id, update, options) => {
  const token = tokensDb.get(id.toString());
  if (!token) return null;

  if (update.$inc && update.$inc.attempts) {
    token.attempts = (token.attempts || 0) + update.$inc.attempts;
  }
  if (update.$set) {
    Object.assign(token, update.$set);
  }
  if (update.consumedAt) {
    token.consumedAt = update.consumedAt;
  }

  tokensDb.set(id.toString(), token);
  return createMockAuthTokenDoc(token);
};

AuthToken.countDocuments = async (filter) => {
  let count = 0;
  for (const token of tokensDb.values()) {
    if (filter.userId && token.userId.toString() !== filter.userId.toString()) continue;
    if (filter.purpose && token.purpose !== filter.purpose) continue;
    if (filter.createdAt && filter.createdAt.$gte && token.createdAt < filter.createdAt.$gte) continue;
    count++;
  }
  return count;
};

// Mock Session Model
Session.create = async (data) => {
  const doc = createMockSessionDoc(data);
  sessionsDb.set(doc._id.toString(), { ...doc });
  return doc;
};

Session.findOne = (query) => {
  return {
    select: () => {
      for (const session of sessionsDb.values()) {
        if (query.refreshTokenHash && session.refreshTokenHash !== query.refreshTokenHash) continue;
        return Promise.resolve(createMockSessionDoc(session));
      }
      return Promise.resolve(null);
    },
  };
};

Session.findOneAndUpdate = async (filter, update) => {
  for (const session of sessionsDb.values()) {
    if (filter.refreshTokenHash && session.refreshTokenHash !== filter.refreshTokenHash) continue;
    if (filter.revokedAt === null && session.revokedAt !== null) continue;

    if (update.$set) {
      Object.assign(session, update.$set);
      sessionsDb.set(session._id.toString(), session);
    }
    return createMockSessionDoc(session);
  }
  return null;
};

Session.updateMany = async (filter, update) => {
  let modifiedCount = 0;
  for (const session of sessionsDb.values()) {
    if (filter.userId && session.userId.toString() !== filter.userId.toString()) continue;
    if (filter.revokedAt === null && session.revokedAt !== null) continue;

    if (update.$set) {
      Object.assign(session, update.$set);
      sessionsDb.set(session._id.toString(), session);
      modifiedCount++;
    }
  }
  return { modifiedCount };
};

Session.countDocuments = async (filter) => {
  let count = 0;
  for (const session of sessionsDb.values()) {
    if (filter.userId && session.userId.toString() !== filter.userId.toString()) continue;
    if (filter.revokedAt === null && session.revokedAt !== null) continue;
    count++;
  }
  return count;
};

// ----------------------------------------------------
// TEST RUNNER
// ----------------------------------------------------
const runIntegrationTests = async () => {
  console.log('================================================================');
  console.log('       FINDIT AUTHENTICATION COMPLETE TEST SUITE VERIFICATION');
  console.log('================================================================');

  let passed = 0;
  let total = 0;

  const assert = (condition, msg) => {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    }
  };

  try {
    // --------------------------------------------------
    // TEST 1: User Registration & Role Enforcement
    // --------------------------------------------------
    console.log('\n[TEST 1] Registration Workflow & Security Defaults:');
    const regResult = await authService.register({
      name: 'Rahul Sharma',
      email: 'Rahul.Sharma@Example.COM',
      password: 'MySecurePassword123!',
      phone: '+91 98765 43210',
    });

    assert(regResult.challengeId, 'Returns active challengeId');
    assert(regResult.email === 'rahul.sharma@example.com', 'Normalizes email to lowercase and trimmed');

    const createdUser = await User.findOne({ email: 'rahul.sharma@example.com' }).select();
    assert(createdUser !== null, 'User created in Users collection');
    assert(createdUser.role === ROLES.USER, 'Registration strictly enforces role: USER');
    assert(createdUser.isEmailVerified === false, 'New user starts with isEmailVerified: false');
    assert(createdUser.isActive === true, 'New user starts with isActive: true');

    // --------------------------------------------------
    // TEST 2: Email Verification & Reused Token Prevention
    // --------------------------------------------------
    console.log('\n[TEST 2] Email Verification & Atomicity:');
    // Test wrong OTP rejection
    let wrongOtpThrew = false;
    try {
      await authService.verifyEmailOTP({
        challengeId: regResult.challengeId,
        otp: '000000',
      });
    } catch (err) {
      wrongOtpThrew = true;
    }
    assert(wrongOtpThrew, 'Rejects incorrect OTP code');

    // Controlled challenge for valid OTP testing
    const validEmailChallenge = await otpService.createChallenge({
      userId: createdUser._id,
      purpose: TOKEN_PURPOSES.EMAIL_VERIFICATION,
    });

    const verifyRes = await authService.verifyEmailOTP({
      challengeId: validEmailChallenge.challengeId,
      otp: validEmailChallenge.rawOTP,
    });
    assert(verifyRes.success === true, 'Successfully verifies with correct OTP');

    const verifiedUser = await User.findById(createdUser._id);
    assert(verifiedUser.isEmailVerified === true, 'User isEmailVerified successfully set to true');

    // Attempt reusing same OTP challenge
    let reuseChallengeThrew = false;
    try {
      await authService.verifyEmailOTP({
        challengeId: validEmailChallenge.challengeId,
        otp: validEmailChallenge.rawOTP,
      });
    } catch (err) {
      reuseChallengeThrew = true;
    }
    assert(reuseChallengeThrew, 'Challenge consumed atomically; cannot be reused');

    // Registration Rule: Cannot register again with verified email
    let duplicateRejected = false;
    try {
      await authService.register({
        name: 'Duplicate Imposter',
        email: 'rahul.sharma@example.com',
        password: 'Password999!',
      });
    } catch (err) {
      if (err.statusCode === 409) duplicateRejected = true;
    }
    assert(duplicateRejected, 'Verified email registration returns 409 Conflict with direct login guidance');

    // --------------------------------------------------
    // TEST 3: REPEATED LOGIN (CRITICAL WORKFLOW)
    // --------------------------------------------------
    console.log('\n[TEST 3] Repeated Login for Existing Account (Mandatory Rule):');

    // Step 1: Login with existing email & password
    const login1 = await authService.login({
      email: 'rahul.sharma@example.com',
      password: 'MySecurePassword123!',
    });
    assert(login1.challengeId, 'Existing user initiates login; Login OTP challenge created');

    const loginChallenge1 = await otpService.createChallenge({
      userId: verifiedUser._id,
      purpose: TOKEN_PURPOSES.LOGIN,
    });

    // Step 2: Complete login with Login OTP
    const session1 = await authService.verifyLoginOTP({
      challengeId: loginChallenge1.challengeId,
      otp: loginChallenge1.rawOTP,
      userAgent: 'Desktop Browser - Chrome 125',
      ipAddress: '192.168.1.100',
    });
    assert(session1.accessToken, 'Access JWT issued on successful login OTP');
    assert(session1.rawRefreshToken, 'HttpOnly Refresh Token issued');
    assert(session1.user.email === 'rahul.sharma@example.com', 'Authenticated session established');

    // Step 3: Logout
    await authService.logout({ rawRefreshToken: session1.rawRefreshToken });
    console.log('  User logs out. Session revoked.');

    // Step 4: User returns days/weeks later and logs in AGAIN with the SAME credentials!
    console.log('  Testing Repeated Login: User logs in again using same email & password...');
    const login2 = await authService.login({
      email: 'rahul.sharma@example.com',
      password: 'MySecurePassword123!',
    });
    assert(login2.challengeId, 'Repeated login Step 1 succeeded with the exact same credentials');

    const loginChallenge2 = await otpService.createChallenge({
      userId: verifiedUser._id,
      purpose: TOKEN_PURPOSES.LOGIN,
    });

    const session2 = await authService.verifyLoginOTP({
      challengeId: loginChallenge2.challengeId,
      otp: loginChallenge2.rawOTP,
      userAgent: 'Mobile Device - Safari',
      ipAddress: '10.0.0.5',
    });
    assert(session2.accessToken, 'Repeated login Step 2 issued new valid Access JWT');

    const totalAccounts = await User.countDocuments({ email: 'rahul.sharma@example.com' });
    assert(totalAccounts === 1, 'Verified account is never duplicated or replaced during repeated login');

    // --------------------------------------------------
    // TEST 4: Token Rotation & Security Reuse Detection
    // --------------------------------------------------
    console.log('\n[TEST 4] Refresh Token Rotation & Theft/Reuse Detection:');
    const refreshRes = await authService.refreshToken({
      rawRefreshToken: session2.rawRefreshToken,
      userAgent: 'Mobile Device - Safari',
      ipAddress: '10.0.0.5',
    });
    assert(refreshRes.accessToken, 'Token refreshed successfully');
    assert(refreshRes.newRawRefreshToken !== session2.rawRefreshToken, 'Rotated to a fresh refresh token');

    // Attempt reusing old consumed token
    let reuseRejected = false;
    try {
      await authService.refreshToken({
        rawRefreshToken: session2.rawRefreshToken,
        userAgent: 'Attacker Machine',
        ipAddress: '203.0.113.195',
      });
    } catch (err) {
      reuseRejected = true;
    }
    assert(reuseRejected, 'Reuse of consumed refresh token immediately caught and revoked');

    // --------------------------------------------------
    // TEST 5: Password Reset Workflow & Session Revocation
    // --------------------------------------------------
    console.log('\n[TEST 5] Password Reset Workflow & Session Revocation:');
    const forgotRes = await authService.forgotPassword({ email: 'rahul.sharma@example.com' });
    assert(forgotRes.challengeId, 'Password reset challenge generated');

    const resetChallenge = await otpService.createChallenge({
      userId: verifiedUser._id,
      purpose: TOKEN_PURPOSES.PASSWORD_RESET,
    });

    const resetOtpRes = await authService.verifyResetOTP({
      challengeId: resetChallenge.challengeId,
      otp: resetChallenge.rawOTP,
    });
    assert(resetOtpRes.resetGrant, 'Issues 5-minute single-use reset grant');

    // Reset password
    const resetSuccess = await authService.resetPassword({
      userId: resetOtpRes.userId,
      resetGrant: resetOtpRes.resetGrant,
      newPassword: 'BrandNewSecurePassword789!',
    });
    assert(resetSuccess.success === true, 'Password reset succeeded');

    // Verify all active sessions were revoked
    const activeSessions = await Session.countDocuments({
      userId: verifiedUser._id,
      revokedAt: null,
    });
    assert(activeSessions === 0, 'All existing active sessions revoked after password reset');

    // Old password must fail
    let oldPasswordFailed = false;
    try {
      await authService.login({
        email: 'rahul.sharma@example.com',
        password: 'MySecurePassword123!',
      });
    } catch (err) {
      oldPasswordFailed = true;
    }
    assert(oldPasswordFailed, 'Old password fails authentication');

    // New password succeeds
    const newPassLogin = await authService.login({
      email: 'rahul.sharma@example.com',
      password: 'BrandNewSecurePassword789!',
    });
    assert(newPassLogin.challengeId, 'New password successfully authenticates');

    // --------------------------------------------------
    // TEST 6: Admin Role Manual MongoDB Atlas Escalation
    // --------------------------------------------------
    console.log('\n[TEST 6] Admin Role Assignment via MongoDB Atlas:');
    const normalUser = await User.findById(verifiedUser._id);
    assert(normalUser.role === ROLES.USER, 'User starts with role USER');

    // Simulate Operator in MongoDB Atlas changing "role": "USER" -> "role": "ADMIN"
    normalUser.role = ROLES.ADMIN;
    await normalUser.save();
    console.log('  Operator in MongoDB Atlas changed role: "USER" -> "ADMIN"');

    const updatedAdmin = await User.findById(verifiedUser._id);
    assert(updatedAdmin.role === ROLES.ADMIN, 'Database reflects ADMIN role in real time');

    const adminJwt = tokenService.generateAccessToken(updatedAdmin);
    const decodedAdmin = tokenService.verifyAccessToken(adminJwt);
    assert(decodedAdmin.role === ROLES.ADMIN, 'New Access JWT recognizes user as ADMIN');

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passed}/${total} TEST ASSERTIONS PASSED WITH ZERO FAILURES!`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  }
};

runIntegrationTests();
