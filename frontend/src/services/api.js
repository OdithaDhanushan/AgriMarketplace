import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Automatically detect host IP from Expo debugger/hostUri if available
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.manifest?.debuggerHost;
const hostIp = debuggerHost ? debuggerHost.split(':')[0] : '10.223.25.41';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${hostIp}:5000/api`);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const createProduce = async (produceData) => {
  const response = await api.post('/produce', produceData);
  return response.data;
};

export const getProduceList = async () => {
  const response = await api.get('/produce');
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export default api;