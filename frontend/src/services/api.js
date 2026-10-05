import axios from 'axios';
import { Platform } from 'react-native';

// 🌟 On Web: Uses reliable 'localhost'. On iPhone: Uses your Wi-Fi IP!
const BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : 'http://192.168.1.29:5000/api'; // Replace with phone Wi-Fi IP if on mobile

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

export const createProduce = async (produceData) => {
  const response = await api.post('/produce', produceData);
  return response.data;
};

export const getProduceList = async () => {
  const response = await api.get('/produce');
  return response.data;
};

export default api;