import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext.jsx';
import { AnimatedBackground } from '../../../components/common/AnimatedBackground.jsx';
import {
  containerVariants,
  itemVariants,
  cardVariants,
  buttonTap,
} from '../../../utils/animations.js';

export const UserDashboardPage = () => {
  const { user, logout, logoutAll, refreshUser } = useAuth();

  return (
    <div className="relative min-h-screen bg-[#F4F7FC] dark:bg-[#0B1220] p-6 overflow-hidden">
      <AnimatedBackground />

      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Navigation Bar */}
        <motion.header
          variants={itemVariants}
          className="bg-white/90 dark:bg-[#151F30]/90 backdrop-blur-md rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] px-6 py-4 mb-6 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-[#101C36] dark:bg-[#1D2A40] flex items-center justify-center cursor-pointer shadow-xs"
            >
              <svg className="w-5 h-5 text-[#4D8DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" strokeWidth="2.2" strokeDasharray="3 2" />
                <circle cx="11" cy="11" r="3" fill="#4D8DFF" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 16l4 4" />
              </svg>
            </motion.div>
            <div>
              <span className="text-xl font-extrabold text-[#101C36] dark:text-[#F8FAFC]">
                FIND<span className="text-[#2457E8]">IT</span>
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#2457E8] dark:text-[#79A9FF]">
                User Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={refreshUser}
              {...buttonTap}
              className="px-3 py-1.5 text-xs font-semibold border border-[#DCE4F0] dark:border-[#29364A] rounded-xl hover:bg-[#F4F7FC] dark:hover:bg-[#1D2A40] hover:border-[#2457E8]/30 text-[#101C36] dark:text-[#F8FAFC] transition-colors"
            >
              Refresh Role
            </motion.button>
            <motion.button
              onClick={logout}
              {...buttonTap}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2457E8] hover:bg-[#101C36] text-white rounded-xl transition-colors shadow-sm hover:shadow"
            >
              Log Out
            </motion.button>
          </div>
        </motion.header>

        {/* User Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white/95 dark:bg-[#151F30]/95 backdrop-blur-md rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] p-6 shadow-sm mb-6 hover:border-[#2457E8]/30 dark:hover:border-[#4D8DFF]/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-[#101C36] dark:text-[#F8FAFC]">
              Welcome back, {user?.name}!
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
            </div>
          </div>
          <p className="text-sm text-[#64748B] dark:text-[#A8B5CA] mb-6">
            You are successfully authenticated via FINDIT Common Authentication Module.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-4 bg-[#F4F7FC] dark:bg-[#1D2A40] rounded-xl border border-[#DCE4F0] dark:border-[#29364A] transition-all"
            >
              <span className="text-xs uppercase tracking-wider text-[#64748B] dark:text-[#A8B5CA] font-semibold block mb-1">
                Account Details
              </span>
              <p className="font-semibold text-[#101C36] dark:text-[#F8FAFC]">{user?.name}</p>
              <p className="text-xs text-[#64748B] dark:text-[#A8B5CA] mt-0.5">{user?.email}</p>
              <p className="text-xs text-[#64748B] dark:text-[#A8B5CA] mt-0.5">Phone: {user?.phone || 'Not provided'}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-4 bg-[#F4F7FC] dark:bg-[#1D2A40] rounded-xl border border-[#DCE4F0] dark:border-[#29364A] transition-all"
            >
              <span className="text-xs uppercase tracking-wider text-[#64748B] dark:text-[#A8B5CA] font-semibold block mb-1">
                Security & Role
              </span>
              <p className="font-semibold text-[#101C36] dark:text-[#F8FAFC]">
                Role: <span className="text-[#2457E8] dark:text-[#4D8DFF]">{user?.role}</span>
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Email Verified: {user?.isEmailVerified ? 'Yes' : 'No'}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Account Active: {user?.isActive ? 'Yes' : 'No'}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Session Management Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white/95 dark:bg-[#151F30]/95 backdrop-blur-md rounded-2xl border border-[#DCE4F0] dark:border-[#29364A] p-6 shadow-sm hover:border-[#2457E8]/30 dark:hover:border-[#4D8DFF]/30 transition-all duration-300"
        >
          <h3 className="text-base font-bold text-[#101C36] dark:text-[#F8FAFC] mb-2">
            Multi-Device Session Controls
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#A8B5CA] mb-4">
            FINDIT supports concurrent sessions across multiple devices with secure refresh token rotation.
          </p>
          <div className="flex gap-3">
            <motion.button
              onClick={logoutAll}
              {...buttonTap}
              className="px-4 py-2 text-xs font-semibold border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors shadow-xs"
            >
              Log Out from All Devices
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
