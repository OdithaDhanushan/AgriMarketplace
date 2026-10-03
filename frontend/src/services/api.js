import axios from 'axios';

// ✅ YOUR REAL LAPTOP IP:
const BASE_URL = 'http://192.168.1.20:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const createProduce = async (produceData) => {
  const response = await api.post('/produce', produceData);
  return response.data;
};

export default api;