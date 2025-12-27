import * as SecureStore from 'expo-secure-store';
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
};

export const getUserInfo = async () => {
  const json = await SecureStore.getItemAsync('userInfo');
  return json ? JSON.parse(json) : null;
};

export const clearSession = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('userInfo');
};