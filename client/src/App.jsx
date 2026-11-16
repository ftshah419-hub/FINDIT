import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

export function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
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
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <PublicOnlyRoute>
            <VerifyEmailOtpPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/verify-login-otp"
        element={
          <PublicOnlyRoute>
            <VerifyLoginOtpPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
