import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { UserLayout } from './layouts/UserLayout';

// Auth Pages
import { LoginPage } from './features/authentication/pages/LoginPage.jsx';
import { RegisterPage } from './features/authentication/pages/RegisterPage.jsx';
import { VerifyEmailOtpPage } from './features/authentication/pages/VerifyEmailOtpPage.jsx';
import { VerifyLoginOtpPage } from './features/authentication/pages/VerifyLoginOtpPage.jsx';
import { ForgotPasswordPage } from './features/authentication/pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './features/authentication/pages/ResetPasswordPage.jsx';

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

// Admin Module Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminOverview from './features/admin/pages/AdminOverview';
import UserManagement from './features/admin/pages/UserManagement';
import LostReportManagement from './features/admin/pages/LostReportManagement';
import FoundReportManagement from './features/admin/pages/FoundReportManagement';
import ClaimVerification from './features/admin/pages/ClaimVerification';
import AIMatchingManagement from './features/admin/pages/AIMatchingManagement';
import AnalyticsAndLogs from './features/admin/pages/AnalyticsAndLogs';
import CategoryManagement from './features/admin/pages/CategoryManagement';
import ComplaintManagement from './features/admin/pages/ComplaintManagement';
import SystemSettingsPage from './features/admin/pages/SystemSettingsPage';
import AdminLoginPage from './features/admin/pages/LoginPage';

// Route Guards & Context
import { AdminRoute } from './routes/AdminRoute.jsx';
import { PublicOnlyRoute } from './routes/PublicOnlyRoute.jsx';
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
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Authentication Pages with Smooth Transitions */}
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

        {/* Dedicated Admin Direct Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Module Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="lost-reports" element={<LostReportManagement />} />
          <Route path="found-reports" element={<FoundReportManagement />} />
          <Route path="claims" element={<ClaimVerification />} />
          <Route path="ai-matching" element={<AIMatchingManagement />} />
          <Route path="analytics" element={<AnalyticsAndLogs />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="complaints" element={<ComplaintManagement />} />
          <Route path="settings" element={<SystemSettingsPage />} />
        </Route>

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
    </AnimatePresence>
  );
}

export default App;
