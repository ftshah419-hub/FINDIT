import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { AnimatedBackground } from '../components/common/AnimatedBackground.jsx';
import { buttonTap } from '../utils/animations.js';

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#F4F7FC] dark:bg-[#0B1220] overflow-hidden">
        <AnimatedBackground />
        <div className="w-10 h-10 border-4 border-[#2457E8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#F4F7FC] dark:bg-[#0B1220] overflow-hidden">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-md w-full bg-white dark:bg-[#151F30] border border-[#DCE4F0] dark:border-[#29364A] rounded-2xl p-8 text-center shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 font-bold text-xl border border-red-200 dark:border-red-900">
            !
          </div>
          <h2 className="text-xl font-bold text-[#101C36] dark:text-[#F8FAFC] mb-2">Access Forbidden</h2>
          <p className="text-sm text-[#64748B] dark:text-[#A8B5CA] mb-6">
            Administrator privileges are required to view this area. Your current account role is{' '}
            <span className="font-semibold uppercase text-[#101C36] dark:text-[#F8FAFC]">{user?.role}</span>.
          </p>
          <motion.div {...buttonTap}>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#2457E8] text-white rounded-xl text-sm font-semibold hover:bg-[#101C36] transition-colors shadow-sm"
            >
              Return to User Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return children;
};
