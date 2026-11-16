import axios from 'axios';

let inMemoryToken = null;
let sessionExpiredCallback = null;

export const setInMemoryToken = (token) => {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getInMemoryToken = () => inMemoryToken || localStorage.getItem('token');

export const setSessionExpiredCallback = (callback) => {
  sessionExpiredCallback = callback;
};

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Send HttpOnly refresh cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach in-memory Access JWT or stored token
api.interceptors.request.use(
  (config) => {
    const token = inMemoryToken || localStorage.getItem('token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Set fallback demo user header to ensure uninterrupted dev access
    config.headers['x-demo-user'] = 'alex.chen@campus.edu';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and automatic token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints (login, refresh, register, verify)
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        setInMemoryToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setInMemoryToken(null);
        if (sessionExpiredCallback) {
          sessionExpiredCallback();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred.',
      errorCode: error.response?.data?.errorCode || 'NETWORK_ERROR',
      status: error.response?.status,
    };

    return Promise.reject(customError);
  }
);

export default api;
