import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { AnimatedBackground } from '../components/common/AnimatedBackground.jsx';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#F4F7FC] dark:bg-[#0B1220] overflow-hidden">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4 p-8"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[#101C36] dark:bg-[#1D2A40] flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-[#4D8DFF] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" strokeWidth="2.2" strokeDasharray="3 2" />
                <circle cx="11" cy="11" r="3" fill="#4D8DFF" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 16l4 4" />
              </svg>
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-[#2457E8]/20 blur-md -z-10 animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-sm font-semibold tracking-tight text-[#101C36] dark:text-[#F8FAFC]">
              FIND<span className="text-[#2457E8]">IT</span>
            </span>
            <p className="text-xs text-[#64748B] dark:text-[#A8B5CA]">Verifying session...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
