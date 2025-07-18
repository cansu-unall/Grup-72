import axios from 'axios';

// Backend sunucunuzun adresini buraya girin.
const API_URL = 'http://localhost:8000'; // Örnek URL, kendi backend adresinizle değiştirin.

const api = axios.create({
  baseURL: API_URL,
});

// Token'ı her isteğe otomatik eklemek için interceptor (isteğe bağlı ama önerilir)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;