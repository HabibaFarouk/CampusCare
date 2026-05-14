import axios from 'axios';
import { storage } from '../utils/secureStorage';
import { API_BASE_URL } from '../config/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Module-level callback set by AuthContext to handle session expiry
let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// Request interceptor to add JWT token
client.interceptors.request.use(
  async (config) => {
    const token = await storage.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default client;
