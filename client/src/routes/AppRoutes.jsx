import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import AdminOverview from '../features/admin/pages/AdminOverview';
import UserManagement from '../features/admin/pages/UserManagement';
import LostReportManagement from '../features/admin/pages/LostReportManagement';
import FoundReportManagement from '../features/admin/pages/FoundReportManagement';
import ClaimVerification from '../features/admin/pages/ClaimVerification';
import AIMatchingManagement from '../features/admin/pages/AIMatchingManagement';
import AnalyticsAndLogs from '../features/admin/pages/AnalyticsAndLogs';
import CategoryManagement from '../features/admin/pages/CategoryManagement';
import ComplaintManagement from '../features/admin/pages/ComplaintManagement';
import SystemSettingsPage from '../features/admin/pages/SystemSettingsPage';
import LoginPage from '../features/admin/pages/LoginPage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Authenticating administrative session..." />;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Module Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
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

      {/* Redirect root to admin dashboard */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AppRoutes;
