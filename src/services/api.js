import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://arierp.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (originalRequest.url.includes('/admin-login') || originalRequest.url.includes('/refreshTokenMobile')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const userId = await SecureStore.getItemAsync('userId');
        const currentRefreshToken = await SecureStore.getItemAsync('refreshToken');
        const currentAccessToken = await SecureStore.getItemAsync('accessToken');

        if (userId && currentRefreshToken) {
          const refreshResponse = await axios.post(
            `${API_URL}/administration/AdminUsers/${userId}/refreshTokenMobile`,
            {
              accessToken: currentAccessToken || "",
              refreshToken: currentRefreshToken,
              expiresAt: new Date().toISOString()
            },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

          if (newAccessToken) {
            await SecureStore.setItemAsync('accessToken', newAccessToken);
            
            if (newRefreshToken) {
              await SecureStore.setItemAsync('refreshToken', newRefreshToken);
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            
            return api(originalRequest);
          }
        }
        throw new Error('Refresh failed');
      } catch (refreshError) {
        try {
          const authService = require('./authService');
          const newAccessToken = await authService.performSilentLogin();

          if (newAccessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (silentLoginError) {
          const authService = require('./authService');
          await authService.clearSession();
          return Promise.reject(silentLoginError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;