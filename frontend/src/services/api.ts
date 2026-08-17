import axios from 'axios';

// URL do backend Java Spring Boot (altere se precisar)
export const api = axios.create({
  baseURL: 'http://localhost:8080', 
});

// Interceptor: antes de enviar qualquer chamada, injeta o token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@ingresso:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
