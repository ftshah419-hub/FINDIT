import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext.jsx';
import { AnimatedBackground } from '../../../components/common/AnimatedBackground.jsx';
import {
  containerVariants,
  itemVariants,
  cardVariants,
  alertVariants,
  buttonTap,
} from '../../../utils/animations.js';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { verifyResetOTP, resetPassword } = useAuth();

  const [step, setStep] = useState('otp'); // 'otp' | 'newPassword'
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [resetGrant, setResetGrant] = useState(null);
  const [userId, setUserId] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef([]);

  const handleDigitChange = (index, value) => {
    const sanitized = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = sanitized;
    setDigits(newDigits);

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const otpValue = digits.join('');

  // Step 1: Verify OTP and receive reset grant
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits of the reset code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await verifyResetOTP(otpValue);
      if (res.success && res.data?.resetGrant) {
        setResetGrant(res.data.resetGrant);
        setUserId(res.data.userId);
        setStep('newPassword');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Incorrect or expired reset code.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Set New Password
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setError(
        'Password must contain at least 8 characters, including uppercase, lowercase, and numeric characters.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resetPassword({
        userId,
        resetGrant,
        newPassword,
        confirmPassword,
      });

      setSuccessMessage(res.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successfully! Please log in with your new password.' },
        });
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to update password. Reset grant may have expired.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#F4F7FC] dark:bg-[#0B1220] overflow-hidden">
      <AnimatedBackground />

      <motion.div
        className="w-full max-w-[440px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Brand Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="inline-flex items-center gap-3 justify-center mb-3">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-12 h-12 rounded-xl bg-[#101C36] dark:bg-[#1D2A40] flex items-center justify-center shadow-md cursor-pointer border border-[#101C36]/10 dark:border-white/10"
            >
              <svg className="w-6 h-6 text-[#4D8DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" strokeWidth="2.2" strokeDasharray="3 2" />
                <circle cx="11" cy="11" r="3" fill="#4D8DFF" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 16l4 4" />
              </svg>
            </motion.div>
            <span className="text-3xl font-extrabold tracking-tight text-[#101C36] dark:text-[#F8FAFC]">
              FIND<span className="text-[#2457E8]">IT</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#101C36] dark:text-[#F8FAFC] tracking-tight">
            {step === 'otp' ? 'Enter reset code' : 'Set new password'}
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#A8B5CA] mt-1.5">
            {step === 'otp'
              ? 'Enter the 6-digit verification code sent to your email'
              : 'Choose a strong password to secure your account'}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-[#151F30] rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] p-8 shadow-sm hover:shadow-md hover:border-[#2457E8]/30 dark:hover:border-[#4D8DFF]/30 transition-all duration-300"
        >
          {/* Animated Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="reset-error"
                variants={alertVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden mb-5"
              >
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 font-semibold shadow-sm">
                  {error}
                </div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                key="reset-success"
                variants={alertVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden mb-5"
              >
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm">
                  {successMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 'otp' ? (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerifyOTP}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-3 text-center">
                    6-Digit Reset Code
                  </label>
                  <div className="flex justify-between gap-2">
                    {digits.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        whileFocus={{ scale: 1.05 }}
                        transition={{ duration: 0.12 }}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-13 text-center text-xl font-bold rounded-xl border border-[#DCE4F0] dark:border-[#29364A] bg-white dark:bg-[#1D2A40] text-[#101C36] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2457E8] focus:ring-4 focus:ring-[#2457E8]/10 dark:focus:ring-[#4D8DFF]/15 transition-all duration-150 shadow-xs"
                        required
                      />
                    ))}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting || otpValue.length !== 6}
                  {...buttonTap}
                  className="w-full py-2.5 px-4 bg-[#2457E8] hover:bg-[#101C36] dark:hover:bg-[#4D8DFF] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="new-password-step"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSetNewPassword}
                className="space-y-4"
              >
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-1.5"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#64748B] dark:text-[#A8B5CA] group-focus-within:text-[#2457E8] dark:group-focus-within:text-[#4D8DFF] transition-colors duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1D2A40] border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-sm text-[#101C36] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2457E8] focus:ring-4 focus:ring-[#2457E8]/10 dark:focus:ring-[#4D8DFF]/15 transition-all duration-200"
                      placeholder="Enter new password"
                      required
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64748B] dark:text-[#A8B5CA] hover:text-[#101C36] dark:hover:text-[#F8FAFC] transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-1.5"
                    htmlFor="confirmPassword"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#64748B] dark:text-[#A8B5CA] group-focus-within:text-[#2457E8] dark:group-focus-within:text-[#4D8DFF] transition-colors duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1D2A40] border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-sm text-[#101C36] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2457E8] focus:ring-4 focus:ring-[#2457E8]/10 dark:focus:ring-[#4D8DFF]/15 transition-all duration-200"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  {...buttonTap}
                  className="w-full py-2.5 px-4 bg-[#2457E8] hover:bg-[#101C36] dark:hover:bg-[#4D8DFF] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password & Return to Login</span>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Back to Login */}
        <motion.p variants={itemVariants} className="text-center text-xs text-[#64748B] dark:text-[#A8B5CA] mt-6">
          <Link
            to="/login"
            className="font-semibold text-[#2457E8] dark:text-[#4D8DFF] hover:underline inline-block hover:scale-[1.02] transition-transform"
          >
            &larr; Return to Sign In
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};
