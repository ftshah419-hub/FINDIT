import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { UserLayout } from './layouts/UserLayout';

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

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* User Platform Layout */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<DashboardPage />} />
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
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
