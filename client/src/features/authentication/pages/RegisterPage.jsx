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

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculations
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const strengthScore = [hasLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAlreadyRegistered(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strengthScore < 4) {
      setError('Password must contain at least 8 characters, including uppercase, lowercase, and numeric characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({ name, email, password, confirmPassword, phone });
      if (res.success) {
        navigate('/verify-email');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed. Please check the fields and try again.';
      setError(message);

      if (err.response?.data?.errorCode === 'EMAIL_ALREADY_REGISTERED') {
        setIsAlreadyRegistered(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#F4F7FC] dark:bg-[#0B1220] overflow-hidden">
      <AnimatedBackground />

      <motion.div
        className="w-full max-w-[460px]"
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
          <h1 className="text-2xl font-bold text-[#101C36] dark:text-[#F8FAFC] tracking-tight">Create your account</h1>
          <p className="text-sm text-[#64748B] dark:text-[#A8B5CA] mt-1.5">
            Join FINDIT to report and recover lost belongings
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-[#151F30] rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] p-8 shadow-sm hover:shadow-md hover:border-[#2457E8]/30 dark:hover:border-[#4D8DFF]/30 transition-all duration-300"
        >
          {/* Animated Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="register-error"
                variants={alertVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden mb-5"
              >
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 shadow-sm">
                  <p className="font-semibold">{error}</p>
                  {isAlreadyRegistered && (
                    <div className="mt-3">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1 font-semibold text-white bg-[#2457E8] px-3 py-1.5 rounded-lg text-xs hover:bg-[#101C36] transition-colors"
                      >
                        Go to Login Page &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <motion.div variants={itemVariants}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-1.5"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#64748B] dark:text-[#A8B5CA] group-focus-within:text-[#2457E8] dark:group-focus-within:text-[#4D8DFF] transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1D2A40] border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-sm text-[#101C36] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#A8B5CA] focus:outline-none focus:border-[#2457E8] focus:ring-4 focus:ring-[#2457E8]/10 dark:focus:ring-[#4D8DFF]/15 transition-all duration-200"
                  placeholder="Rahul Sharma"
                  required
                />
              </div>
            </motion.div>

            {/* Email Address */}
            <motion.div variants={itemVariants}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-1.5"
                htmlFor="email"
              >
                Email Address
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
                  placeholder="rahul@example.com"
                  required
                />
              </div>
            </motion.div>

            {/* Phone Number */}
            <motion.div variants={itemVariants}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-1.5"
                htmlFor="phone"
              >
                Phone Number <span className="text-[10px] lowercase text-[#64748B] font-normal">(optional)</span>
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#64748B] dark:text-[#A8B5CA] group-focus-within:text-[#2457E8] dark:group-focus-within:text-[#4D8DFF] transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1D2A40] border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-sm text-[#101C36] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#A8B5CA] focus:outline-none focus:border-[#2457E8] focus:ring-4 focus:ring-[#2457E8]/10 dark:focus:ring-[#4D8DFF]/15 transition-all duration-200"
                  placeholder="+91 98765 43210"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-1.5"
                htmlFor="password"
              >
                Password
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
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1D2A40] border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-sm text-[#101C36] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#A8B5CA] focus:outline-none focus:border-[#2457E8] focus:ring-4 focus:ring-[#2457E8]/10 dark:focus:ring-[#4D8DFF]/15 transition-all duration-200"
                  placeholder="Create a strong password"
                  required
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64748B] dark:text-[#A8B5CA] hover:text-[#101C36] dark:hover:text-[#F8FAFC] transition-colors"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showPassword ? (
                      <motion.div
                        key="hide-reg"
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
                        key="show-reg"
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

              {/* Animated Password strength progress bar */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 space-y-1 overflow-hidden"
                >
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          step <= strengthScore
                            ? strengthScore <= 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#A8B5CA]">
                    Requires 8+ chars with uppercase, lowercase, and numeric digits.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[#101C36] dark:text-[#F8FAFC] mb-1.5"
                htmlFor="confirmPassword"
              >
                Confirm Password
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
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1D2A40] border border-[#DCE4F0] dark:border-[#29364A] rounded-xl text-sm text-[#101C36] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#A8B5CA] focus:outline-none focus:border-[#2457E8] focus:ring-4 focus:ring-[#2457E8]/10 dark:focus:ring-[#4D8DFF]/15 transition-all duration-200"
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                {...buttonTap}
                className="group w-full py-2.5 px-4 bg-[#2457E8] hover:bg-[#101C36] dark:hover:bg-[#4D8DFF] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Account</span>
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
        </motion.div>

        {/* Login Link */}
        <motion.p variants={itemVariants} className="text-center text-xs text-[#64748B] dark:text-[#A8B5CA] mt-6">
          Already have a FINDIT account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#2457E8] dark:text-[#4D8DFF] hover:underline ml-1 inline-block hover:scale-[1.02] transition-transform"
          >
            Sign in now
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};
