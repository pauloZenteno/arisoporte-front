import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import axios from 'axios';
import api from './api';

const API_URL = 'https://arierp.com/api'; 

export const login = async (username, password) => {
  const response = await api.post('/administration/AdminUsers/admin-login', {
    username,
    password
  });
  return response.data;
};

export const storeUserCredentials = async (username, password) => {
  await SecureStore.setItemAsync('savedUsername', username);
  await SecureStore.setItemAsync('savedPassword', password);
};

export const getUserCredentials = async () => {
  const username = await SecureStore.getItemAsync('savedUsername');
  const password = await SecureStore.getItemAsync('savedPassword');
  return { username, password };
};

export const setSession = async (accessToken, refreshToken) => {
  if (accessToken) {
    await SecureStore.setItemAsync('accessToken', accessToken);
  } else {
    await SecureStore.deleteItemAsync('accessToken');
  }

  if (refreshToken) {
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  } else {
    await SecureStore.deleteItemAsync('refreshToken');
  }
};

export const setUserInfo = async (user) => {
  if(user) {
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
      if (user.id) {
        await SecureStore.setItemAsync('userId', user.id.toString());
      }
  }
};

export const getUserInfo = async () => {
  const json = await SecureStore.getItemAsync('userInfo');
  try {
    return json ? JSON.parse(json) : null;
  } catch (e) {
    return null;
  }
};

export const clearSession = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
};

export const clearFullStorage = async () => {
  await clearSession(); 
  await SecureStore.deleteItemAsync('userInfo');
  await SecureStore.deleteItemAsync('userId');
  await SecureStore.deleteItemAsync('savedUsername');
  await SecureStore.deleteItemAsync('savedPassword');
};

export const logout = async () => {
  await clearSession();
};

export const checkBiometricSupport = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const authenticateWithBiometrics = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Valida tu identidad',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false, 
    });
    return result.success;
  } catch (error) {
    return false;
  }
};

export const refreshSession = async (currentAccessToken, currentRefreshToken) => {
  try {
    const userId = await SecureStore.getItemAsync('userId');
    if (!userId) throw new Error('No UserId found');

    const response = await axios.post(
      `${API_URL}/administration/AdminUsers/${userId}/refreshTokenMobile`,
      {
        accessToken: currentAccessToken || "",
        refreshToken: currentRefreshToken,
        expiresAt: new Date().toISOString()
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const performSilentLogin = async () => {
  try {
    const { username, password } = await getUserCredentials();
    
    if (username && password) {
      const data = await login(username, password);
      await setSession(data.accessToken, data.refreshToken);
      return data.accessToken;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const validateStartupSession = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const currentAccessToken = await SecureStore.getItemAsync('accessToken');

    if (!refreshToken) {
      return false;
    }

    const data = await refreshSession(currentAccessToken, refreshToken);

    if (data && data.accessToken) {
      await setSession(data.accessToken, data.refreshToken);
      return true;
    }
    
    return false;

  } catch (error) {
    const newAccessToken = await performSilentLogin();
    return !!newAccessToken;
  }
};