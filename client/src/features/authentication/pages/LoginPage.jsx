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
  ssoButtonTap,
} from '../../../utils/animations.js';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ssoMessage, setSsoMessage] = useState('');

  const { login, setPendingChallenge } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSsoMessage('');
    setIsSubmitting(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/verify-login-otp');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to sign in. Please check your credentials.';
      setError(message);

      if (err.response?.data?.errorCode === 'EMAIL_NOT_VERIFIED') {
        setPendingChallenge({
          email: email.trim().toLowerCase(),
          purpose: 'EMAIL_VERIFICATION',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSsoClick = (provider) => {
    setSsoMessage(`${provider} authentication is coming soon. Please use email and password.`);
    setTimeout(() => setSsoMessage(''), 4000);
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
        {/* Brand Mark Header */}
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
          <h1 className="text-2xl font-bold text-[#101C36] dark:text-[#F8FAFC] tracking-tight">Welcome back</h1>
          <p className="text-sm text-[#64748B] dark:text-[#A8B5CA] mt-1.5">
            Sign in to report belongings or review claims
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-[#151F30] rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] p-8 shadow-sm hover:shadow-md hover:border-[#2457E8]/30 dark:hover:border-[#4D8DFF]/30 transition-all duration-300"
        >
          {/* Animated Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="login-error"
                variants={alertVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden mb-5"
              >
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 shadow-sm">
                  <p className="font-semibold">{error}</p>
                  {error.includes('Email verification is required') && (
                    <Link
                      to="/verify-email"
                      className="mt-2 inline-block font-semibold underline text-[#2457E8] dark:text-[#4D8DFF] hover:opacity-80 transition-opacity"
                    >
                      Click here to verify your email now &rarr;
                    </Link>
                  )}
                </div>
              </motion.div>
            )}

            {ssoMessage && (
              <motion.div
                key="login-sso"
                variants={alertVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden mb-5"
              >
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300 shadow-sm">
                  {ssoMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-2"
                htmlFor="email"
              >
                Email address
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
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC]"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#2457E8] dark:text-[#4D8DFF] hover:text-[#101C36] dark:hover:text-[#F8FAFC] transition-colors duration-150"
                >
                  Forgot password?
                </Link>
              </div>
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
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1D2A40] border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-sm text-[#101C36] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#A8B5CA] focus:outline-none focus:border-[#2457E8] focus:ring-4 focus:ring-[#2457E8]/10 dark:focus:ring-[#4D8DFF]/15 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64748B] dark:text-[#A8B5CA] hover:text-[#101C36] dark:hover:text-[#F8FAFC] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showPassword ? (
                      <motion.div
                        key="hide"
                        initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 20, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                          />
                        </svg>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="show"
                        initial={{ opacity: 0, rotate: 20, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -20, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-[#DCE4F0] text-[#2457E8] focus:ring-2 focus:ring-[#2457E8]/20 transition-all cursor-pointer"
                />
                <span className="ml-2 text-xs font-medium text-[#64748B] dark:text-[#A8B5CA] group-hover:text-[#101C36] dark:group-hover:text-[#F8FAFC] transition-colors">
                  Remember this device for 30 days
                </span>
              </label>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                {...buttonTap}
                className="group w-full py-2.5 px-4 bg-[#2457E8] hover:bg-[#101C36] dark:hover:bg-[#4D8DFF] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to FINDIT</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Institutional SSO */}
          <motion.div variants={itemVariants} className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DCE4F0] dark:border-[#29364A]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-[#151F30] text-[#64748B] dark:text-[#A8B5CA]">
                Institutional SSO
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              {...ssoButtonTap}
              onClick={() => handleSsoClick('Campus ID')}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-xs font-semibold text-[#101C36] dark:text-[#F8FAFC] hover:bg-[#F4F7FC] dark:hover:bg-[#1D2A40] hover:border-[#2457E8]/30 transition-all duration-200 shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4 text-[#2457E8]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              Campus ID
            </motion.button>
            <motion.button
              type="button"
              {...ssoButtonTap}
              onClick={() => handleSsoClick('Google SSO')}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-xs font-semibold text-[#101C36] dark:text-[#F8FAFC] hover:bg-[#F4F7FC] dark:hover:bg-[#1D2A40] hover:border-[#2457E8]/30 transition-all duration-200 shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4 text-[#101C36] dark:text-[#F8FAFC]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Google SSO
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Register Link */}
        <motion.p variants={itemVariants} className="text-center text-xs text-[#64748B] dark:text-[#A8B5CA] mt-6">
          Don't have a FINDIT account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#2457E8] dark:text-[#4D8DFF] hover:underline ml-1 inline-block hover:scale-[1.02] transition-transform"
          >
            Register now
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};
