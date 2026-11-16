import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserLayout } from './layouts/UserLayout';

// Auth Pages from Authentication Teammate
import { LoginPage } from './features/authentication/pages/LoginPage.jsx';
import { RegisterPage } from './features/authentication/pages/RegisterPage.jsx';
import { VerifyEmailOtpPage } from './features/authentication/pages/VerifyEmailOtpPage.jsx';
import { VerifyLoginOtpPage } from './features/authentication/pages/VerifyLoginOtpPage.jsx';
import { ForgotPasswordPage } from './features/authentication/pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './features/authentication/pages/ResetPasswordPage.jsx';
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage.jsx';

// User Platform Pages
import { DashboardPage } from './features/user/pages/DashboardPage';
import { BrowseItemsPage } from './features/user/pages/BrowseItemsPage';
import { ReportLostItemPage } from './features/user/pages/ReportLostItemPage';
import { ReportFoundItemPage } from './features/user/pages/ReportFoundItemPage';
import { MyReportsPage } from './features/user/pages/MyReportsPage';
import { MyClaimsPage } from './features/user/pages/MyClaimsPage';
import { AISmartMatchPage } from './features/user/pages/AISmartMatchPage';
import { ItemDetailPage } from './features/user/pages/ItemDetailPage';
import { NotificationsPage } from './features/user/pages/NotificationsPage';
import { ProfilePage } from './features/user/pages/ProfilePage';

// Route Guards
import { AdminRoute } from './routes/AdminRoute.jsx';
import { PublicOnlyRoute } from './routes/PublicOnlyRoute.jsx';

export function App() {
  return (
    <Routes>
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

      {/* Admin Protected Dashboard */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />

      {/* User Platform Layout & Routes */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="items" element={<BrowseItemsPage />} />
        <Route path="browse-items" element={<Navigate to="/items" replace />} />
        <Route path="items/:itemId" element={<ItemDetailPage />} />
        <Route path="report-lost" element={<ReportLostItemPage />} />
        <Route path="report-lost-item" element={<Navigate to="/report-lost" replace />} />
        <Route path="report-found" element={<ReportFoundItemPage />} />
        <Route path="report-found-item" element={<Navigate to="/report-found" replace />} />
        <Route path="my-reports" element={<MyReportsPage />} />
        <Route path="my-claims" element={<MyClaimsPage />} />
        <Route path="ai-matches" element={<AISmartMatchPage />} />
        <Route path="ai-smart-match" element={<Navigate to="/ai-matches" replace />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
