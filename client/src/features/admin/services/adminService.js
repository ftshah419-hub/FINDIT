import api from '../../../services/api';

const adminService = {
  // Dashboard & Telemetry
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },

  getUser: async (userId) => {
    const res = await api.get(`/admin/users/${userId}`);
    return res.data.data;
  },

  updateUserStatus: async (userId, { isActive, reason }) => {
    const res = await api.patch(`/admin/users/${userId}/status`, { isActive, reason });
    return res.data.data;
  },

  // Items
  getItems: async (params = {}) => {
    const res = await api.get('/admin/items', { params });
    return res.data.data;
  },

  getItem: async (itemId) => {
    const res = await api.get(`/admin/items/${itemId}`);
    return res.data.data;
  },

  reviewItem: async (itemId, { status, rejectionReason }) => {
    const res = await api.patch(`/admin/items/${itemId}/review`, { status, rejectionReason });
    return res.data.data;
  },

  updateItemStatus: async (itemId, { status }) => {
    const res = await api.patch(`/admin/items/${itemId}/status`, { status });
    return res.data.data;
  },

  // Claims
  getClaims: async (params = {}) => {
    const res = await api.get('/admin/claims', { params });
    return res.data.data;
  },

  getClaim: async (claimId) => {
    const res = await api.get(`/admin/claims/${claimId}`);
    return res.data.data;
  },

  reviewClaim: async (claimId, { status, adminNote }) => {
    const res = await api.patch(`/admin/claims/${claimId}/review`, { status, adminNote });
    return res.data.data;
  },

  // Categories
  getCategories: async (params = {}) => {
    const res = await api.get('/admin/categories', { params });
    return res.data.data;
  },

  createCategory: async ({ name, description }) => {
    const res = await api.post('/admin/categories', { name, description });
    return res.data.data;
  },

  updateCategory: async (categoryId, { name, description, isActive }) => {
    const res = await api.patch(`/admin/categories/${categoryId}`, { name, description, isActive });
    return res.data.data;
  },

  // AI Matches
  getAIMatches: async (params = {}) => {
    const res = await api.get('/admin/ai-matches', { params });
    return res.data.data;
  },

  reviewAIMatch: async (matchId, { action, notes }) => {
    const res = await api.patch(`/admin/ai-matches/${matchId}/review`, { action, notes });
    return res.data.data;
  },

  // Complaints / Reports
  getReports: async (params = {}) => {
    const res = await api.get('/admin/reports', { params });
    return res.data.data;
  },

  getReport: async (reportId) => {
    const res = await api.get(`/admin/reports/${reportId}`);
    return res.data.data;
  },

  reviewReport: async (reportId, { status, adminNote }) => {
    const res = await api.patch(`/admin/reports/${reportId}/review`, { status, adminNote });
    return res.data.data;
  },

  // Activity Logs
  getActivityLogs: async (params = {}) => {
    const res = await api.get('/admin/activity-logs', { params });
    return res.data.data;
  },

  exportActivityLogs: async (params = {}) => {
    const res = await api.get('/admin/activity-logs/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  // System Settings
  getSettings: async () => {
    const res = await api.get('/admin/settings');
    return res.data.data;
  },

  updateSetting: async (key, { value, description }) => {
    const res = await api.patch(`/admin/settings/${key}`, { value, description });
    return res.data.data;
  },
};

export default adminService;
