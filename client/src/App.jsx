import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LoginPage } from './features/authentication/pages/LoginPage.jsx';
import { RegisterPage } from './features/authentication/pages/RegisterPage.jsx';
import { VerifyEmailOtpPage } from './features/authentication/pages/VerifyEmailOtpPage.jsx';
import { VerifyLoginOtpPage } from './features/authentication/pages/VerifyLoginOtpPage.jsx';
import { ForgotPasswordPage } from './features/authentication/pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './features/authentication/pages/ResetPasswordPage.jsx';
import { UserDashboardPage } from './features/user/pages/UserDashboardPage.jsx';
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage.jsx';

import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AdminRoute } from './routes/AdminRoute.jsx';
import { PublicOnlyRoute } from './routes/PublicOnlyRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { pageVariants } from './utils/animations.js';

// Animated Route Page Wrapper
const PageTransition = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="w-full min-h-screen"
  >
    {children}
  </motion.div>
);

export function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Authentication Pages */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <PageTransition>
                <LoginPage />
              </PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicOnlyRoute>
              <PageTransition>
                <VerifyEmailOtpPage />
              </PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verify-login-otp"
          element={
            <PublicOnlyRoute>
              <PageTransition>
                <VerifyLoginOtpPage />
              </PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <PageTransition>
                <ForgotPasswordPage />
              </PageTransition>
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <PageTransition>
                <ResetPasswordPage />
              </PageTransition>
            </PublicOnlyRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <UserDashboardPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <PageTransition>
                <AdminDashboardPage />
              </PageTransition>
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
