import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import api from './api';

export const login = async (username, password) => {
  const response = await api.post('/administration/Users/login', {
    username,
    password
  });
  return response.data;
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
  await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
  if (user && user.id) {
    await SecureStore.setItemAsync('userId', user.id.toString());
  }
};

export const getUserInfo = async () => {
  const json = await SecureStore.getItemAsync('userInfo');
  return json ? JSON.parse(json) : null;
};

// Función interna para BORRADO TOTAL
const clearAllData = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('userInfo');
  await SecureStore.deleteItemAsync('userId');
};

export const clearSession = async () => {
  await clearAllData();
};

export const logout = async () => {
  return; 
};

export const checkBiometricSupport = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const authenticateWithBiometrics = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Ingresa para continuar',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false, 
    });
    return result.success;
  } catch (error) {
    return false;
  }
};