import api from '../../../services/api';

export const userService = {
  async getDashboardStats() {
    return await api.get('/users/dashboard-stats');
  },

  async getProfile() {
    return await api.get('/users/me');
  },

  async updateProfile(data) {
    return await api.patch('/users/me', data);
  },

  async changePassword(data) {
    return await api.post('/users/change-password', data);
  },
};
