import { create } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Automatically detect host IP from Expo debugger/hostUri if available
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.manifest?.debuggerHost;
const hostIp = debuggerHost ? debuggerHost.split(':')[0] : '10.223.25.41';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${hostIp}:5000/api`);

const api = create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

export const createProduce = async (produceData) => {
  const response = await api.post('/produce', produceData);
  return response.data;
};

export const getProduceList = async () => {
  const response = await api.get('/produce');
  return response.data;
};

export const getMyProduceList = async () => {
  const response = await api.get('/produce/mine');
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  if (response.data?.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  if (response.data?.token) {
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/me', profileData);
  return response.data;
};

export const deleteCurrentUser = async () => {
  const response = await api.delete('/users/me');
  return response.data;
};

// Admin API Services
export const getAdminMetrics = async () => {
  const response = await api.get('/admin/metrics');
  return response.data;
};

export const getAdminOrders = async (params = {}) => {
  const response = await api.get('/admin/orders', { params });
  return response.data;
};

export const updateAdminOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getAdminProduce = async (params = {}) => {
  const response = await api.get('/admin/produce', { params });
  return response.data;
};

export const deleteAdminProduce = async (produceId) => {
  const response = await api.delete(`/admin/produce/${produceId}`);
  return response.data;
};

export default api;