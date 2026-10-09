import axios from 'axios';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0] || '10.100.108.143';
const BASE_URL = `http://${debuggerHost}:5000/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const createProduce = async (produceData) => {
  const response = await api.post('/produce', produceData);
  return response.data;
};

export default api;