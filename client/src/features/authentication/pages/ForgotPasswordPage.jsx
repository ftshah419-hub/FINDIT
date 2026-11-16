import React, { useState } from 'react';
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

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await forgotPassword(email);
      navigate('/reset-password', {
        state: { email, challengeId: res.data?.challengeId },
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to request reset. Please try again.';
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
          <h1 className="text-2xl font-bold text-[#101C36] dark:text-[#F8FAFC] tracking-tight">Forgot password?</h1>
          <p className="text-sm text-[#64748B] dark:text-[#A8B5CA] mt-1.5">
            Enter your email to receive a password reset code
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-[#151F30] rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] p-8 shadow-sm hover:shadow-md hover:border-[#2457E8]/30 dark:hover:border-[#4D8DFF]/30 transition-all duration-300"
        >
          {/* Animated Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="forgot-error"
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
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-2"
                htmlFor="email"
              >
                Registered Email
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#64748B] dark:text-[#A8B5CA] group-focus-within:text-[#2457E8] dark:group-focus-within:text-[#4D8DFF] transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1D2A40] border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-sm text-[#101C36] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#A8B5CA] focus:outline-none focus:border-[#2457E8] focus:ring-4 focus:ring-[#2457E8]/10 dark:focus:ring-[#4D8DFF]/15 transition-all duration-200"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                {...buttonTap}
                className="w-full py-2.5 px-4 bg-[#2457E8] hover:bg-[#101C36] dark:hover:bg-[#4D8DFF] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <span>Send Reset Code</span>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Back to Login */}
        <motion.p variants={itemVariants} className="text-center text-xs text-[#64748B] dark:text-[#A8B5CA] mt-6">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#2457E8] dark:text-[#4D8DFF] hover:underline ml-1 inline-block hover:scale-[1.02] transition-transform"
          >
            Back to sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};
