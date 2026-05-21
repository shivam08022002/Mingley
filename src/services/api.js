// src/api/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe AsyncStorage wrapper to prevent "Native module is null" errors
const safeStorage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('AsyncStorage not available, using in-memory fallback');
      return global.mockStorage?.[key] || null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('AsyncStorage not available, saving to in-memory');
      if (!global.mockStorage) global.mockStorage = {};
      global.mockStorage[key] = value;
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      if (global.mockStorage) delete global.mockStorage[key];
    }
  }
};

const BASE_URL = 'https://mingley-backend-v2.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// ======================
// REQUEST INTERCEPTOR
// ======================
api.interceptors.request.use(
  async config => {
    try {
      const accessToken = await safeStorage.getItem('accessToken');

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  error => Promise.reject(error),
);


// ======================
// RESPONSE INTERCEPTOR
// AUTO REFRESH TOKEN
// ======================
api.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    // If token expired & request not retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await safeStorage.getItem('refreshToken');

        if (!refreshToken) {
          return Promise.reject(error);
        }

        // Refresh token API
        const response = await axios.post(
          `${BASE_URL}/v1/auth/refresh-token`,
          {
            refreshToken: refreshToken,
          },
        );

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        // Save new tokens
        await safeStorage.setItem(
          'accessToken',
          newAccessToken,
        );

        if (newRefreshToken) {
          await safeStorage.setItem(
            'refreshToken',
            newRefreshToken,
          );
        }

        // Update failed request token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry failed request
        return api(originalRequest);

      } catch (refreshError) {
        // Logout user if refresh token fails
        await safeStorage.removeItem('accessToken');
        await safeStorage.removeItem('refreshToken');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
export { safeStorage };