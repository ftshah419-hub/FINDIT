import api from '../../../services/api.js';

export const authApi = {
  /**
   * Register a new account
   */
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  /**
   * Verify email OTP
   */
  async verifyOTP(data) {
    const res = await api.post('/auth/verify-otp', data);
    return res.data;
  },

  /**
   * Resend verification OTP
   */
  async resendOTP(data) {
    const res = await api.post('/auth/resend-otp', data);
    return res.data;
  },

  /**
   * Login credentials check
   */
  async login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  /**
   * Complete login via OTP
   */
  async verifyLoginOTP(data) {
    const res = await api.post('/auth/verify-login-otp', data);
    return res.data;
  },

  /**
   * Refresh access token
   */
  async refresh() {
    const res = await api.post('/auth/refresh');
    return res.data;
  },

  /**
   * Logout current session
   */
  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  /**
   * Logout all device sessions
   */
  async logoutAll() {
    const res = await api.post('/auth/logout-all');
    return res.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  /**
   * Request password reset OTP
   */
  async forgotPassword(data) {
    const res = await api.post('/auth/forgot-password', data);
    return res.data;
  },

  /**
   * Verify password reset OTP
   */
  async verifyResetOTP(data) {
    const res = await api.post('/auth/verify-reset-otp', data);
    return res.data;
  },

  /**
   * Reset password with reset grant
   */
  async resetPassword(data) {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
};
