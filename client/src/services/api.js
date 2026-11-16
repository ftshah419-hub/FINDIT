import axios from 'axios';

let inMemoryToken = null;
let sessionExpiredCallback = null;

export const setInMemoryToken = (token) => {
  inMemoryToken = token;
};

export const getInMemoryToken = () => inMemoryToken;

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

// Request Interceptor: Attach in-memory Access JWT
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${inMemoryToken}`;
    }
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
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/refresh') ||
      originalRequest.url.includes('/auth/register');

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

    return Promise.reject(error);
  }
);

export default api;
