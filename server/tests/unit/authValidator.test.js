import { validateRegister, validateLogin, validateOTP, validateResetPassword } from '../../src/validators/authValidator.js';

const runValidatorUnitTests = () => {
  console.log('--- RUNNING AUTH VALIDATOR UNIT TESTS ---');

  // Helper mock for express req, res, next
  const createMock = (body) => {
    let statusCode = null;
    let jsonResult = null;
    let nextCalled = false;

    const req = { body };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };
    const next = () => {
      nextCalled = true;
    };

    return { req, res, next, getStatus: () => statusCode, getJson: () => jsonResult, wasNextCalled: () => nextCalled };
  };

  // Test 1: Register with weak password
  const t1 = createMock({
    name: 'Test User',
    email: 'test@example.com',
    password: 'weak',
    confirmPassword: 'weak',
  });
  validateRegister(t1.req, t1.res, t1.next);
  if (t1.getStatus() !== 400 || !t1.getJson().message.includes('8 characters')) {
    throw new Error('Weak password validation failed');
  }
  console.log('  ✓ PASS: Registration rejects weak password (< 8 chars)');

  // Test 2: Register with role injection (attempts to pass role: 'ADMIN')
  const t2 = createMock({
    name: 'Hacker User',
    email: 'hacker@example.com',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    role: 'ADMIN',
  });
  validateRegister(t2.req, t2.res, t2.next);
  if (!t2.wasNextCalled() || t2.req.body.role !== undefined) {
    throw new Error('Role injection sanitizer failed');
  }
  console.log('  ✓ PASS: Registration strips role field and prevents ADMIN injection');

  // Test 3: Password mismatch
  const t3 = createMock({
    name: 'Rahul',
    email: 'rahul@example.com',
    password: 'Password123!',
    confirmPassword: 'Password456!',
  });
  validateRegister(t3.req, t3.res, t3.next);
  if (t3.getStatus() !== 400 || !t3.getJson().message.includes('do not match')) {
    throw new Error('Password mismatch detection failed');
  }
  console.log('  ✓ PASS: Registration rejects mismatched confirm password');

  // Test 4: OTP Validator with invalid format
  const t4 = createMock({
    challengeId: '66e1234567890abcdef12345',
    otp: '123a',
  });
  validateOTP(t4.req, t4.res, t4.next);
  if (t4.getStatus() !== 400) {
    throw new Error('Invalid OTP validation failed');
  }
  console.log('  ✓ PASS: OTP validator rejects non-6-digit input');

  console.log('--- AUTH VALIDATOR UNIT TESTS PASSED ---\n');
};

runValidatorUnitTests();
