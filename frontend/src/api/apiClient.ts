import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your actual backend URL. For local development, this might be your IP address.
const API_URL = 'http://192.168.1.100:3000'; // IMPORTANT: Use your machine's local IP

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// Injects the JWT token into the authorization header of every request if it exists.
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// Handles global responses, specifically for unauthorized errors to log the user out.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the token is expired or invalid, log the user out.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Session expired. Logging out.');
      // Here we would trigger a logout action from our state management
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      // This should trigger a state change that redirects to the Login screen.
    }

    // Extract a meaningful error message for the UI to display.
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject({ ...error, message });
  }
);

export default apiClient;
