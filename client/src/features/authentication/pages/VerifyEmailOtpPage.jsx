import React, { useState, useEffect, useRef } from 'react';
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

export const VerifyEmailOtpPage = () => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);
  const { pendingChallenge, verifyEmailOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

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

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;

    const newDigits = [...digits];
    for (let i = 0; i < paste.length; i++) {
      newDigits[i] = paste[i];
    }
    setDigits(newDigits);
    const nextIndex = Math.min(paste.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const otpValue = digits.join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await verifyEmailOTP(otpValue);
      setSuccessMessage(res.message || 'Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Email verified successfully! You can now log in using your password.' },
        });
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Incorrect or expired verification code.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setResending(true);

    try {
      await resendOTP();
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend code. Please try again.';
      setError(msg);
      if (err.response?.data?.secondsLeft) {
        setCooldown(err.response.data.secondsLeft);
      }
    } finally {
      setResending(false);
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
          <h1 className="text-2xl font-bold text-[#101C36] dark:text-[#F8FAFC] tracking-tight">Verify your email</h1>
          <p className="text-sm text-[#64748B] dark:text-[#A8B5CA] mt-1.5">
            We sent a 6-digit confirmation code to{' '}
            <span className="font-semibold text-[#101C36] dark:text-[#F8FAFC]">
              {pendingChallenge?.email || 'your email'}
            </span>
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
                key="verify-error"
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
                key="verify-success"
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-3 text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
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
            </motion.div>

            <motion.div variants={itemVariants}>
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
                  <span>Confirm Verification</span>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Resend Cooldown */}
          <motion.div variants={itemVariants} className="mt-6 text-center text-xs text-[#64748B] dark:text-[#A8B5CA]">
            Didn't receive the email?{' '}
            {cooldown > 0 ? (
              <span className="font-semibold text-[#101C36] dark:text-[#F8FAFC]">
                Resend code in {cooldown}s
              </span>
            ) : (
              <motion.button
                type="button"
                onClick={handleResend}
                disabled={resending}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="font-semibold text-[#2457E8] dark:text-[#4D8DFF] hover:underline cursor-pointer disabled:opacity-60"
              >
                {resending ? 'Sending...' : 'Resend code now'}
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* Back to Login */}
        <motion.p variants={itemVariants} className="text-center text-xs text-[#64748B] dark:text-[#A8B5CA] mt-6">
          Need to change email or sign in?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#2457E8] dark:text-[#4D8DFF] hover:underline ml-1 inline-block hover:scale-[1.02] transition-transform"
          >
            Back to login
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};
