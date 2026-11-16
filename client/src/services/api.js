import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('findit_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error formatting and 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    const errorCode = error.response?.data?.errorCode || 'API_ERROR';

    if (error.response?.status === 401) {
      // Clear invalid session
      localStorage.removeItem('findit_admin_token');
      localStorage.removeItem('findit_admin_user');
      // If not already on login, redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject({
      status: error.response?.status || 500,
      message,
      errorCode,
      originalError: error,
    });
  }
);

export default api;
