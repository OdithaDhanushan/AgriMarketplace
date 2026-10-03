import axios from 'axios';

// ⚠️ IMPORTANT: Replace '192.168.8.102' with your laptop's actual IPv4 address!
// (Find it by running 'ipconfig' in Command Prompt)
const BASE_URL = 'http://192.168.8.102:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const createProduce = async (produceData) => {
  const response = await api.post('/produce', produceData);
  return response.data;
};

export default api;