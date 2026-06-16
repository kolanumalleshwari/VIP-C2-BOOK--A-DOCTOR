import axios from 'axios';

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'));

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isLocal ? '' : 'https://vip-c2-book-a-doctor.onrender.com'),
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Refresh token rotation interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Guard: Prevent infinite loops if refresh fails or requests fail repeatedly
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('Access token expired. Requesting rotated token pair...');
        const isLocal = typeof window !== 'undefined' && 
          (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'));
        const baseURL = import.meta.env.VITE_API_URL || (isLocal ? '' : 'https://vip-c2-book-a-doctor.onrender.com');
        const res = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken: storedRefreshToken });
        const { accessToken, refreshToken } = res.data;

        // Update local storage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token expired or compromised. Forcing sign-out:', refreshError.message);
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register' &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
