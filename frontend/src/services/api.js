import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : 'http://192.168.1.29:5000/api');

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